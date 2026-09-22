# Load Test Results — StandX Phase 11

> **Test scope**: offline load test against the recommendation engine (no HTTP server, no network). Measures Python engine overhead under concurrent load. Real-model (embedding + reranking) latencies are documented separately from Phase 4 benchmarks.

---

## Test configuration

| Parameter | Value |
|---|---|
| Concurrent simulated users | 20 |
| Duration per worker | 15 s |
| Total test wall time | ~16 s |
| Query pool | 40 queries from `eval/gold_set.json` (English + Hindi/Hinglish) |
| Retriever | `FixtureRetriever` (offline, no model files — measures engine overhead) |
| KB size | 150 records |
| Platform | Windows 11, i5-10300H, 8 logical cores, ~16 GB RAM |

---

## Results — engine overhead (fixture retriever)

| Metric | Value |
|---|---|
| **Total requests** | 6,689 |
| **Errors** | 0 (0.0%) |
| **Throughput** | 422.4 req/s |
| **p50 latency** | **42.0 ms** |
| **p75 latency** | 48.7 ms |
| **p95 latency** | **65.5 ms** |
| **p99 latency** | 165.3 ms |

Full JSON report: [`data/processed/load_test_results.json`](../data/processed/load_test_results.json)

---

## Real-model latency reference (Phase 4 benchmark)

The fixture test above isolates engine logic and Python threading overhead. The dominant latency contributor in a production deployment is the embedding + reranking inference pipeline. From Phase 4:

| Metric | Single-threaded warm (Phase 4) |
|---|---|
| Median (p50) | **627 ms** |
| p95 | **793 ms** |
| Cold startup | 37,040 ms (~37 s, one-time) |
| Peak working set | 2.08 GiB |

These numbers were measured with:
- Model: IBM Granite 97M multilingual R2 (sentence-transformers embedding)
- Reranker: multilingual MiniLM cross-encoder
- Retriever: Qdrant local persistent mode
- Platform: same laptop (i5-10300H, 16 GB)

---

## Projected latency under 20 concurrent officers (production estimate)

The single-threaded p95 is 793 ms. Under 20 concurrent requests:

- **With 1 API worker** (default): requests are serialised due to Python GIL on CPU-bound inference. Expected p95 ≈ **793 ms × 2–4 = 1.6–3.2 s** under 20 simultaneous users. The model is the bottleneck, not the database.
- **With 4 API replicas** (recommended): each replica holds the model in RAM and processes requests concurrently. Expected p95 per replica ≈ 800 ms; system p95 ≈ **800–1,200 ms** at 20 users (5 users/replica). This is within the 2 s guidance for interactive government systems.
- **With a GPU** (RTX 3080 or better): inference drops to ~80–150 ms (10× speedup); p95 under 20 concurrent users would be **< 300 ms** with a single replica.

### Key bottleneck: GIL + CPU-bound embedding

The recommendation engine uses the Python GIL-held cross-encoder for reranking. To fully utilise multiple CPU cores with a single process, the reranker must be moved to a subprocess or a separate Triton/ONNX Runtime service. `docker-compose.prod.yml` currently uses `--workers 1`; increasing to `--workers 4` requires shared-memory Qdrant clients or a separate Qdrant service per worker (already the case in the Docker Compose topology).

---

## Locust HTTP load test (requires live API)

A full HTTP load test including TLS, nginx, PostgreSQL audit writes, and the real embedding model can be run with:

```sh
# Start the API first:
npm run api:local   # or docker compose up

# In a separate terminal:
locust -f scripts/locust_load_test.py \
       --headless -u 20 -r 4 -t 60s \
       --host http://127.0.0.1:8000 \
       --csv data/processed/locust_results \
       --html data/processed/locust_report.html
```

Expected p95 with real model + audit writes: **1,200–2,000 ms** at 20 concurrent users on a laptop. On a dedicated 16 GB server with NVMe storage: **600–1,000 ms**. These estimates must be validated before production deployment.

---

## Recommendation for PSU pilot sizing

| Concurrent users | Recommended replicas | Expected p95 | RAM (models + OS) |
|---|---|---|---|
| 1–5 | 1 | < 1 s | 4 GB |
| 6–20 | 4 | 1–2 s | 12 GB |
| 21–50 | 8 (2 servers) | 1–2 s | 24 GB across 2 nodes |
| 50+ | Horizontal scale (§4 of pilot_readiness.md) | — | — |

For a single PSU with 20 concurrent users, a single 16-core/32 GB server with 4 API replicas is the recommended minimum configuration.

---

*Report generated: 2026-09-22 · StandX Phase 11*
