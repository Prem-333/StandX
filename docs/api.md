# Offline backend API

FastAPI serves all six requested endpoint families, with typed Pydantic responses, local model inference, record-level evidence, durable recommendation/feedback storage, API-key authentication, JSON request logs, basic per-key rate limiting, and local Swagger UI assets.

## Start on this laptop

The existing Python environment, cached models, local Qdrant index, and Node demo dependencies are provisioned. Generate local credentials without overwriting existing ones, then launch:

```sh
python scripts/setup_local_env.py
npm run api:local
```

This starts a persistent PGlite PostgreSQL-compatible development database on loopback and the API at `http://127.0.0.1:8000`. Use the API key stored under `API_KEYS_JSON` in the Git-ignored `.env`. The script does not print it. Swagger UI is at `/docs`; click **Authorize** and supply the key. The UI's JS, CSS, and favicon are served locally, and its remote validator is disabled. `/openapi.json` and static documentation are public; `/v1/*` requires authentication.

For an existing local PostgreSQL server, export its `DATABASE_URL` and `API_KEYS_JSON`, then run `python scripts/serve_api.py`. Python runtime accepts loopback backend hosts by default. The isolated Compose profile additionally permits its fixed service hostnames. `.env` values do not replace already exported nonempty values.

## Endpoints

| Endpoint | Input and behavior |
| --- | --- |
| `POST /v1/recommend` | JSON `{text, top_k, tender, language_hint, product_category, certification_context}` or multipart `file` containing PDF/DOCX. Uploads are tender input; set `tender=true` for a multi-item text tender. |
| `GET /v1/standards/{is_number}` | Exact edition or known family; returns the allowed KB record, version status, certification rules, hard warnings, and evidence. Missing numbers return 404. URL-encode spaces/slashes as needed. |
| `GET /v1/standards/{is_number}/allied` | Evidence-backed groups, with `max_hops=0..4`, default 2. Generic and same-committee relationships remain visibly distinct. |
| `GET /v1/certifications/{product_category}` | Dated rules for the curated category; optional boolean query parameters supply scope assertions. Unknown categories return `status="unknown"`, never a no-certification claim. |
| `POST /v1/feedback` | `{recommendation_id, decision, record_id, comment}`; decision is confirm/correct/reject. Confirms must name a returned candidate; corrections must name a known permitted KB record. Persists authenticated officer ID and evidence. |
| `GET /v1/health` | Authenticated readiness of PostgreSQL, vector index and graph, plus translation availability. Returns 503 when a required backend fails. Translation is optional and loads lazily. |

The recommendation response contains `primary_standards`, per-item and aggregate `allied_standards` grouped by relation, `certification_requirements`, hard `warnings`, and `evidence` pointing to exact KB records. Each primary includes score, source label, status, version/amendment observations, deterministic rationale, and threshold decision. It also returns original/normalized text, model revision and translation notices. The same complete envelope is committed to the audit table before success is returned.

Uploads are limited to 5 MiB, 100 PDF pages and 100,000 extracted characters. DOCX expansion and PDF text decompression are bounded. Unsupported extensions, malformed requests, oversized input, encrypted PDFs, and image-only PDFs return explicit errors. OCR is not implemented. Tender uploads are processed as input text, not licensed standards content, and are never indexed into the standards KB. The original extracted text is audited; uploaded binary files are not persisted by this endpoint.

## Authentication and operational boundaries

`API_KEYS_JSON` maps officer identifiers to secrets of at least 24 characters. Keys are compared in constant time and omitted from logs. Structured logs include request UUID, route template, method, status, officer ID, and duration; they omit tender text, documents and credentials. The default limit is 30 authenticated requests per officer per minute (`API_RATE_LIMIT`). A 429 response includes `Retry-After`.

Run one API worker: local Qdrant and this model runtime are intentionally single-owner, and a lock serializes inference/database operations. Rate limiting is in-process and resets on restart. Before multi-worker or multi-host deployment, move limiting and admission control to the gateway/shared store, add worker queues/timeouts, and use database connection pooling. Protect uploads with operational resource limits and malware scanning appropriate to the deployment. This implementation has been exercised locally; it is not a security accreditation.

Government OAuth2/SSO plugs into the `authorize` dependency in `services/api/app.py`: validate the issuer, audience, token signature/expiry and officer roles, then pass the stable subject to feedback/audit logging. Put TLS and gateway policy in front of any non-loopback exposure. Administrative rule edits currently require filesystem access to the separate validated CLI; they are not an unauthenticated API operation.

Feedback is stored in `kb.user_feedback` with a foreign key to `kb.recommendations_log`. It never silently retrains models or edits the KB. Phase 10 can export it for reviewed evaluation and active learning. Retention, backups, restricted DB roles and administrator auditing remain deployment responsibilities.

## Docker backend

`docker-compose.yml` contains PostgreSQL, Qdrant, Neo4j, an idempotent initializer, and the API. Only API port 8000 is published, on loopback; the backend network is internal. Named volumes persist data. The initializer loads the normalized Phase 2 SQL schema/seed, builds real Qdrant vectors from cached embeddings, and publishes the typed graph into Neo4j. API startup loads the exact matching Neo4j snapshot into the tested graph traversal implementation; fingerprint mismatch stops startup.

Provision images, Python dependencies and model caches while connected. Then:

```sh
python scripts/setup_local_env.py
docker compose build
docker compose pull postgres qdrant neo4j
docker compose up -d
```

After provisioning, `docker compose up` starts the backend without model downloads. The cached `models/` directory is mounted read-only. To transfer air-gapped, also transfer the built API image, dependency images and model caches with licence notices. The initializer publishes an index manifest into a shared runtime volume; the API mounts it read-only. Certification rules are mounted through their parent directory so atomic admin updates become visible without redeployment.

Docker is **not installed on this host**. The YAML is parsed and its service wiring reviewed locally; two official Compose schema fetches failed with TLS timeouts, so remote schema validation is **unverified — confirm before relying on this**. Image tags/digests were verified live, but image build, native PostgreSQL, and Neo4j startup are **not executed evidence**. The executed integration uses actual FastAPI/models with local Qdrant and persistent PGlite. Run the Compose stack and the same HTTP collection in the target environment before claiming deployment readiness. The graph projection's Neo4j transactions also need that deployment test.

## Verification and manual calls

```sh
npm test
npm run phase6-demo
npm run phase7-demo
npm run phase8-demo
```

The Phase 8 demo hits every endpoint, JSON and PDF/DOCX recommendation inputs, authentication, unknown IDs, validation, persisted feedback, missing translation, OpenAPI, offline docs, and rate limiting. It uses real cached models and the Phase 2 seed, blocks external Python socket connections, and writes `data/processed/api_integration_report.json`. The multilingual run is saved separately with every original/translated query and expected-record rank.

Import [the Postman collection](postman_collection.json), set `base_url` and `api_key`, and run the text recommendation before feedback (its script captures the recommendation UUID). Select a local PDF/DOCX for the upload request. [HTTPie examples](requests.httpie.sh) provide the same endpoint checks. The generated [OpenAPI document](openapi.json) is also importable into API clients.
