# Phase 12 — Project quality review

Review date: **2026-09-23**. Scope: application correctness, evidence integrity, accessibility, local reliability and reproducible evaluation. Deployment was excluded at the owner's request. This review is not a production certification or a prediction of judging scores.

## Material defects corrected

| Area | Before | Corrected behaviour |
|---|---|---|
| Tender uploads | File selection fabricated extracted text and sent JSON | Actual multipart PDF/DOCX upload; 5 MiB validation; clear unsupported/scanned-document notices |
| Language input | Hinglish sent an unsupported language value | API-compatible `hi-Latn`; original text retained; local translation/fallback covered by browser tests |
| Provenance | `synthetic_seed` records could receive a “BIS LIVE” badge | Explicit MOCK / SYNTHETIC labels; verified public observations and unknown provenance distinguished |
| Versions | Withdrawn and superseded collapsed into a generic badge | Distinct withdrawal warning, final successor, fixture-only latest label, unknown currentness preserved |
| Certification | Non-mandatory/unknown could be styled as voluntary; evidence hidden | Exact requirement enum, source citation, date, stale flag, trigger, scope and unresolved conditions |
| Workspace | Invented history, compliance percentages, signatures and synchronization claims | Authenticated history, real KB directory, snapshot exports and actual runtime configuration |
| API isolation | Recommendation IDs alone permitted feedback lookup | Server-derived officer ownership for history, report restore and feedback; no inferred legacy ownership |
| Request handling | Streamed feedback bodies could bypass the size check | Bounded request bodies and in-flight inference admission; 413/503 responses are explicit |
| Swagger | Global CSP blocked its inline initialization | Per-response script nonce and bundled local assets; actual browser execution tested |
| Retrieval | First unresolved IS reference hid later valid references | Resolve all explicit known identifiers and list unresolved references; no guessed part/edition |
| Feedback learning | Unreviewed score boosts loaded automatically, including simulated fallback | Serving ignores global boosts; research proposals are isolated; database failure never invents officer feedback |
| Evaluation | Any-hit metric called recall; empty expected sets inflated scores; errors could pass | Fractional recall, separate abstention/errors, primary/allied grounding checks, real-model normalization |
| Usability | Drafts lost on navigation, static search, desktop-only layout | Preserved tab draft, search shortcut, responsive navigation, loading/empty/retry states and reduced-motion support |
| Assets | Four-megabyte icon font, unnecessary font subsets | Existing SVG icons and local Latin font subsets; Indic text uses the platform font fallback |

No additional BIS records were crawled. The KB remains 150 editions: 20 public metadata observations and 130 labelled synthetic records. Public metadata does not establish latest publication status or legal applicability.

## Validation and reproducibility

Run `npm run phase12-demo` for the sequential quality gate. Model-owning steps must not overlap: embedded Qdrant uses a single-process ownership lock. The gate runs unit/boundary tests, formatting, TypeScript, the frontend build, actual API integration and browser flows. `npm run eval:real` separately evaluates cached models and local normalization against the 40 author-written synthetic queries.

The latest machine-readable evidence is in:

- `data/processed/api_integration_report.json` — endpoint checks, network guard and multilingual smoke results.
- `data/processed/frontend_e2e_report.json` — browser cases and outcomes.
- `data/processed/frontend_audit_check.json` — SQL records created by browser requests.
- `data/processed/eval_real_report.json` — real-model metrics, individual queries, KB/model/config fingerprints and timestamp.
- `data/processed/frontend_screenshots/` — actual desktop and mobile captures.

The unit/boundary suite completes **34/34** tests and the actual API integration completes **40/40** checks. The repaired browser suite contains 16 end-to-end cases. Final full-run and real-model evaluation outcomes are recorded below.

The build before this review produced approximately 346 KB JavaScript and 113 KB CSS, plus a 4,002 KB icon font. The corrected build produces approximately **284 KB JavaScript and 39 KB CSS**, without that icon font. These are build artifact sizes, not network latency measurements.

## Model-cache integrity incident

A final check detected an embedding weight checksum mismatch and correctly refused to start. A read-only HEAD request to the publisher's existing pinned asset confirmed the manifest's hash. A separate provisioning operation restored that exact asset and verified the digest before replacing the local file. Neither the model revision nor the manifest was changed. The earlier mismatching bytes and repair metadata were retained under ignored `data/local/model_integrity_evidence/` for investigation. The cause of the local byte change is unknown; no hardware or security diagnosis is inferred. Runtime continues to verify cache hashes and never downloads model files.

## Remaining limits

The relevance score is uncalibrated and the evaluation labels are synthetic, not expert-approved. The verified metadata sample contains only 20 records, and its scope abstracts, version evidence and relationships are incomplete. Certification mappings cover selected dated examples, not the entire mandatory product universe. The multilingual smoke tests establish eight examples, not language-wide quality. Cold model loading/translation can take appreciably longer than warm English matching.

Feedback is durable but does not constitute a trained active-learning model. Source fingerprints identify snapshots; they do not make database records cryptographically immutable. API keys provide basic officer separation, not government SSO or a completed independent security assessment. Fixture-only load tests do not establish production model throughput. Existing Docker/hosting configurations were not changed or validated in this pass.

For a presentation grounded in the implemented behaviour, use `docs/demo_script.md`.


## Final quality-gate result

`npm run phase12-demo` completed with **exit code 0** after the cache restoration and parser correction: **34 unit/boundary tests, 40 API integration checks, 16 browser tests, TypeScript, formatting and the frontend build passed**. Browser results include zero skipped, flaky or unexpected tests. API integration recorded zero external network connection attempts. The machine-readable gate summary is `data/processed/quality_check_report.json`.


## Final real-model evaluation

`npm run eval:real` completed with exit code 0 after the parser fix and cache restoration. On **40 synthetic author-written queries** (35 in-scope, five out-of-scope): macro recall@5 **0.9857**, MRR **1.0**, unknown-KB-identifier rate **0**, execution errors **0**, and out-of-scope abstention **5/5**. The remaining partial recall comes from a query citing `IS 7524` without a part number: the engine returns the independently resolvable `IS 5983:1980`, flags `IS 7524` as unresolved, and does not guess Part 2. These are sample-specific retrieval measurements, not a 98.6% production correctness claim. Post-run embedding and reranker caches were rehashed successfully against their manifests.
