# Offline recommendation engine

Phase 5 joins the existing local hybrid retriever to the Phase 3 standards graph. No generative model or external inference service supplies facts. The implementation is in `services/recommendation/engine.py`.

## Run and integrate

```sh
npm run phase5-demo
npm test
```

The demo uses the cached, checksum-verified embedding and cross-encoder models, the existing 150-edition Qdrant index, and a persistent local PostgreSQL-compatible PGlite database at `data/local/recommendations_pg`. It starts a loopback SQL endpoint, runs Python through `psycopg`, closes the endpoint, and reopens the database to verify persistence. Repeated runs append audit rows. This development database is not a native production PostgreSQL server. Docker is unavailable on the measured laptop; the Phase 4 Docker Qdrant configuration remains available but untested here.

For a separately provisioned local PostgreSQL server, export `DATABASE_URL` with a loopback PostgreSQL URL and call:

```python
from services.recommendation import recommend, recommend_tender, close_engine

try:
    result = recommend("wooden bedside table", top_k=5)
    report = recommend_tender("Supply wooden bedside tables.\nProvide cloud payroll software.")
finally:
    close_engine()
```

The first call loads the models and opens the audit connection; later calls reuse them. This local single-process interface is not a concurrent HTTP service. A failed model load, missing database, failed audit insert, or incompatible index raises an error. There is no unlogged success or remote fallback. Models must already exist locally; runtime does not download them. Provisioning and model swaps are described in [the retrieval report](retrieval.md).

## Retrieval, evidence, and version assembly

1. Resolve a literal IS number directly. A missing literal returns no invented substitute. For prose, merge BM25 and dense Qdrant retrieval through reciprocal rank fusion, then locally rerank up to 30 candidates down to ten.
2. Assemble each candidate from its specific index record. Rebuild the in-memory graph from that same record snapshot to prevent differences between the graph and index. Call the Phase 3 `expand_allied_standards` and `get_version_status` methods for each candidate.
3. Attach grouped relationship evidence, publication/version observations, amendment uncertainty, source labels, URLs, record IDs, fetch dates, and captured-page hashes where available. Generic references and same-committee links retain their weaker types; they never become invented normative or safety obligations.
4. Build a deterministic explanation quoting only the record title and recorded classification group. The response includes separate field-level evidence. No text about a standard's technical requirements is generated.
5. Persist the response before returning it. The requested top five are returned by default; `top_k` may be 1–10. Ambiguity is assessed before truncating to the requested number.

Unknown latest-version, amendment-resolution, and mandatory-certification facts remain null or explicitly unconfirmed. A latest edition in this partial KB is not proof of the latest BIS publication. Scores measure retrieval relevance; `applicability_confirmed` is always false. All procurement decisions require review.

## Confidence policy

`services/recommendation/config.json` is the default configuration; `RECOMMENDATION_CONFIG` can select another JSON file. No code change is needed to alter `confidence_threshold`, `ambiguity_margin`, synthetic inclusion, graph hop count, or extraction limits. The retrieval model selection remains in `kb/retrieval_config.json` or `RETRIEVAL_CONFIG`.

The pinned cross-encoder emits **logits**. The engine maps them to bounded relevance scores with a numerically stable sigmoid. This monotonic transform is **not calibrated correctness probability**. A model swap with probability outputs must also set `reranker_score_space` to `probability`, and thresholds must be evaluated again. The default cutoff, 0.70, is a conservative provisional setting, not a learned operating point. Expert-labelled positive, ambiguous, and out-of-domain examples are needed for calibration by domain and language.

When the best candidate is below the cutoff, or no candidate exists, the response says exactly:

> no confident match — showing closest candidates for human review

Two semantic candidates above the cutoff and within 0.08 of one another produce `ambiguous`. A literal match scores 1.0 **for identifier identity only** and reports `identifier_match`; it does not establish suitability, currentness, or mandatory certification. All candidate scores and threshold decisions remain visible, including low-scoring alternatives.

Synthetic records are excluded by default. The separate graph fixture in the demo explicitly enables them, retains `source="synthetic_seed"`, and prefixes its rationale with MOCK/SYNTHETIC. Synthetic certification details cannot be mistaken for legal determinations.

## Tender text handling

`services/nlp/tender_phrases.py` extracts product/material anchors using two-to-six-word sequences observed in KB titles, with limited English plural normalization. Clauses without known anchors remain queries, so an unsupported requirement is not silently removed. Original character spans and surrounding clauses are preserved. Repeated phrases retain all occurrences but cause one retrieval call.

Each phrase produces an audited recommendation. The aggregate deduplicates by edition record ID, keeps all contributing phrases and their scores, and uses the **maximum** relevance rather than adding confidence. The response remains partial when any phrase is weak, ambiguous, excluded, or omitted by a limit. There is no global top-five truncation that could hide an entire procurement item; `top_k` applies per phrase.

English negation markers such as “do not” retain the clause for manual review without positively recommending its product. Extraction is a heuristic, not full NER or requirements interpretation. It does not resolve every qualifier, coordinated phrase, or non-English negation; reviewers must inspect the original clauses. Unsupported languages fall back to clause queries. Text length and phrase limits are explicit; oversized individual clauses remain visible for review. PDF/DOCX parsing and upload endpoints are not part of this text-input implementation.

## Audit storage and evaluation

`services/recommendation/audit.sql` creates **`kb.recommendations_log`**. Each row contains a UUID, shared request-group UUID for tenders, query text, query kind, UTC creation/recording timestamps, status, scores, full JSON response, KB fingerprint, and model/recommendation configuration. The complete response includes model commit revisions and record-level citations. An aggregate references its phrase query IDs. If aggregate processing fails, already committed phrase rows remain available under their group ID; absence of an aggregate reveals the incomplete request.

The application only inserts audit rows. This is not a cryptographically tamper-evident archive: production PostgreSQL needs a restricted insert/select role, access controls, backups, retention policy, and administrative audit controls. Demo data and database files remain local; `data/local/` is ignored by Git. Query text may contain tender details, so the database should be governed like the source tenders.

```sql
SELECT id, created_at, kind, status, query_text, scores
FROM kb.recommendations_log
ORDER BY created_at DESC;
```

Eight actual-model smoke queries cover clear product phrases, broad ambiguous requests, a literal identifier, and out-of-scope software. [The readable output](recommendation_demo.md) shows all eight rankings. [The full JSON](../data/processed/recommendation_demo.json) contains every primary/allied record, rationale, source citation, version/amendment field, timing, and audit ID, plus the tender and synthetic graph demonstrations. These author-written examples are not an independent accuracy benchmark; weak results are retained as evaluation findings.

Eight unit tests cover low confidence, threshold equality and ambiguity, multi-hop supersession with visible synthetic provenance, real unknown facts, audit failure, tender merge and exclusions, extraction overflow, and invalid scores/configuration. The integration demo verifies SQL readback of complete responses and persistence across database reopening. External socket connections are blocked during the Python demo; model inference is entirely local.
