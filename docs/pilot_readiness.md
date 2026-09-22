# Pilot Readiness — "Hackathon Demo" to "PSU Pilot"

> This document lists explicitly and honestly what must change before StandX can be deployed as a pilot with one Public Sector Undertaking (PSU). It is intended for evaluators, procurement managers, and the SIH jury. Nothing here is hidden or minimised.

---

## The honest gap analysis

| Item | Current state | Required for pilot | Effort estimate |
|---|---|---|---|
| Standards data | 20 verified BIS records + 130 synthetic seed (150 total) | Full BIS catalogue coverage for the PSU's procurement domain (hundreds to thousands of records) | **High** — needs formal BIS data agreement |
| Data validation | Self-authored synthetic gold set (Phase 10) | Expert-validated gold set: BIS Sectional Committee + experienced procurement officers, IAA ≥ 0.70 | **High** — domain expert time + annotation tooling |
| Authentication | Static API-key map in env var | Role-based SSO via NIC NeSL LDAP or on-prem Keycloak, with procurement officer / admin / auditor roles | **Medium** — OIDC integration, NIC coordination |
| Security audit | None performed | CERT-In empanelled VAPT; application-layer pen test; code review against OWASP API Top 10 | **High** — external vendor engagement, 4–8 weeks |
| Data classification | No formal classification | Tender specifications must be classified and handled per MeITY/CVC guidelines before processing | **Medium** — policy + training, no code changes |
| Deployment | Single dev laptop (offline) | Single on-prem server with Docker Compose prod config (`docker-compose.prod.yml`), TLS, and nginx reverse proxy | **Low** — config mostly complete |
| TLS certificates | None | Valid TLS certificate for the department's domain (NIC PKI or equivalent) | **Low** — NIC PKI process |
| PostgreSQL production | PGlite (in-process) | PostgreSQL 17 with WAL archiving, daily pg_dump, and replication standby | **Low** — `docker-compose.prod.yml` included |
| Audit retention | Development database, no retention policy | Formal retention policy (3–7 years per CVC guidelines); WORM/S3-compatible archive | **Medium** — policy + scheduled export script |
| Load testing | Offline locust script (script ready, not run against live system) | Validated p50 < 500 ms, p95 < 2 s under realistic concurrent load for the PSU's user count | **Low** — run against provisioned server |
| BIS amendment ETL | Manual one-time bootstrap | Scheduled versioned ETL with human review gate (design in `docs/security_and_governance.md` §4) | **High** — pipeline implementation + BIS data access |
| Multilingual coverage | Hindi + Hinglish tested; 6 other Scheduled Languages configured but not evaluated | At minimum: evaluate and validate Hindi, English, and the PSU's primary regional language | **Medium** — annotation + test expansion |
| Incident response | None | Defined runbook: who to call if the API is down, if a bad recommendation is discovered, if audit DB is corrupted | **Low** — document only |
| Change management | Git commits | Formal change-request process for corpus updates, model swaps, rule changes | **Medium** — process design |
| Model licensing | IBM Granite MIT + MiniLM Apache 2.0 (both permissive) | Verify that PSU's legal team accepts MIT + Apache 2.0 for internal deployment | **Low** — legal review only |
| Legal applicability disclaimer | Present in every API response and UI | Must be reviewed by PSU's legal/compliance team; they must acknowledge it in writing | **Low** — contractual |
| Feedback loop calibration | ±0.10 boost, 7-day decay (demo defaults) | Tune boost delta and decay period on real feedback data from a 30-day pilot period | **Medium** — A/B testing infrastructure |

---

## What is NOT a gap (already done)

- **Data residency**: all inference runs locally; no outbound connections after startup. Verified in Phase 4 (zero external socket attempts) and Phase 8.
- **Audit logging**: every recommendation and every feedback action is committed to PostgreSQL before the response returns. Full audit trail with KB fingerprint.
- **Grounding**: hallucination rate = 0.0% on the synthetic gold set. Every returned IS number is a KB record with a source citation.
- **Document hardening**: PDF and DOCX upload validation with magic-byte checks, zip-bomb guards, and text sanitisation implemented in Phase 11.
- **Rate limiting**: per-officer 30 req/min window enforced in `RateLimiter`.
- **Offline model operation**: `HF_HUB_OFFLINE=1` enforced in Dockerfile; missing models fail loudly, not silently.
- **Synthetic data labelling**: MOCK/SYNTHETIC labels are present in every API response, UI card, and audit row that involves a synthetic record.
- **Production Docker Compose**: `docker-compose.prod.yml` with resource limits, WAL archiving, Docker Secrets, and nginx TLS terminator.

---

## Horizontal scaling path (department-wide adoption)

If adopted beyond a single PSU, the following scaling changes are needed:

### Read traffic (query volume)

1. **Multiple API replicas**: the `api` service in `docker-compose.prod.yml` has `replicas: 1` today. Increase to 2–4 replicas behind a load balancer. Each replica loads the model into RAM; with the 97M-parameter Granite model, 4 replicas require ~8 GB RAM for models alone. Replicas are stateless — session state is in PostgreSQL.

2. **Qdrant horizontal sharding**: Qdrant supports distributed collections across multiple nodes. For a corpus growing beyond 50,000 records, shard the vector index across 2–3 Qdrant nodes with replication factor 2. The retrieval config (`kb/retrieval_docker_config.json`) supports a multi-node URL list.

3. **PostgreSQL read replicas**: the audit log is write-heavy on the primary. Add one streaming replication standby for the auditor role's read queries (`GET /v1/audit/*`). Set `hot_standby = on` and route auditor connections to the replica via `postgresql://…?target_session_attrs=any`.

4. **Managed vector DB**: for a truly managed path, replace the self-hosted Qdrant with a managed Qdrant Cloud instance deployed within the department's private cloud region. This requires verifying data residency commitments from the managed provider — currently no Indian-region Qdrant Cloud offering exists; NIC cloud or NICSI private cloud are the compliant alternatives.

### Write traffic (corpus updates)

5. **ETL as a separate service**: extract the BIS amendment ETL pipeline into a separate Docker service (`etl`) that runs on a schedule and writes to the primary PostgreSQL. The API service never writes to the corpus tables.

6. **Blue-green index deployment**: maintain two Qdrant collections (`index_v1`, `index_v2`). During a corpus update, build the new collection while the old serves live traffic, then atomically swap the `active_collection` pointer in the manifest file. Zero-downtime corpus updates.

### Geographic distribution

7. **Per-ministry deployment**: each ministry or PSU group runs its own on-prem stack with its own PostgreSQL primary. Cross-ministry recommendation queries are not supported in this architecture (data residency requirement: tender data must not leave the originating ministry's network).

---

## Recommended pilot sequence (6-month timeline)

```
Month 1:  Legal — BIS data agreement, model licensing review,
                  data classification policy
Month 2:  Security — CERT-In VAPT engagement, NIC NeSL SSO integration
Month 3:  Data — Expert annotation sprint (30 gold items validated),
                  ETL pipeline implementation
Month 4:  Infrastructure — On-prem server provisioned, prod compose deployed,
                           load test against real server
Month 5:  Pilot — 5-10 procurement officers, one PSU domain,
                  daily feedback review, weekly eval harness run
Month 6:  Evaluation — Recall@5 on expert-validated gold set,
                       audit trail review by CVC-designated officer,
                       go/no-go for wider rollout
```

---

*Document version: 1.0 · 2026-09-22 · StandX Phase 11*
