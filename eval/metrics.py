"""Phase 10 evaluation metrics: Recall@K, MRR, and hallucination rate.

All functions are pure (offline) and require no models or network access.
They operate on the gold-set items and raw recommendation response dicts
produced by RecommendationEngine.recommend().

Hallucination rule (Phase 0 grounding):
  Any IS number that appears in a recommendation response but does NOT exist
  in the KB record index is a hard failure.  The harness exits non-zero when
  hallucination_rate > 0.
"""
from __future__ import annotations
import re
from typing import Any


# ---------------------------------------------------------------------------
# Identifier normalisation (mirrors services/ingestion/records.py::identifier)
# ---------------------------------------------------------------------------

def _norm(value: str) -> str:
    """Strip whitespace and punctuation, uppercase — canonical comparison key."""
    return re.sub(r'[^A-Z0-9]', '', value.upper())


# ---------------------------------------------------------------------------
# Per-item metric helpers
# ---------------------------------------------------------------------------

def _returned_numbers(response: dict) -> list[str]:
    """Extract IS numbers from primary_standards in recommendation order."""
    return [s['is_number'] for s in response.get('primary_standards', [])]


def recall_at_k(expected: list[str], returned: list[str], k: int = 5) -> float:
    """1.0 if any expected IS number appears in the first k returned results,
    0.0 otherwise.  Negative/empty expected sets always return 1.0 (correct
    abstention is not penalised here; the hallucination check handles the
    false-positive side separately)."""
    if not expected:
        return 1.0  # out-of-scope: abstention is correct; scored separately
    expected_norm = {_norm(n) for n in expected}
    for is_number in returned[:k]:
        if _norm(is_number) in expected_norm:
            return 1.0
    return 0.0


def reciprocal_rank(expected: list[str], returned: list[str]) -> float:
    """1/rank of the first expected IS number in the returned list (1-indexed).
    Returns 0.0 if no expected IS appears at any position, and 1.0 for empty
    expected sets (correct abstention)."""
    if not expected:
        return 1.0
    expected_norm = {_norm(n) for n in expected}
    for rank, is_number in enumerate(returned, start=1):
        if _norm(is_number) in expected_norm:
            return 1.0 / rank
    return 0.0


def hallucination_flags(returned: list[str], kb_numbers: set[str]) -> list[str]:
    """Return IS numbers in *returned* that are NOT in the KB (normalised match).
    Any non-empty result is a hard Phase 0 grounding failure."""
    kb_norm = {_norm(n) for n in kb_numbers}
    return [n for n in returned if _norm(n) not in kb_norm]


# ---------------------------------------------------------------------------
# Batch evaluation
# ---------------------------------------------------------------------------

def evaluate(
    gold_items: list[dict[str, Any]],
    responses: list[dict[str, Any]],
    kb_numbers: set[str],
    k: int = 5,
) -> dict[str, Any]:
    """Compute Recall@k, MRR, and hallucination rate over a parallel list of
    gold items and recommendation responses.

    Args:
        gold_items:  List of gold-set dicts (metadata header excluded).
        responses:   List of recommendation response dicts in the same order.
        kb_numbers:  Set of all IS numbers present in the KB index.
        k:           Cut-off for Recall@K (default 5).

    Returns:
        A JSON-serialisable dict with aggregate metrics and per-item breakdown.
    """
    if len(gold_items) != len(responses):
        raise ValueError(
            f'gold_items ({len(gold_items)}) and responses ({len(responses)}) must be same length'
        )

    per_item: list[dict[str, Any]] = []
    total_recall = 0.0
    total_rr = 0.0
    all_hallucinated: list[dict[str, Any]] = []

    for item, response in zip(gold_items, responses):
        expected = item.get('expected_is_numbers', [])
        allow_empty = item.get('allow_empty', False)
        returned = _returned_numbers(response)

        r_at_k = recall_at_k(expected, returned, k)
        rr = reciprocal_rank(expected, returned)
        flags = hallucination_flags(returned, kb_numbers)

        # For out-of-scope items (allow_empty=True, expected=[]):
        #   recall and RR are trivially 1.0 (correct abstention).
        #   But if the model returned *anything* we record a hallucination-class
        #   error via a dedicated flag (false positive).
        false_positive = allow_empty and bool(returned)

        total_recall += r_at_k
        total_rr += rr
        if flags:
            all_hallucinated.append({'id': item['id'], 'hallucinated': flags})

        per_item.append({
            'id': item['id'],
            'domain': item.get('domain'),
            'query': item.get('query', '')[:120] + ('…' if len(item.get('query','')) > 120 else ''),
            'expected_is_numbers': expected,
            'returned_is_numbers': returned,
            'allow_empty': allow_empty,
            f'recall_at_{k}': r_at_k,
            'reciprocal_rank': rr,
            'hallucinated_numbers': flags,
            'false_positive_abstention': false_positive,
            'status': response.get('status'),
            'recommendation_id': str(response.get('recommendation_id', '')),
        })

    n = len(gold_items)
    n_nonempty = sum(1 for g in gold_items if not g.get('allow_empty'))
    n_scope_items = sum(1 for g in gold_items if g.get('allow_empty'))
    false_positive_count = sum(1 for p in per_item if p['false_positive_abstention'])
    hallucination_count = len(all_hallucinated)

    aggregates = {
        f'recall_at_{k}': round(total_recall / n, 4) if n else 0.0,
        'mrr': round(total_rr / n, 4) if n else 0.0,
        'hallucination_rate': round(hallucination_count / n, 4) if n else 0.0,
        'false_positive_rate': round(false_positive_count / n_scope_items, 4) if n_scope_items else None,
        'total_items': n,
        'in_scope_items': n_nonempty,
        'out_of_scope_items': n_scope_items,
        'hallucinated_items': hallucination_count,
        'false_positive_items': false_positive_count,
        'k': k,
    }

    return {
        'gold_set_warning': (
            'SYNTHETIC gold set — metrics are indicative only for demo and SIH evaluation. '
            'Not validated by BIS Sectional Committee members or procurement officers.'
        ),
        'aggregates': aggregates,
        'hallucination_details': all_hallucinated,
        'per_item': per_item,
    }
