# Offline hybrid retrieval

## Model decision — checked 21 September 2026

Rechecked during Phase 5 on the same date: all three publisher cards remained accessible, and a direct read of the official leaderboard backend reproduced the 220-row Indic response and the candidate values below. The browser tool could not read that JSON endpoint; direct HTTPS succeeded. The repeat snapshot is `data/raw/mteb_indic_scores_recheck.json`; every lookup is appended to `docs/SOURCES.md`. Both selected local model caches passed manifest checksum verification before Phase 5 inference. No additional model download was needed.

The measured laptop has an Intel Core i5-10300H, eight logical processors, 17,008,979,968 bytes of physical memory (about 16 GB), and a GTX 1650 Ti with about 4 GB VRAM. The benchmark uses **CPU, four Torch threads, float32, batches of eight, and 256-token limits**; it makes no GPU performance claim. Public metadata documents reached only 96 tokens in this seed.

The [MTEB Space](https://huggingface.co/spaces/mteb/leaderboard) now serves a dynamic frontend. Its documented backend provided a live [Indic benchmark response](https://mteb-leaderboard-backend.hf.space/v1/benchmarks/MTEB%28Indic%2C%20v1%29/scores), archived under `data/raw/mteb_indic_scores.json`. It contained 220 rows. The three candidate rows had null aggregate means, so the raw rank fields **are not treated as a comparable overall quality ranking**. This is a current check of one relevant benchmark, not a claim about a universal MTEB winner.

| Candidate and publisher card | License | Published weight file | Float32 weight-only estimate | Live Indic raw position / BelebeleRetrieval score |
| --- | --- | --- | --- | --- |
| [Granite 97M multilingual R2](https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2) | Apache 2.0 | 194,889,568 bytes, BF16 | ~0.36 GiB | 185 / 0.39156 |
| [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B) | Apache 2.0 | 1,191,586,416 bytes, BF16 | ~2.22 GiB | 95 / 0.67584 |
| [BGE-M3](https://huggingface.co/BAAI/bge-m3) | MIT | 2,271,145,830 bytes, PyTorch weights | ~2.12 GiB | 122 / 0.69335 |

Weight-only estimates are arithmetic from parameter counts, not measured RAM/VRAM requirements. Tokenizers, activations, framework allocations, sequence length, and concurrent services add memory. Raw row positions are shown for audit completeness; incomplete benchmark coverage prevents reading them as trustworthy aggregate ranks. The task scores are benchmark-specific and do not establish performance on Indian procurement documents.

**Default: Granite 97M multilingual R2.** It minimizes laptop memory/compute costs, provides 384-dimensional vectors, and its publisher lists enhanced support for Hindi, Bengali, Marathi, and Telugu. The choice is a constrained-laptop baseline, not an accuracy victory over Qwen or BGE. The selected smoke evaluation and its Bengali ranking error are recorded below. A larger expert-labelled procurement evaluation should decide any deployment default; no head-to-head local benchmark of all three models was performed.

[Jina v5 text nano](https://huggingface.co/jinaai/jina-embeddings-v5-text-nano) was checked additionally: its card lists CC BY-NC 4.0, so it is not the permissively licensed default. The lightweight [mMARCO MiniLM cross-encoder](https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1) uses Apache 2.0 and a 470,592,698-byte weight file. Its card advertises 15 languages; it does not establish equal support across every scheduled language. Multilingual retrieval and reranking quality must be evaluated separately.

## Local provisioning and configuration

```sh
python -m pip install -r requirements.txt
npm ci --ignore-scripts
python scripts/provision_models.py
```

Provisioning is the only model-download step. It downloads pinned publisher commits, excludes alternate ONNX/OpenVINO weights, writes file hashes to each model directory, and appends asset URLs to `docs/SOURCES.md`. The selected assets are already cached locally under `models/granite-97m-r2` and `models/mmarco-minilm`; they are excluded from version control. Preserve model license files when moving them to an air-gapped laptop.

Runtime verifies the manifest identity and every file hash, sets Hugging Face/Transformers offline mode, uses `local_files_only=True`, disables remote model code, and fails on missing assets. **No external embedding or reranking API is called.** The benchmark additionally rejects external socket connections and records attempted connections.

Edit `kb/retrieval_config.json`, or point `RETRIEVAL_CONFIG` to another JSON file, to change models, immutable revisions, cache paths, prefixes, device, token limits, batch size, candidate limits, or Qdrant mode. A model swap needs the new model's verified card/license, explicit provisioning, then an index rebuild; it needs no Python code change for compatible SentenceTransformer/CrossEncoder models. Qwen's instruction format must be reflected in `query_prefix`. Model-specific code requiring `trust_remote_code=True` is intentionally not enabled. A mismatched index/model/prefix configuration fails instead of mixing incompatible embeddings.

## Index and search behavior

`python kb/build_index.py` creates **one retrieval document per edition** from its identifier, title, available public scope abstract, and classification. Missing real scopes stay missing. It refuses to silently truncate an overlong document; raise the configured limit and rebuild if necessary. Vectors are normalized and stored using cosine distance. The collection name includes a corpus/model fingerprint, so a changed corpus cannot silently reuse stale points. `kb/index_manifest.json` ties records, model settings, point identifiers, and build metrics together.

Payloads include `{is_number, title, status, group, certification_required}` plus provenance, citation, record ID, source date, display label, and document. Real `certification_required` is null unless independently evidenced; the seed supplies no real mandatory-scheme determination. Synthetic payloads remain visibly labeled.

Search first resolves literal IS identifiers, including edition and part aliases. A requested identifier absent from the allowed KB returns an explicit abstention, never a nearest-number guess. A family query orders its known editions newest first. Exact matches bypass semantic ranking and cannot be displaced by a cross-encoder.

For prose queries, Unicode-aware BM25 preserves exact jargon while dense retrieval captures paraphrases and multilingual similarity. Reciprocal rank fusion sums `1 / (60 + rank)` across the two ranked lists, avoiding comparison of incompatible raw scores. The local cross-encoder scores the best 30 fused candidates and returns the top 10. Hybrid search is intended to cover complementary failure modes; this implementation does not claim a statistically demonstrated improvement over dense-only retrieval. A future ablation needs expert labels. Candidate scores are not calibrated confidence or legal applicability; every result supplies its KB citation.

Search excludes synthetic records by default. The judged seed benchmark explicitly enables them so that all 150 records participate, with visible source labels. Use `python -m services.nlp.retrieve "wooden bedside table"` for real-only candidates, or add `--include-synthetic` for fixture demonstrations.

## Qdrant deployment

The available machine has no Docker executable. The implemented and measured default is Qdrant's **persistent local Python mode**, stored at `kb/qdrant_storage`, not an emulated random-vector store. Local mode allows one process to own the store; close a search process before rebuilding.

Phase 8 supersedes the earlier Qdrant-only Compose file with `docker-compose.yml`, containing the full backend on an internal network. Qdrant is not exposed on a host port. Its container configuration is `kb/retrieval_docker_config.json`; the API and initializer use the fixed service hostname only when `OFFLINE_DOCKER=1`. Ordinary local configuration still accepts loopback only. Provision images and models before going offline. Docker execution is **not tested on this host**; use [the API deployment instructions](api.md).

## Measured seed benchmark

Run `npm run phase4-demo` to verify caches, rebuild the index, warm the models once, and repeat each query three times. The JSON evidence is `data/processed/retrieval_benchmark.json`.

| Measurement | Result |
| --- | --- |
| Seed size | 150 editions: 20 BIS observations + 130 synthetic |
| Full index build, including model loading and local storage | 33.18 s |
| Embedding work within build | 3.71 s |
| Retriever startup, both models | 6.34 s |
| Warm semantic end-to-end median, 21 runs | 0.627 s |
| Warm semantic p95, nearest lower observed sample | 0.793 s |
| Peak process working set | 2.08 GiB |
| External connection attempts during measured run | 0 |
| Semantic smoke-set expected record in top 10 | 7/7 |
| Semantic smoke-set expected record first | 6/7 |
| Exact known identifier and unknown-identifier abstention | Both passed |

These are actual CPU/local-Qdrant measurements on Python 3.14.6, the interpreter available here; Python 3.11 remains the project target and was not executed on this host. The full build includes Qdrant import/startup and persisted upserts, not just encoding. This is a small author-written smoke set, not a quality benchmark or a production latency guarantee. English, Hindi, Bengali, Marathi, and Telugu are exercised. The Bengali eye-protection query ranked security glass first, although the expected eye-protector record remained in the top ten. Record that failure and curate a stronger multilingual evaluation before deployment.
