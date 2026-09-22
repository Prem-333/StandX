# Procurement Standards Recommendation Engine

## Project vision

This project will help procurement teams connect tender requirements to relevant Indian Standards through transparent, auditable recommendations. Users will submit specifications and receive candidate standards, related test methods, safety and installation references, revision and amendment metadata, and certification information supported by documented evidence. Every recommendation must cite an identifiable knowledge base record; uncertain matches must be disclosed rather than guessed. The system will index public metadata only, unless licensed full text is explicitly supplied. Synthetic examples will remain visibly labeled throughout ingestion, storage, APIs, and demonstrations. The planned architecture combines Python services, relational storage, vector retrieval, a standards relationship graph, and a React interface, with local operation through Docker Compose. Development will proceed in runnable phases, recording decisions, source provenance, limitations, and evaluation results. Our aim is to support informed procurement review while preserving traceability, respecting licensing restrictions, and keeping human reviewers responsible for applicability decisions and mandatory compliance assessments.

## Scaffold

```text
data/{raw,processed,mock}/     Public metadata staging, normalized records, synthetic fixtures
kb/                           Graph and vector build-script placeholders
services/{api,ingestion,nlp}/  Backend service placeholders
frontend/                     React + Vite placeholder
eval/                         Evaluation plan placeholder
docs/                         Safeguards and canonical internet audit log
scripts/                      Runnable phase demonstrations
PROJECT_CONTEXT.md            Running project log
SOURCES.md                     Entry point to docs/SOURCES.md
.env.example                  Configuration template without credentials
```

## Planned stack

User-specified defaults: Python 3.11 + FastAPI, PostgreSQL, local Docker Qdrant and Neo4j, local embeddings through sentence-transformers or Ollama, and React + Vite. Docker Compose will eventually run the complete stack offline after dependencies, images, models, and permitted metadata have been provisioned. Dependency versions, model identifiers, endpoints, and Docker image tags are intentionally not selected in this phase; verify and log them before implementation.

## Phase 0: scaffold and provenance demonstration

From the repository root, run either:

```sh
npm run phase0-demo
```

```sh
make phase0-demo
```

Both invoke `python scripts/phase0_demo.py`; that command also works directly. No package installation or network access is needed. The script uses only the Python standard library and is intended for Python 3.11 or later. The development target remains Python 3.11.

Expected output: a prominent MOCK/SYNTHETIC warning and a JSON fixture with `source: synthetic`, its knowledge base record citation, unknown version/amendment/certification status, and `not_assessed` confidence. This is a provenance demonstration, not a working recommendation engine. No BIS records, verified standards relationships, or certification determinations are included. Service, retrieval, frontend, and evaluation files are placeholders; Docker Compose is not configured yet.

Project safeguards are in `docs/PROJECT_RULES.md`. Record every internet-derived fact, dataset sample, or dependency version in `docs/SOURCES.md`, linked from root `SOURCES.md`. Phase completion is recorded in `PROJECT_CONTEXT.md`.

## Phase 1: researched solution architecture

Read [docs/architecture.md](docs/architecture.md) for the research findings, eight procurement-official user stories, component diagram, three ER views of the data model, non-functional targets, and one-page three-minute judging script. Research covered official ISO/ANSI and EU guidance, standards/regulatory retrieval papers, and BIS digital services. The [source audit](docs/SOURCES.md) records source uses and access limitations.

Run the dependency-free architecture walkthrough:

```sh
npm run phase1-demo
```

Alternatively, use `make phase1-demo` or `python scripts/phase1_demo.py`. It prints the document locations, design outline, and future judging script. This phase delivers an architecture specification; it does not implement retrieval, legal applicability checks, a frontend, or the Docker stack. All performance figures are proposed targets, and approximately 22,000 live standards is a user-provided capacity assumption. No real standards were added to the KB.

## Setup for Phases 2–8

```sh
python -m pip install -r requirements.txt
npm ci --ignore-scripts
```

The selected embedding/reranking files are already cached on this laptop. On a new machine, run `npm run models:provision` while online, then retain `models/` with its manifests and licenses. Runtime performs local inference only and fails if a model is missing. Edit [kb/retrieval_config.json](kb/retrieval_config.json) to swap models or backend settings. Python 3.11 remains the target; the available Python 3.14.6 interpreter was used for validation.

## Phase 2: metadata knowledge base

```sh
npm run phase2-demo
npm run kb:validate
```

The SQL demo starts an isolated, temporary PGlite PostgreSQL engine and loads through `psycopg`, first from JSON and then CSV. It verifies identical counts, child reconciliation, stale-snapshot protection, and rollback of a cyclic batch, then stops the server. This is executable PostgreSQL SQL, not a persistent PostgreSQL deployment.

The seed has **150 editions / 140 families: 20 individually verified BIS metadata records and 130 labeled synthetic records**, with 30 editions per procurement domain. Tables contain 351 observed cross-reference rows, 60 classification nodes, 10 synthetic amendment details, 5 synthetic schemes, and 5 product categories. Real amendment counts are preserved without inventing amendment details. Source URLs and snapshots are in `docs/SOURCES.md` and `data/raw/bis/`; no standards PDF was downloaded.

For persistent PostgreSQL, set `DATABASE_URL` and run `python -m services.ingestion.load data/processed/standards_seed.json`. The loader applies `kb/schema.sql`. See [ingestion instructions](services/ingestion/README.md) for the CSV contract. `npm run seed:build` regenerates the seed from local snapshots without network access.

Validation flags **268 unresolved Indian-reference observations** and **one malformed international reference**, with no missing classifications or circular supersession. These are visible findings from a partial sample. `python -m services.ingestion.validate --strict` exits nonzero for any finding; default validation permits partial-corpus warnings but rejects supersession conflicts. See the [acquisition plan](docs/data_acquisition_plan.md).

## Phase 3: allied graph and version status

```sh
npm run phase3-demo
python -m unittest eval.test_graph -v
```

NetworkX persists `kb/graph.gpickle` and exposes `expand_allied_standards(is_number, max_hops=2)` and `get_version_status(is_number)` from `kb.build_graph`. Typed groups retain evidence paths, and supersession resolves to the final edition. The five graph tests pass. Generic real references stay untyped; unknown currentness stays unknown. Read the [graph schema and tradeoffs](docs/graph.md).

## Phase 4: offline semantic retrieval

```sh
npm run phase4-demo
python -m services.nlp.retrieve "wooden bedside table"
python -m services.nlp.retrieve "IS 12680:1989"
```

The demo verifies cached model hashes, builds 150 vectors, and benchmarks BM25 + dense reciprocal rank fusion with a local cross-encoder reranking up to 30 candidates into 10. Literal IS lookups resolve directly; missing identifiers produce abstention. Normal searches exclude synthetic records; the benchmark explicitly enables and labels the mixed seed.

Measured on this 16 GB/i5 laptop with CPU and persistent local Qdrant: full index build **33.18 s**, warm query median **0.627 s**, p95 **0.793 s**, peak process working set **2.08 GiB**, and zero external connection attempts. Seven semantic smoke queries found the expected record in the top ten; six ranked it first. This is not a production quality guarantee. The [retrieval report](docs/retrieval.md) records model/license and MTEB checks, swaps, timing methodology, and the Bengali ranking error.

Docker is unavailable here. Phase 8 now provides `docker-compose.yml` for PostgreSQL, Qdrant, Neo4j and the API on an internal network. Docker execution remains unverified; reported Phase 4 measurements use Qdrant's persistent local mode. See [backend setup](docs/api.md) for provisioning and startup.

Run all 26 unit tests with `npm test`. Each phase also has `make phaseN-demo`; GNU Make is unavailable locally, so npm/Python equivalents were exercised.

## Phase 5: evidence-bound recommendations and tender reports

```sh
npm run phase5-demo
```

`services.recommendation.recommend(query_text, top_k=5)` joins offline hybrid retrieval with grouped graph evidence, version/amendment status, and deterministic metadata-only rationales. A configurable relevance threshold defaults to 0.70; weak queries return **“no confident match — showing closest candidates for human review”**. Close alternatives are marked ambiguous. Exact IS-number matches establish identity only. Synthetic records are excluded unless explicitly enabled, and unknown legal/version facts remain unknown.

`recommend_tender(text, top_k=5)` extracts product phrases, preserves source spans and unsupported requirements, queries each phrase, and merges duplicate edition records. Every query and tender aggregate is committed to `kb.recommendations_log` before it returns, including scores, complete evidence, model revisions, configuration, and timestamps. Set `DATABASE_URL` for a local PostgreSQL server; the demo automatically starts a persistent local PGlite PostgreSQL-compatible store, closes it, and verifies its rows survive reopening.

The eight actual-model queries found all four specific product examples first, withheld the broad furniture and out-of-scope software requests, identified electrical safety as ambiguous, and resolved the exact IS identifier. Median wall time including audit was **0.458 s**, with zero external socket attempts. The run added **15 persistent audit rows**, including tender phrase queries and a separately labeled synthetic graph example. These smoke results and uncalibrated scores are not production accuracy evidence. Read [all eight outputs](docs/recommendation_demo.md), [full JSON evidence](data/processed/recommendation_demo.json), and [configuration, limitations, and integration instructions](docs/recommendation_engine.md).


## Phase 6: dated certification rules and hard version warnings

```sh
npm run phase6-demo
```

Certification mappings are data in `data/processed/certification_rules.json`, verified against official sources on **21 September 2026**. The curated subset covers mandatory ISI marking for bright steel bars, mandatory CRS for laptops/notebooks/tablets, conditional mandatory gold hallmarking, and voluntary silver hallmarking. Scope, exemptions, district assertions, legal references, verification dates and review dates remain visible. Unmapped categories return unknown, and overdue rules become unknown pending review. These rules do not claim exhaustive coverage or final legal applicability.

Recommendations include classification/record triggers, regulatory citations and a rule-set fingerprint. Superseded or withdrawn standards produce hard warnings; the synthetic demonstration resolves the complete chain to the final replacement and remains labeled. Update rules without redeployment using `python -m services.certification.admin rule.json --actor YOUR_ID`. The CLI validates evidence and journals each change. Read [certification design and access limitations](docs/certification_design.md). Detailed CRS amendment transition text could not be retrieved completely and is explicitly **unverified — confirm before relying on this**.

## Phase 7: local multilingual query normalization

```sh
npm run phase7-demo
```

Local language detection and a cached, hash-verified IndicTrans2 RoPE 200M translation model normalize queries to English while preserving original text and translation evidence in the audit log. Hindi, Bengali, Marathi and Telugu are configured along with additional Indic languages; the measured smoke cases cover Hindi and Hinglish only. A reviewed Hinglish lexicon handles common romanized terms. Missing translation assets trigger a visible English-only fallback, and input identifiers remain intact. Model paths, adapter and language tags are configurable in `services/nlp/multilingual_config.json`.

On a new machine, explicitly provision with `npm run translation:provision` while online. Runtime does not download models. Eight actual-model cases completed: **6/8 expected standards ranked first; 8/8 appeared in the top five**. Hindi and Hinglish eye-protection queries ranked security glass first; both were below the confidence threshold and require review. See [all eight outputs](docs/multilingual_results.md), [complete audit evidence](data/processed/multilingual_demo.json), and [model/licence checks and design tradeoffs](docs/multilingual_design.md).

## Phase 8: authenticated offline API and backend deployment files

```sh
npm run phase8-demo
python scripts/setup_local_env.py
npm run api:local
```

The local API exposes all six requested endpoint families, JSON/PDF/DOCX tender input, typed responses, local OpenAPI/Swagger assets, API-key authentication, structured JSON logs, basic rate limiting and durable feedback. Successful recommendations are committed to the audit database before returning. Start the API and open `http://127.0.0.1:8000/docs`; obtain the key from your private `.env` file. The development launcher uses persistent PGlite and local Qdrant.

**26 unit tests and 26 endpoint integration checks passed**, using the Phase 2 seed and actual cached models. The integration run attempted zero external Python connections, persisted feedback, checked missing-model fallback, and exercised PDF/DOCX upload. The latest persistent development database contains 32 audit rows and 2 feedback rows from two runs; these are cumulative, not corpus counts. See [integration evidence](data/processed/api_integration_report.json).

`docker-compose.yml` wires PostgreSQL, Qdrant, Neo4j, initialization and the API; after initial image/model provisioning, `docker compose up` is the intended offline startup command. **Docker is not installed here, so container build/startup and Neo4j transactions remain untested.** Python 3.11 is the container target; executed checks used Python 3.14.6. See [API startup and deployment boundaries](docs/api.md), [Postman collection](docs/postman_collection.json), [HTTPie examples](docs/requests.httpie.sh), and [OpenAPI schema](docs/openapi.json).


## Phase 9: clickable procurement workspace

```sh
npm --prefix frontend ci --ignore-scripts
npm run phase9-demo
```

Open **http://127.0.0.1:5173**. The launcher starts a dedicated persistent development database, the actual cached-model API and the React + Vite + Tailwind frontend. It enables Phase 2 synthetic data only in its separate demo configuration and keeps a visible MOCK/SYNTHETIC banner. Production recommendation defaults remain unchanged. Stop other API processes owning the same local Qdrant index before starting this demo.

Paste a specification or drag/drop a PDF/DOCX, select English/Hindi/Hinglish, and review primary standards, confidence, conditional version badges, hard obsolete-version warnings, grouped allied standards and dated certification chips. Expand citations and version/amendment observations, export the evidence JSON, or submit Correct/Not relevant feedback and a validated alternative standard. Feedback is saved through `/v1/feedback`, not simulated in the browser. Both screens adapt to mobile layouts.

Build with `npm run frontend:build`; run real browser/API verification with `npm run phase9-test`. These commands reuse locally provisioned dependencies, model caches and a browser. Reports are in `data/processed/frontend_e2e_report.json` and `frontend_audit_check.json`; visual captures are in `data/processed/frontend_screenshots/`. See [frontend setup and operational boundaries](frontend/README.md).

[Portal integration plan](docs/portal_integration_plan.md) records the 21 September 2026 official-source research and proposed embedded-widget and server-side REST approaches. Public descriptions establish institutional integrations, but no usable public GeM tender-drafting developer contract was found in the inspected sources. **Actual GeM integration requires a formal API partnership/approval from its technical team.** This local demo is not integrated with GeM or any state portal. The frontend is currently launched with Node; the existing Docker Compose file continues to cover the backend.

Phase 9 verification: **11/11 browser tests passed**, and the TypeScript/Vite production build passed. Confirm/reject/correction records were read back from the persistent audit database. Desktop and mobile screenshots were inspected; the mobile layout has no horizontal overflow.
