# Local retrieval service

`python -m services.nlp.retrieve "QUERY"` runs exact-identifier resolution, Unicode BM25, cached-model dense retrieval, reciprocal rank fusion, and a local cross-encoder. It returns cited candidate records, not legal applicability decisions. Synthetic records are excluded unless `--include-synthetic` is explicit. Missing literal identifiers produce abstention. See `docs/retrieval.md` for setup, model swaps, limitations, and benchmark evidence.

`tender_phrases.py` extracts metadata-anchored phrases or unmatched clauses with original spans for the Phase 5 `services.recommendation` Python interface. The recommendation engine adds confidence handling, graph evidence, and persistent local SQL audit. See `docs/recommendation_engine.md`. PDF/DOCX parsing, upload endpoints, and the HTTP API remain future work.
