"""
StandX Phase 11 — Offline load test driver.

Runs the recommendation engine directly (no HTTP, no server required)
with 20 simulated concurrent officers using the gold-set queries.
Measures wall-clock latency distribution (p50, p95, p99) for the
recommend() call, which is the CPU-bound portion of any HTTP request.

The test uses FixtureRetriever (offline, no model files) to measure the
engine overhead. Real-model latencies are documented separately in
data/processed/load_test_results.md from actual Phase 4 benchmarks
(warm semantic median 0.627 s / p95 0.793 s with Qdrant + Granite 97M).

Usage:
    python scripts/run_load_test.py
    python scripts/run_load_test.py --users 20 --duration 30 --output data/processed/load_test_results.json
"""
import argparse
import json
import os
import random
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.ingestion.records import read_records
from services.recommendation.engine import RecommendationEngine, configuration


# ---------------------------------------------------------------------------
# Offline fixture retriever (mirrors eval/run_eval.py)
# ---------------------------------------------------------------------------

class FixtureRetriever:
    def __init__(self, records):
        self.records = records
        self.settings = {
            'max_tokens': 256,
            'embedding_revision': 'fixture-loadtest',
            'reranker_revision': 'fixture-loadtest',
        }
        self.reranker = SimpleNamespace(tokenizer=None)

    def search(self, query, include_synthetic=False, top_k=10):
        import re as _re
        from services.ingestion.records import identifier as _id
        eligible = [r for r in self.records
                    if include_synthetic or r['source'] != 'synthetic_seed']
        q_norm = _id(query.strip())
        literal = next((r for r in eligible if _id(r['is_number']) == q_norm), None)
        q_tokens = set(_re.sub(r'[^a-z0-9]', ' ', query.lower()).split())

        def score(r):
            text = (r.get('title', '') + ' ' + (r.get('scope_abstract') or '')).lower()
            t_tokens = set(_re.sub(r'[^a-z0-9]', ' ', text).split())
            overlap = len(q_tokens & t_tokens)
            return overlap / max(len(q_tokens), 1)

        rest = sorted([r for r in eligible if r is not literal],
                      key=lambda r: -score(r))

        def _c(r, match, rs):
            return {k: r[k] for k in ('record_id', 'is_number', 'title', 'source',
                                       'display_label', 'status')} | {
                'citation': r.get('source_url') or r['record_id'],
                'match': match, 'reranker_score': float(rs)}

        results = ([_c(literal, 'exact_identifier', 0.0)] if literal else []) + [
            _c(r, 'hybrid_reranked', max(0.1 - i * 0.01, -2.0))
            for i, r in enumerate(rest)
        ]
        return {'results': results[:top_k], 'candidates_reranked': len(results), 'timings': {}}

    def close(self):
        pass


class ListAudit:
    def __init__(self):
        self.rows = []
    def append(self, r):
        self.rows.append(deepcopy(r))
    def close(self):
        pass


# ---------------------------------------------------------------------------
# Load queries from gold set
# ---------------------------------------------------------------------------

def load_queries():
    gold_path = ROOT / 'eval' / 'gold_set.json'
    items = json.loads(gold_path.read_text(encoding='utf-8'))
    queries = []
    for item in items:
        if 'query' not in item:
            continue
        # Include both English and multilingual queries for realistic mix.
        queries.append(item['query'])
    return queries if queries else ['wooden bedside table procurement IS compliant']


# ---------------------------------------------------------------------------
# Worker
# ---------------------------------------------------------------------------

def worker(engine, queries, duration_s, worker_id):
    """Run recommend() in a loop for duration_s seconds; collect latencies."""
    latencies = []
    errors = 0
    deadline = time.perf_counter() + duration_s
    while time.perf_counter() < deadline:
        q = random.choice(queries)
        t0 = time.perf_counter()
        try:
            engine.recommend(q, top_k=5)
            latencies.append((time.perf_counter() - t0) * 1000)  # ms
        except Exception:
            errors += 1
    return {'worker_id': worker_id, 'latencies': latencies, 'errors': errors}


def percentile(values, p):
    if not values:
        return 0.0
    sorted_v = sorted(values)
    idx = max(0, min(len(sorted_v) - 1, int(len(sorted_v) * p / 100)))
    return round(sorted_v[idx], 1)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='StandX offline load test')
    parser.add_argument('--users', type=int, default=20,
                        help='Concurrent simulated officers (default 20)')
    parser.add_argument('--duration', type=int, default=30,
                        help='Test duration in seconds per worker (default 30)')
    parser.add_argument('--output', default='data/processed/load_test_results.json')
    args = parser.parse_args()

    records = read_records()
    queries = load_queries()
    settings = configuration()
    settings['confidence_threshold'] = 0.05

    print('=' * 60)
    print('StandX Phase 11 — Offline Load Test (FixtureRetriever)')
    print('=' * 60)
    print(f'  Concurrent users : {args.users}')
    print(f'  Duration/worker  : {args.duration} s')
    print(f'  Queries in pool  : {len(queries)}')
    print(f'  KB records       : {len(records)}')
    print()
    print('NOTE: This test uses FixtureRetriever (no model files).')
    print('      Latency measures engine overhead only, not embedding inference.')
    print('      Real-model latencies: see data/processed/load_test_results.md')
    print()

    # Each worker gets its own engine instance (mirrors one uvicorn worker per replica).
    def make_engine():
        retriever = FixtureRetriever(records)
        audit = ListAudit()
        return RecommendationEngine(retriever, audit, dict(settings))

    started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.users) as pool:
        futures = [pool.submit(worker, make_engine(), queries, args.duration, i)
                   for i in range(args.users)]
        results = [f.result() for f in as_completed(futures)]
    wall_time = time.perf_counter() - started

    all_latencies = [ms for r in results for ms in r['latencies']]
    total_errors = sum(r['errors'] for r in results)
    total_requests = len(all_latencies) + total_errors

    report = {
        'test_type': 'offline_fixture',
        'note': (
            'FixtureRetriever measures engine + Python threading overhead only. '
            'Real-model (Granite 97M + Qdrant) latencies from Phase 4: '
            'warm semantic median 0.627 s / p95 0.793 s (single-threaded). '
            'Under 20 concurrent users on a single server, p95 is expected to '
            'increase due to GIL contention on embedding inference; '
            'run against a provisioned server for accurate production numbers.'
        ),
        'concurrent_users': args.users,
        'duration_seconds_per_worker': args.duration,
        'wall_time_seconds': round(wall_time, 2),
        'total_requests': total_requests,
        'total_errors': total_errors,
        'error_rate_pct': round(total_errors / max(total_requests, 1) * 100, 2),
        'throughput_rps': round(total_requests / wall_time, 2),
        'latency_ms': {
            'p50': percentile(all_latencies, 50),
            'p75': percentile(all_latencies, 75),
            'p95': percentile(all_latencies, 95),
            'p99': percentile(all_latencies, 99),
            'min': round(min(all_latencies), 1) if all_latencies else 0,
            'max': round(max(all_latencies), 1) if all_latencies else 0,
        },
        'per_worker': [
            {'worker_id': r['worker_id'],
             'requests': len(r['latencies']),
             'errors': r['errors'],
             'p50_ms': percentile(r['latencies'], 50),
             'p95_ms': percentile(r['latencies'], 95)}
            for r in results
        ],
        'real_model_reference': {
            'source': 'Phase 4 benchmark (data/processed/phase4_benchmark.json)',
            'single_threaded_warm_median_ms': 627,
            'single_threaded_warm_p95_ms': 793,
            'startup_cold_ms': 37040,
            'peak_working_set_gib': 2.08,
        }
    }

    print('─' * 50)
    print(f'  Total requests  : {total_requests}')
    print(f'  Errors          : {total_errors}  ({report["error_rate_pct"]:.1f}%)')
    print(f'  Throughput      : {report["throughput_rps"]:.1f} req/s')
    print(f'  Latency p50     : {report["latency_ms"]["p50"]:.1f} ms')
    print(f'  Latency p75     : {report["latency_ms"]["p75"]:.1f} ms')
    print(f'  Latency p95     : {report["latency_ms"]["p95"]:.1f} ms')
    print(f'  Latency p99     : {report["latency_ms"]["p99"]:.1f} ms')
    print('─' * 50)

    out = ROOT / args.output
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'\nReport written → {out}')


if __name__ == '__main__':
    main()
