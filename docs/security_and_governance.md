# Security and Governance — StandX Procurement Standards Engine

> **Scope**: This document covers the security architecture, governance controls, and operational procedures required for a government-adjacent deployment of the StandX recommendation engine. It does not constitute a formal ISMS or VAPT report; a formal audit by a CERT-In empanelled agency is required before any production deployment handling classified or sensitive procurement data.

---

## 1. Data residency and offline operation

### Why fully on-premise matters for government procurement data

Procurement specifications, tender schedules, and bid terms are **government-sensitive information** even before they are officially published. They may reference strategic infrastructure projects, defence-adjacent supply chains, or quantities that reveal planning intent. Sending this text to any cloud API — including embedding APIs — creates the following risks:

| Risk | Cloud API exposure | On-premise mitigation |
|---|---|---|
| Pre-publication disclosure | Tender text logged by third-party provider | All inference runs locally; no outbound socket after startup |
| Data sovereignty | Storage/processing outside Indian jurisdiction | Docker Compose runs entirely on the department's own server |
| Model prompt injection | Attacker crafts tender to extract training data | Model weights are read-only local files; no stateful session |
| Vendor lock-in / API outage | Procurement halts if API is unavailable | Fully offline; operates on LAN or air-gap |
| Audit trail completeness | Provider-side logs are inaccessible | Every query committed to local PostgreSQL before response returns |

**Design decisions enforcing data residency** (all implemented):

1. `HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1` are set in the Dockerfile; any attempt to download model weights at runtime raises an error rather than silently fetching.
2. `PostgresAudit.__init__` enforces that `DATABASE_URL` resolves to a loopback or internal-Docker hostname. A remote DSN is rejected at startup, not runtime.
3. The Qdrant and Neo4j containers are on an `internal: true` Docker network — they have no internet route even if the host has one.
4. `HF_HUB_DISABLE_TELEMETRY=1` prevents the HuggingFace library from calling home.
5. The recommendation engine raises `InvalidQuery` rather than truncating silently — tender text is never sent to a model without the caller knowing the exact character count.

### Network isolation diagram

```
┌─────────────────────────────────────────────────────────┐
│  Department LAN / air-gap network                       │
│                                                         │
│  ┌──────────┐    HTTPS/443    ┌──────────────────────┐  │
│  │ Officer  │────────────────▶│ nginx TLS terminator │  │
│  │ Browser  │                 │  (on-prem)           │  │
│  └──────────┘                 └──────────┬───────────┘  │
│                                          │ HTTP loopback │
│                               ┌──────────▼───────────┐  │
│                               │  FastAPI (port 8000) │  │
│                               │  Docker internal net │  │
│                               └──┬──────┬──────┬────┘  │
│                                  │      │      │        │
│                           Postgres Qdrant  Neo4j        │
│                           (all internal, no NAT)        │
│                                                         │
│  ✗ No outbound internet connection required or allowed  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Role-based access control design

The current API uses a flat API-key model (`API_KEYS_JSON`). A production deployment requires three distinct roles mapped to the RBAC model below.

### 2.1 Role definitions

| Role | Description | Allowed operations |
|---|---|---|
| **procurement_officer** | Submits specifications, views results | `POST /v1/recommend`, `GET /v1/standards/*`, `POST /v1/feedback` |
| **admin** | Manages keys, triggers ETL, views system health | All officer operations + `GET /v1/health`, `POST /v1/admin/etl-trigger`, key rotation |
| **auditor** | Read-only access to audit logs and recommendation history | `GET /v1/audit/recommendations`, `GET /v1/audit/feedback` — no write operations |

### 2.2 Implementation path (current → production)

**Current state**: `API_KEYS_JSON` maps `officer_id → secret`; all keys have equal privileges.

**Phase 1 upgrade** (minimal, no SSO required): extend `API_KEYS_JSON` to include a role field:
```json
{
  "officer_001": {"secret": "…", "role": "procurement_officer"},
  "admin_001":   {"secret": "…", "role": "admin"},
  "auditor_001": {"secret": "…", "role": "auditor"}
}
```
Update `authorize()` in `services/api/app.py` to check `request.state.role` against a per-endpoint allowlist. No SSO required; role is resolved from the key at request time.

**Phase 2 upgrade** (recommended for multi-department deployment): integrate an institutional IdP via OAuth2/OIDC (LDAP, NIC NeSL, or an on-prem Keycloak instance). Map LDAP group membership to StandX roles. API key authentication remains as a machine-to-machine fallback. This requires an NIC NeSL or equivalent on-premises IdP; see §5 for the pilot-readiness checklist.

### 2.3 Principle of least privilege — current enforcement

- The `standards` PostgreSQL user has `INSERT` on `kb.recommendations_log` and `kb.user_feedback` but no `DROP`, `TRUNCATE`, or `CREATE` privileges (managed by the initialiser script).
- The API container runs as UID 10001 (`standards`) with no Linux capabilities beyond the default set.
- Model files are mounted read-only (`./models:/app/models:ro`).
- The `internal: true` Docker network prevents any container from initiating outbound connections.

---

## 3. Audit logging

### 3.1 What is logged and where

Every action that could affect a procurement decision is durably committed to `kb.recommendations_log` or `kb.user_feedback` in PostgreSQL **before** the HTTP response is returned to the caller. There is no in-memory fallback; if the audit write fails, the request fails (see `PostgresAudit.append` in `services/recommendation/audit.py`).

| Event | Table | Key fields |
|---|---|---|
| Recommendation query | `kb.recommendations_log` | `id`, `actor` (from HTTP request state), `query_text`, `status`, `scores` (IS numbers + confidence), `results` (full response JSON), `kb_fingerprint`, `model_configuration`, `created_at` |
| Feedback action | `kb.user_feedback` | `id`, `recommendation_id` (FK), `actor_id`, `decision` (confirm/correct/reject), `record_id`, `comment`, `evidence` (KB record snapshot + fingerprint), `created_at` |
| HTTP request | stdout (structured JSON) | `event`, `request_id`, `method`, `route`, `status`, `actor`, `duration_ms` |
| Reranker boost update | `data/processed/reranker_boosts_log.jsonl` | `run_timestamp`, `delta`, `new_signals`, `changes` per IS number |

### 3.2 Audit trail properties

- **Immutability**: `recommendations_log` and `user_feedback` have no `UPDATE` or `DELETE` grants for the application user. Corrections are new rows, not edits.
- **Linkage**: `user_feedback.recommendation_id` is a foreign key to `recommendations_log.id`; every feedback row can be traced back to the exact recommendation it responds to, including the model configuration and KB fingerprint active at that moment.
- **Non-repudiation**: `actor_id` is resolved from the API key at request time and stored in both tables. If a key is rotated, the historical `actor_id` string remains in the log.
- **KB fingerprint**: `kb_fingerprint` is a SHA-256 hash of the entire records array. Any change to the seed corpus produces a different fingerprint, making it auditable when recommendations were produced from which corpus version.
- **Retention**: PostgreSQL WAL archiving should be enabled in production (see `docker-compose.prod.yml`); raw audit rows must be retained for the duration of the procurement contract plus the applicable statutory audit period (typically 3–7 years under CVC guidelines).

### 3.3 Recommended audit extensions for production

1. **Ship logs to SIEM**: pipe structured stdout JSON to an ELK stack or NIC SIEM using a log forwarder (Filebeat/Fluentd). The `request_id` field provides correlation.
2. **PostgreSQL audit trigger**: add a `pgaudit` extension to log DDL changes to the `kb` schema.
3. **Signed audit exports**: periodically export `recommendations_log` to WORM storage (NIC S3-compatible) with a SHA-256 manifest for tamper-evidence.

---

## 4. BIS amendment handling — scheduled versioned ETL

### 4.1 Current state (Phase 2)

The seed corpus was built by manual BIS portal lookups spaced at least 20 seconds apart. This is a one-time bootstrap process; it does not support incremental updates.

### 4.2 Production ETL design

BIS publishes amendments, new editions, and withdrawals continuously. The ETL pipeline must be:

- **Scheduled** — not ad-hoc editor commits
- **Versioned** — each import creates a new corpus snapshot with a unique fingerprint
- **Audited** — the source URL, fetch timestamp, and hash of each captured page are retained
- **Idempotent** — re-running with the same source data produces no changes

```
┌─────────────────────────────────────────────────────────────────┐
│  Scheduled ETL (weekly, or triggered by BIS amendment bulletin) │
│                                                                 │
│  1. FETCH  ──── BIS portal metadata pages (spaced, robots-ok)   │
│             └── Hash each HTML page; skip if unchanged           │
│                                                                 │
│  2. PARSE  ──── Extract structured metadata fields              │
│             └── Validate against existing schema                 │
│                                                                 │
│  3. STAGE  ──── Write to data/raw/bis/<date>/ with provenance   │
│             └── Append to docs/SOURCES.md                        │
│                                                                 │
│  4. DIFF   ──── Compare with current standards_seed.json         │
│             └── Produce amendment_diff.json (adds/changes/       │
│                 withdrawals) for human review                    │
│                                                                 │
│  5. REVIEW ──── A standards officer approves the diff            │
│             └── Rejected diffs are quarantined, not applied      │
│                                                                 │
│  6. UPSERT ──── Atomic PostgreSQL upsert (Phase 2 schema)        │
│             └── New corpus fingerprint written to                │
│                 data/processed/corpus_versions.jsonl             │
│                                                                 │
│  7. REBUILD ─── Rebuild Qdrant index from new corpus             │
│              └── Neo4j graph projection refreshed               │
│                                                                 │
│  8. VERIFY  ─── Re-run eval/run_eval.py; fail if hallucination   │
│                 rate > 0 or Recall@5 drops > 5 percentage points │
└─────────────────────────────────────────────────────────────────┘
```

**Safeguards**:
- Human review gate (Step 5) is mandatory; the ETL script cannot auto-apply changes that affect mandatory certification status or supersession chains.
- The old index snapshot is preserved until the new one passes the eval harness (Step 8). The API serves the old snapshot during rebuild.
- Every new snapshot creates a new `kb_fingerprint`; recommendations served before and after the update are distinguishable in the audit log.
- The BIS portal access rules (robots.txt, terms of use, rate limits) documented in `docs/SOURCES.md` apply to all ETL runs, not just the initial bootstrap.

### 4.3 Scheduling

Use the system cron or a lightweight scheduler (APScheduler in a dedicated container):
```
# Run ETL pipeline every Sunday at 02:00 IST
0 20 * * 6  /app/scripts/etl_pipeline.sh >> /var/log/standx/etl.log 2>&1
```

The ETL script must exit non-zero and send an alert if any step fails; silent failures in standards data are not acceptable.

---

## 5. What would need to change to go from "hackathon demo" to "pilot-ready with one PSU"

See `docs/pilot_readiness.md` for the detailed checklist. Summary:

- Licensed BIS metadata feed or formal data-sharing agreement
- Expert-validated gold set (BIS Sectional Committee annotation, IAA ≥ 0.70)
- CERT-In empanelled security audit and VAPT
- SSO integration (NIC NeSL LDAP or on-prem Keycloak)
- Role-based access control (§2.2 Phase 1 minimum)
- Production PostgreSQL with WAL archiving and replication
- Formal SLA, incident response, and change-management procedures
- Data classification and handling procedures for pre-publication tender data
- Load test against realistic concurrent load (see `docs/load_test_results.md`)

---

*Document version: 1.0 · 2026-09-22 · StandX Phase 11*
*Not a substitute for a formal ISMS, VAPT report, or legal compliance review.*
