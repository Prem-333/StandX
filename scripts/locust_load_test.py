"""
StandX Phase 11 — Locust load test for /v1/recommend.

Simulates 20 concurrent procurement officers sending realistic tender
phrases from the Phase 10 gold set against the local API.

Usage (headless, 20 users, 60 s):
    locust -f scripts/locust_load_test.py \
           --headless -u 20 -r 4 -t 60s \
           --host http://127.0.0.1:8000 \
           --csv data/processed/load_test_results \
           --html data/processed/load_test_report.html

The API must be running before this script is invoked:
    npm run api:local           # dev — PGlite + local models
    # or: docker compose up     # prod stack

API key is read from LOAD_TEST_API_KEY env var (default: the dev key).
"""
import json
import os
import random
from pathlib import Path

from locust import HttpUser, task, between, events

ROOT = Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------------------
# Realistic query payloads drawn from Phase 10 gold set queries.
# English-only subset to ensure the fixture API produces consistent results
# without requiring a running translation model.
# ---------------------------------------------------------------------------

_GOLD_PATH = ROOT / "eval" / "gold_set.json"
_QUERIES: list[str] = []

def _load_queries():
    global _QUERIES
    try:
        items = json.loads(_GOLD_PATH.read_text(encoding="utf-8"))
        # Skip the header object and Hindi-only queries (non-ASCII majority)
        def _is_mostly_ascii(s: str) -> bool:
            ascii_chars = sum(1 for c in s if ord(c) < 128)
            return ascii_chars / max(len(s), 1) > 0.7
        _QUERIES = [
            item["query"]
            for item in items
            if "query" in item and _is_mostly_ascii(item["query"])
        ]
    except Exception as exc:
        print(f"[locust] Could not load gold set queries ({exc}); using fallback.")
        _QUERIES = [
            "Supply wooden bedside tables for hospital wards, IS compliant.",
            "Procure bright steel bars for precision machined components.",
            "Supply eye protectors for welding operations, BIS standard.",
            "Procurement of steam irons for laundry operations.",
            "Supply jute sacking bags for packing 35 kg groundnut.",
            "Provide breathing apparatus for mine rescue operations.",
            "Supply pressed ceramic tiles for government office flooring.",
            "Procure geosynthetic rope gabions for coastal protection.",
        ]

_load_queries()

_API_KEY = os.environ.get("LOAD_TEST_API_KEY", "dev-officer-key-standx-2026")

# ---------------------------------------------------------------------------
# Locust user
# ---------------------------------------------------------------------------

class ProcurementOfficer(HttpUser):
    """Simulates a procurement officer querying the recommend endpoint."""

    wait_time = between(1, 3)  # Realistic think-time between requests

    def on_start(self):
        self.headers = {
            "X-API-Key": _API_KEY,
            "Content-Type": "application/json",
        }

    @task(8)
    def recommend_query(self):
        """Standard text recommendation — most common operation."""
        query = random.choice(_QUERIES)
        payload = {"text": query, "top_k": 5, "tender": False}
        with self.client.post(
            "/v1/recommend",
            json=payload,
            headers=self.headers,
            catch_response=True,
            name="/v1/recommend [query]",
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                if "primary_standards" not in data:
                    resp.failure("Response missing primary_standards")
            elif resp.status_code == 401:
                resp.failure("Unauthorized — check LOAD_TEST_API_KEY")
            elif resp.status_code == 429:
                resp.success()  # Rate limiting is expected behaviour, not a failure
            else:
                resp.failure(f"Unexpected status {resp.status_code}")

    @task(2)
    def recommend_tender(self):
        """Multi-phrase tender document — less frequent but higher cost."""
        lines = random.sample(_QUERIES, min(3, len(_QUERIES)))
        text = "\n".join(lines)
        payload = {"text": text, "top_k": 5, "tender": True}
        with self.client.post(
            "/v1/recommend",
            json=payload,
            headers=self.headers,
            catch_response=True,
            name="/v1/recommend [tender]",
        ) as resp:
            if resp.status_code == 200:
                pass
            elif resp.status_code in (401, 429):
                resp.success()
            else:
                resp.failure(f"Unexpected status {resp.status_code}")

    @task(1)
    def health_check(self):
        """Periodic health probe — simulates monitoring."""
        with self.client.get(
            "/v1/health",
            headers=self.headers,
            catch_response=True,
            name="/v1/health",
        ) as resp:
            if resp.status_code in (200, 503):
                pass  # Both are valid; 503 means degraded, not test failure
            else:
                resp.failure(f"Unexpected health status {resp.status_code}")


# ---------------------------------------------------------------------------
# Event hooks for summary statistics
# ---------------------------------------------------------------------------

@events.quitting.add_listener
def on_quitting(environment, **kwargs):
    stats = environment.stats
    total = stats.total
    print("\n" + "=" * 60)
    print("StandX Load Test Summary")
    print("=" * 60)
    for name, entry in stats.entries.items():
        if entry.num_requests == 0:
            continue
        print(f"\n  {entry.name}")
        print(f"    Requests   : {entry.num_requests}")
        print(f"    Failures   : {entry.num_failures}")
        print(f"    p50 (ms)   : {entry.get_response_time_percentile(0.50):.0f}")
        print(f"    p95 (ms)   : {entry.get_response_time_percentile(0.95):.0f}")
        print(f"    p99 (ms)   : {entry.get_response_time_percentile(0.99):.0f}")
        print(f"    RPS        : {entry.current_rps:.2f}")
    print(f"\n  TOTAL requests : {total.num_requests}")
    print(f"  TOTAL failures : {total.num_failures}")
    print(f"  Failure rate   : {total.fail_ratio*100:.1f}%")
    print("=" * 60)
