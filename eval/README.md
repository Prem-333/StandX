# Foundation and retrieval checks

Run `npm test` for five graph tests and four foundation/retrieval checks. `npm run phase2-demo` tests SQL idempotency, changed children, stale imports, and atomic rollback. `npm run phase4-demo` runs cached models with external sockets blocked and measures seven semantic queries (English, Hindi, Bengali, Marathi, Telugu) plus known/unknown literal identifiers. Outputs are under `data/processed/`.

Phase 5 adds eight recommendation tests to `npm test` (17 total) for threshold/ambiguity behavior, evidence, graph versions, durable-audit failure handling, tender merging/exclusions, overflow, and invalid scores. `npm run phase5-demo` runs all eight cases in `recommendation_queries.json` through the actual cached models, persists their results plus tender/fixture examples, and verifies SQL readback and database reopen. See `docs/recommendation_demo.md` and `data/processed/recommendation_demo.json` for every output.

The query set is author-written smoke coverage, not a reviewed relevance benchmark. It checks mechanics and records errors; it cannot establish production confidence thresholds. Future expert-labelled cases must evaluate domain relevance, allied-standard completeness, dense-only versus hybrid ablation, reranker effects by language, abstention, citation integrity, version/amendment evidence, and legal applicability separately. Never count synthetic matches as evidence of real-world recommendation accuracy.


Phases 6–8 add certification staleness/scope/hot-update tests and multilingual fallback/identifier/negation tests. `npm test` passes 26 unit tests. `npm run phase8-demo` runs 26 real FastAPI endpoint checks and the eight actual-model Hindi/Hinglish cases against the existing seed and persistent local database. Read `data/processed/api_integration_report.json` and `docs/multilingual_results.md`; 6/8 expected records rank first and 8/8 appear in the top five. These are smoke tests, not a calibrated evaluation set. Container/Neo4j execution is not covered.

Phase 9 browser tests live in `frontend/tests/workspace.spec.ts`. Run `npm run phase9-test` for actual local API, Phase 2 synthetic/verified records, persisted feedback, upload and multilingual workflows. This starts and stops its own demo processes; do not run concurrently with `phase9-demo`.
