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

## Setup for Phases 2–4

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

Docker is unavailable here. `compose.yaml` provides pinned Qdrant: run `docker compose up -d qdrant`, change `qdrant_mode` to `server` in the JSON configuration, and rebuild. Docker execution is unverified on this host; reported measurements use Qdrant's persistent local mode. The complete API/frontend/Neo4j stack remains future work.

Run all nine unit tests with `npm test`. Each phase also has `make phaseN-demo`; GNU Make is unavailable locally, so npm/Python equivalents were exercised.
