# Evaluation Plan — StandX Procurement Standards Recommendation Engine

> **Gold-set status**: SYNTHETIC — built from the Phase 2 seed corpus by the project author. Not validated by domain experts. See §4 for the expert-validation roadmap.

---

## 1. Purpose

This document describes the evaluation strategy for the StandX recommendation engine: how the current synthetic gold set was constructed, what the metrics mean, what their limitations are, and — critically — what a real deployment would need to do before trusting these numbers in production.

---

## 2. Current evaluation harness (Phase 10)

### 2.1 Gold set construction

`eval/gold_set.json` contains **40 synthetic tender-specification snippets** paired with the IS number(s) that a domain expert would ideally select.  It was constructed as follows:

1. The Phase 2 seed corpus (`data/processed/standards_seed.json`) contains exactly **20 `bis_public_metadata_verified` records** across five procurement domains: `furniture`, `textiles`, `steel_construction`, `safety_equipment`, and `electrical_electronic`.
2. For each domain, **8 items** were written by the project author, covering:
   - **Direct product-name matches** — query clearly names the product type (e.g., "wooden bedside tables").
   - **Scope/classification indirect matches** — query uses related terminology (e.g., "grab tensile strength" instead of the full IS title).
   - **Multi-standard queries** — a single tender phrase reasonably requires two IS numbers (e.g., steam irons + general appliance safety).
   - **Multilingual queries** — 7 items in Hindi (Devanagari) or Hinglish (romanised Hindi) to exercise the Phase 7 normalisation path.
   - **Out-of-scope negatives** — 5 items where the correct answer is an empty result (abstention); these test the Phase 0 grounding rule against hallucination.
3. Each item is labelled `"gold_set_type": "synthetic_demo"` and carries a visible warning string.

### 2.2 Metrics

| Metric | Definition | Notes |
|---|---|---|
| **Recall@5** | Fraction of queries where at least one expected IS number appears in the top-5 returned results | Multi-standard queries need only one expected IS to pass; out-of-scope negatives trivially pass |
| **MRR (Mean Reciprocal Rank)** | Mean of 1/rank of the first expected IS number across all queries | Higher is better; 0.0 if no expected IS appears anywhere in results |
| **Hallucination rate** | Fraction of queries where at least one returned IS number does **not** exist in the KB index | Must be **0.0** — any non-zero value is a hard Phase 0 grounding failure and causes the harness to exit non-zero |
| **False-positive rate** | Fraction of out-of-scope queries where the engine returned at least one result (should have abstained) | Secondary metric; low confidence threshold is expected to produce some false positives with the fixture retriever |

### 2.3 Active-learning re-weighting loop

`scripts/retrain_reranker.py` reads accumulated `reject` and `correct` feedback signals from `kb.user_feedback` and maintains a per-standard boost/penalty in `data/processed/reranker_boosts.json`.

- `reject` → −0.1 to that standard's boost (floor −1.0)
- `correct` → +0.1 to the suggested standard's boost (ceiling +1.0)
- Boosts **decay by 0.007 per day** toward zero, so stale signals do not accumulate indefinitely.
- The engine reads the boosts file at runtime; no model weights are modified.
- The change log in `data/processed/reranker_boosts_log.jsonl` provides a full audit trail.

---

## 3. Limitations of the current setup

1. **Self-authored gold set** — the same person who wrote the engine also wrote the gold-set queries. This creates an optimism bias: queries may unconsciously use vocabulary that matches the retrieval index.
2. **Small KB** — only 20 verified IS records; real recall numbers would drop significantly on a corpus of 22,000 standards.
3. **Fixture retriever** — the offline harness uses a naive token-overlap scorer, not the real embedding + cross-encoder pipeline. Recall numbers from `--real-retriever` are more meaningful.
4. **No inter-annotator agreement** — a single annotator labelled the gold set. Real IAA metrics (Cohen's κ, Fleiss' κ) have not been computed.
5. **Languages** — only Hindi and Hinglish are tested in the gold set. Bengali, Marathi, Tamil, Telugu, Gujarati, and other Scheduled-Languages procurement queries are not covered.

---

## 4. Expert-validation roadmap (real deployment)

A production deployment of StandX must replace the synthetic gold set with an expert-validated one before reporting accuracy claims to procurement officers, auditors, or regulators. The recommended process:

### Step 1 — Identify annotators (4–6 weeks before evaluation)

Recruit **at minimum two** of the following for each procurement domain:
- **BIS Sectional Committee members** relevant to that domain (e.g., CED for construction, ETD for electrical).
- **Experienced GeM/CPPP procurement officers** with ≥3 years of standards-referencing experience in that domain.
- **Technical auditors** from a government quality council (QCI, BEE, NABL, or equivalent).

### Step 2 — Annotation protocol

1. Provide annotators with real tender-clause extracts (anonymised) from past completed procurements.
2. Each annotator independently selects all IS numbers they would cite for each clause. No system output is shown during annotation.
3. Resolve disagreements by discussion; document the rationale for each disputed case.
4. Compute **inter-annotator agreement** (Cohen's κ for binary relevance per IS number; Fleiss' κ for three or more annotators). Target κ ≥ 0.70 before accepting a gold item.
5. Items below κ threshold are discarded or escalated to a senior committee member.

### Step 3 — Gold set size targets

| Domain | Minimum items | Target items |
|---|---|---|
| Furniture | 30 | 60 |
| Textiles | 30 | 60 |
| Steel/Construction | 30 | 60 |
| Safety equipment | 30 | 60 |
| Electrical/Electronic | 30 | 60 |
| **Total** | **150** | **300** |

Negative/out-of-scope items should constitute at least 15% of the total.

### Step 4 — Multilingual annotation

For each Hindi and Hinglish item, additionally verify with a bilingual procurement officer that the query is realistic and unambiguous. Target at least 20% multilingual coverage.

### Step 5 — Holdout and refresh

- Keep 20% of the validated set as a **locked holdout**, never used for tuning.
- Refresh the gold set annually or after any major BIS corpus update.
- Archive all annotation worksheets with timestamps for audit.

### Step 6 — Reporting

Metric numbers derived from the expert-validated gold set may be reported in procurement authority documentation. Numbers from the synthetic gold set are for demo and internal development tracking only and must not appear in official claims.

---

## 5. Data provenance

The synthetic gold set was constructed on **2026-09-22** from `data/processed/standards_seed.json` (Phase 2). No real tender documents were used; all queries are fictional. The expected IS numbers are drawn exclusively from verified Phase 2 records or clearly labelled synthetic seed records.

All source audit entries are in `docs/SOURCES.md`.
