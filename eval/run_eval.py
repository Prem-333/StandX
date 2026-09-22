"""Phase 10 evaluation harness runner.

Usage:
    python eval/run_eval.py [--real-retriever] [--k 5] [--output PATH]

Exits 0 if hallucination_rate == 0, exits 1 if any hallucinated IS number

is detected (hard Phase 0 grounding failure).

By default this uses FixtureRetriever (offline, no model files needed).
Set EVAL_USE_REAL_RETRIEVER=1 or pass --real-retriever to run against the
actual cached embedding model and Qdrant index.

The report is written to data/processed/eval_harness_report.json.
"""
import argparse
import json
import os
import sys
import time
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace

# Make sure the project root is on sys.path when run as a script.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from eval.metrics import evaluate
from services.ingestion.records import read_records
from services.recommendation.engine import RecommendationEngine, configuration


# ---------------------------------------------------------------------------
# Test double that mirrors Phase 4 Retriever interface (no model files needed)
# ---------------------------------------------------------------------------

class FixtureRetriever:
    """Offline retriever that returns records ranked by basic title-overlap
    with the query.  NOT a model: intended only for harness smoke-testing.
    Real accuracy numbers require the actual Retriever."""

    def __init__(self, records: list):
        self.records = records
        self.settings = {
            'max_tokens': 256,
            'embedding_revision': 'fixture-offline',
            'reranker_revision': 'fixture-offline',
        }
        self.reranker = SimpleNamespace(tokenizer=None)

    def _score(self, query: str, record: dict) -> float:
        """Naive token-overlap score for offline fixture use."""
        import re
        q_tokens = set(re.sub(r'[^a-z0-9]', ' ', query.lower()).split())
        text = (record.get('title', '') + ' ' + (record.get('scope_abstract') or '')).lower()
        t_tokens = set(re.sub(r'[^a-z0-9]', ' ', text).split())
        if not q_tokens:
            return 0.0
        overlap = len(q_tokens & t_tokens)
        return overlap / len(q_tokens)

    def _literal_match(self, query: str, records: list) -> dict | None:
        """Exact IS-number match (mirrors Retriever.search literal path)."""
        import re
        from services.ingestion.records import identifier
        q_norm = identifier(query.strip())
        for r in records:
            if identifier(r['is_number']) == q_norm:
                return {**{k: r[k] for k in ('record_id', 'is_number', 'title', 'source',
                                               'display_label', 'status')},
                        'citation': r.get('source_url') or r['record_id'],
                        'match': 'exact_identifier',
                        'reranker_score': 0.0}
        return None

    def search(self, query: str, include_synthetic: bool = False, top_k: int = 10) -> dict:
        eligible = [r for r in self.records
                    if include_synthetic or r['source'] != 'synthetic_seed']
        # Try literal identifier match first.
        literal = self._literal_match(query, eligible)
        if literal:
            rest = [r for r in eligible if r['record_id'] != literal['record_id']]
        else:
            rest = eligible

        scored = sorted(rest, key=lambda r: -self._score(query, r))

        def _candidate(r, score):
            return {k: r[k] for k in ('record_id', 'is_number', 'title', 'source',
                                       'display_label', 'status')} | {
                'citation': r.get('source_url') or r['record_id'],
                'match': 'hybrid_reranked',
                'reranker_score': float(score),
            }

        results = ([literal] if literal else []) + [
            _candidate(r, i) for i, r in enumerate(scored, start=0)
            if _candidate(r, 0)  # keep all
        ]
        # Convert to proper logit-like scores: rank→score mapping
        for idx, c in enumerate(results):
            if c['match'] != 'exact_identifier':
                c['reranker_score'] = max(0.1 - idx * 0.01, -2.0)
        return {
            'results': results[:top_k],
            'candidates_reranked': len(results),
            'timings': {},
        }

    def close(self):
        pass


# ---------------------------------------------------------------------------
# Audit sink (test double)
# ---------------------------------------------------------------------------

class ListAudit:
    def __init__(self):
        self.rows = []
    def append(self, response):
        self.rows.append(deepcopy(response))
    def close(self):
        pass


# ---------------------------------------------------------------------------
# Main harness logic
# ---------------------------------------------------------------------------

def load_gold_set(path: Path) -> tuple[dict, list]:
    """Load gold_set.json; separate header from items."""
    data = json.loads(path.read_text(encoding='utf-8'))
    header = data[0] if data and '_gold_set_type' in data[0] else {}
    items = [d for d in data if '_gold_set_type' not in d]
    return header, items


def build_engine(records: list, use_real: bool) -> tuple:
    audit = ListAudit()
    if use_real:
        print('[harness] loading real Retriever (requires provisioned model files)…')
        from services.nlp.retrieve import Retriever
        from services.recommendation.audit import PostgresAudit
        real_audit = PostgresAudit()
        retriever = Retriever()
        engine = RecommendationEngine(retriever, real_audit)
        return engine, real_audit
    retriever = FixtureRetriever(records)
    settings = configuration()
    # Lower threshold slightly so fixture scores can produce non-review results.
    settings['confidence_threshold'] = 0.05
    engine = RecommendationEngine(retriever, audit, settings)
    return engine, audit


def run(gold_path: Path, k: int, use_real: bool, output_path: Path) -> int:
    """Run the full evaluation harness.  Returns exit code (0 = clean, 1 = failure)."""
    print('=' * 70)
    print('StandX — Phase 10 Evaluation Harness')
    print('SYNTHETIC gold set — demo/SIH use only')
    print('=' * 70)

    records = read_records()
    kb_numbers = {r['is_number'] for r in records}
    header, gold_items = load_gold_set(gold_path)

    print(f'\nGold set : {len(gold_items)} items  (version {header.get("_gold_set_version","?")})')
    print(f'KB size  : {len(records)} records  ({len(kb_numbers)} unique IS numbers)')
    print(f'Metric K : {k}')
    print(f'Retriever: {"real (model)" if use_real else "fixture (offline)"}')
    print()

    engine, audit = build_engine(records, use_real)
    responses = []
    started = time.perf_counter()

    for i, item in enumerate(gold_items, 1):
        qid = item['id']
        try:
            resp = engine.recommend(item['query'], top_k=k)
        except Exception as exc:
            # Do not silently swallow failures — record as empty.
            print(f'  [{qid}] ERROR: {exc}')
            resp = {'primary_standards': [], 'status': 'error', 'message': str(exc),
                    'recommendation_id': 'error'}
        responses.append(resp)
        returned = [s['is_number'] for s in resp.get('primary_standards', [])]
        passed = any(
            r.replace(' ', '').upper() in [e.replace(' ', '').upper()
                                            for e in item['expected_is_numbers']]
            for r in returned[:k]
        ) or (item.get('allow_empty') and not returned)
        mark = 'PASS' if passed else 'FAIL'
        snippet = item['query'][:60] + '...' if len(item['query']) > 60 else item['query']
        print(f'  [{qid}] {mark} {snippet}')

    elapsed = time.perf_counter() - started
    engine.close() if hasattr(engine, 'close') else None

    print(f'\nEvaluation complete in {elapsed:.2f}s')
    print()

    results = evaluate(gold_items, responses, kb_numbers, k=k)
    agg = results['aggregates']

    # ------------------------------------------------------------------
    # Print summary table
    # ------------------------------------------------------------------
    print('─' * 50)
    print(f'  Recall@{k:<2}           : {agg[f"recall_at_{k}"]:.4f}  ({agg[f"recall_at_{k}"]*100:.1f}%)')
    print(f'  MRR                 : {agg["mrr"]:.4f}')
    print(f'  Hallucination rate  : {agg["hallucination_rate"]:.4f}')
    if agg.get('false_positive_rate') is not None:
        print(f'  False-positive rate : {agg["false_positive_rate"]:.4f}  (out-of-scope returned result)')
    print(f'  Total items         : {agg["total_items"]}')
    print(f'  In-scope items      : {agg["in_scope_items"]}')
    print(f'  Out-of-scope items  : {agg["out_of_scope_items"]}')
    print(f'  Hallucinated items  : {agg["hallucinated_items"]}')
    print('─' * 50)
    print()

    if results['hallucination_details']:
        print('GROUNDING FAILURES (Phase 0 hard rule violated):')
        for entry in results['hallucination_details']:
            print(f'  {entry["id"]}: {entry["hallucinated"]}')
        print()

    # Attach timing and retriever type to report.
    results['eval_seconds'] = round(elapsed, 3)
    results['retriever'] = 'real' if use_real else 'fixture'
    results['gold_set_version'] = header.get('_gold_set_version', '?')
    results['k'] = k

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Report written → {output_path}')

    exit_code = 1 if agg['hallucinated_items'] > 0 else 0
    if exit_code:
        print('\nEXIT 1 — hallucinated IS numbers detected (Phase 0 grounding rule violated).')
    else:
        print('\nEXIT 0 — no hallucinations detected.')
    return exit_code


def main():
    parser = argparse.ArgumentParser(description='StandX Phase 10 evaluation harness')
    parser.add_argument('--real-retriever', action='store_true',
                        help='Use the real Retriever (requires provisioned models)')
    parser.add_argument('--k', type=int, default=5, help='Recall@K cutoff (default 5)')
    parser.add_argument('--gold', default='eval/gold_set.json',
                        help='Path to gold set JSON (default: eval/gold_set.json)')
    parser.add_argument('--output', default='data/processed/eval_harness_report.json',
                        help='Output report path')
    args = parser.parse_args()

    use_real = args.real_retriever or os.environ.get('EVAL_USE_REAL_RETRIEVER', '') == '1'

    sys.exit(run(
        gold_path=ROOT / args.gold,
        k=args.k,
        use_real=use_real,
        output_path=ROOT / args.output,
    ))


if __name__ == '__main__':
    main()
