# Project context and running log

## 2026-09-20 — Phase 0: initial scaffold

- Created the requested repository layout and placeholder service, data, knowledge base, frontend, and evaluation files.
- Recorded persistent safeguards in `AGENTS.md` and `docs/PROJECT_RULES.md`; established `docs/SOURCES.md` as the canonical audit log with a root entry point.
- Added a 150-word project vision and documented the user-specified architecture in the root README.
- Added a dependency-free provenance demo through `make phase0-demo`, `npm run phase0-demo`, or `python scripts/phase0_demo.py`. Its only record is explicitly synthetic; status fields remain unknown and confidence is not assessed.
- No external facts or dependencies were fetched. No real standards, cross-references, certification rules, recommendation logic, or Docker stack are implemented.
- Local Python reports 3.14.6. The requested implementation target remains Python 3.11; compatibility with an actual Python 3.11 runtime still needs verification.
- Validation: `npm run phase0-demo` succeeded on the local runtime and displayed the synthetic warning, fixture, and record citation. All requested directories exist. The README vision was checked for exactly 150 words. GNU Make is not installed locally, so the equivalent Make target was not executed.

Next phase: verify proposed dependencies and public metadata access rules, log the sources, then implement a provenance-preserving metadata schema and ingestion path.

## 2026-09-20 — Phase 1: researched solution architecture

- Researched official ISO/ANSI search products, EU CE/Access2Markets workflows, standards graphs, regulatory retrieval/evaluation, and BIS digital services for approximately ten minutes before drafting (16:47:48–16:57:51 UTC).
- Added `docs/architecture.md`: eight user stories, a component flowchart, three ER views, temporal/evidence contracts, offline ETL and reviewed feedback flows, measurable NFR targets, and a timed three-minute judged-demo script.
- Confirmed BIS metadata field concepts including Group/Sub Group/Sub Sub Group/Aspects. Preserved generic references as untyped until evidence establishes a stronger relation. No real records were ingested.
- Recorded sources and access limitations in `docs/SOURCES.md`. Some robots/policy requests failed, ISO advanced search was robots-blocked, and the bare Manak host failed TLS hostname validation; no blocks were bypassed. A supported public bulk metadata API was not verified.
- Architecture keeps retrieval separate from certification rules, legal references separate from latest-known editions, and immutable PostgreSQL snapshots aligned with derived graph/vector projections. The assumed 22,000 live standards and latency figures are capacity/engineering targets, not verified corpus counts or measured results.
- Added `npm run phase1-demo`, `make phase1-demo`, and the direct Python walkthrough. These display architecture documentation, not a working recommendation engine. Backend versions and local models remain unselected.
- Validation: `npm run phase1-demo` passed on local Python 3.14.6. All four diagrams passed Mermaid 12.0.0 parsing with a locally available DOM environment; the initial bare-Node attempt lacked a DOM and was corrected without changing diagram content. The temporary validator is outside the repo and is not a runtime dependency. All 27 architecture citation URLs are in the audit log; eight stories, required ER entities and relationship types, the 513-word judging script, and unchanged 150-word README vision were checked. Diagram syntax was validated, not visually rendered. GNU Make and Python 3.11 execution remain unverified locally.

Next phase: establish permitted metadata access, implement the versioned evidence schema and a small reviewed dataset, then compare retrieval baselines and validate rules before presenting real applicability claims.

## 2026-09-21 — Phase 2: metadata foundation

- Captured 20 individual BIS public metadata pages on 20–21 September, spaced by at least 20 seconds; one old URL failed with 404. Robots/terms were checked first. No bulk crawl or standards PDF retrieval. Searches did not verify a public BIS/NIC bulk metadata feed; acquisition alternatives and conditional refresh targets are documented.
- Built 150 seed editions across five procurement domains: 20 `bis_public_metadata_verified` and 130 `synthetic_seed`, with visible labels and reserved identifiers. Raw HTML, source timestamps, hashes, and exact published wording are retained. Missing scope, supersession, certification applicability, and amendment details remain unknown.
- Implemented normalized PostgreSQL schema, atomic JSON/CSV upserts, immutable import snapshots, stale-import protection, child reconciliation, latest-observed pointers, and directional-reference validation. Demo SQL counts: 140 families, 150 revisions, 351 references, 60 classification nodes, 10 synthetic amendments, 5 synthetic schemes, and 5 product categories.
- `node scripts/phase2_demo.mjs` passed idempotency, update reconciliation, and cyclic-batch rollback using PGlite through psycopg. Validation reports 268 orphan Indian-reference observations and one malformed international reference; no missing classifications or supersession cycles. PostgreSQL server/Docker deployment was not available for execution.

## 2026-09-21 — Phase 3: allied graph

- Explained the graph schema before execution. Chose NetworkX for local use without another server. Persisted 165 nodes and 3,341 edges to `kb/graph.gpickle`, retaining 303 unresolved/external reference observations separately.
- Implemented typed directional expansion, weak committee associations, provenance paths, global deduplication, complete supersession-chain resolution, and explicit unknown currentness/amendment resolution. Generic BIS references stay untyped; actual mandatory certification is not inferred.
- `npm run phase3-demo` passed. Five seed-based graph unit tests pass, including three-edition supersession, two-hop evidence, edge direction/deduplication, unknown real metadata, amendment resolution, and withdrawal.

## 2026-09-21 — Phase 4: offline retrieval

- Inspected laptop: i5-10300H, eight logical processors, approximately 16 GB RAM, GTX 1650 Ti with approximately 4 GB VRAM. No pre-existing model cache or Docker executable. Verified current model cards/licenses/weight sizes and retrieved official MTEB Indic scores; aggregate means were null, so raw positions are not treated as a trustworthy overall ranking.
- Provisioned immutable Granite 97M multilingual R2 and multilingual MiniLM reranker assets locally with hashes. Chose the small CPU baseline for memory/latency, documenting that Qwen/BGE perform better on some published Indic tasks. Runtime uses offline/local-only model loading and rejects missing or mismatched cache/index configuration.
- Implemented one metadata document per edition, Qdrant payloads with provenance, literal-identifier resolution/unknown-ID abstention, Unicode BM25 + dense RRF, and local cross-encoder reranking of up to 30 candidates into 10. Synthetic results are excluded by default. Added pinned Qdrant Compose configuration; measured persistent local mode because Docker is absent.
- Corrected an SDK context-manager assumption and Windows UTF-8 console output during integration. Successful offline benchmark: 150 records, build 33.18 s (embedding 3.71 s), warm semantic median 0.627 s / p95 0.793 s, peak working set 2.08 GiB, zero external connection attempts. Seven semantic smoke cases hit top 10, six hit top 1; Bengali misranking remains documented. Actual Python runtime was 3.14.6; 3.11 and Docker execution remain unverified.
- Nine unit tests pass, plus SQL integration checks and the offline multilingual benchmark. Commands: `npm run phase2-demo`, `npm run phase3-demo`, `npm run phase4-demo`, `npm test`; equivalent Make targets added. Next work: expert-labelled evaluation, licensed/approved metadata refresh, and recommendation/API integration with separately evidenced certification rules.
- Closeout: verified all 20 real-record source URLs and snapshot hashes; preserved the README's 150-word vision; Python compilation passed. A separate real-only semantic query ranked the bedside-table record first and returned only verified-source candidates; a synthetic literal was excluded by default. Documentation placeholders for implemented components were replaced, and audit date clarifications were appended without erasing history.

## 2026-09-21 — Phase 5: recommendations and tender audit

- Rechecked the live MTEB frontend, the three candidate publisher cards, and the official Indic scores. Browser JSON access failed; direct HTTPS succeeded and reproduced the previous values. Appended every URL to `docs/SOURCES.md`; verified both existing local model caches before inference, with no new model downloads.
- Implemented `recommend(query_text, top_k=5)` with local retrieval/reranking, an index-aligned Phase 3 graph, grouped allied evidence, full supersession/amendment observations, and deterministic title/classification explanations. Default confidence cutoff 0.70 uses sigmoid-transformed reranker logits, explicitly uncalibrated. Low-confidence and ambiguous responses require review; literal identity never implies applicability or legal certification.
- Added tender phrase extraction with source spans, clause fallback, visible negation/overflow review, per-phrase recommendations, and edition-level deduplication. Unknown real version/certification facts remain unknown; synthetic data is excluded by default and separately demonstrated with labels.
- Added durable PostgreSQL audit inserts with query/results/scores/timestamps, KB fingerprint, model revisions, configuration, and tender grouping. `npm run phase5-demo` runs a persistent local PGlite store via psycopg; all 15 new rows were read back and survived closing/reopening. Native PostgreSQL/Docker deployment remains untested here. Corrected initial demo directory creation before the successful run.
- Eight actual-model queries: four specific products ranked their expected records first; broad furniture request fell below cutoff; electrical safety was ambiguous; literal IS resolved exactly; payroll software was withheld. Warm median including audit 0.458 s; max 0.498 s; startup 37.04 s; zero external socket attempts. Complete outputs: `data/processed/recommendation_demo.json` and `docs/recommendation_demo.md`.
- All 17 unit tests pass, including eight new recommendation tests. Added `make phase5-demo` and `npm run phase5-demo`, configuration/integration documentation, and README instructions. Expert calibration, robust document parsing, production audit controls, and legally evidenced certification rules remain future work.
