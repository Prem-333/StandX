# Standards knowledge base

- `schema.sql`: normalized PostgreSQL metadata and immutable import evidence.
- `build_graph.py`: offline NetworkX graph, allied expansion, and version/amendment status; see `docs/graph.md`.
- `build_index.py`: real cached-model embeddings and local Qdrant storage; see `docs/retrieval.md`.
- `retrieval_config.json`: model/backend settings; inference fails when cache or index identity does not match.
- `graph.gpickle`, `index_manifest.json`, and `qdrant_storage/`: locally built artifacts. Never load an untrusted pickle.

Use `npm run phase2-demo`, `npm run phase3-demo`, and `npm run phase4-demo`. All runtime results retain record citations and explicit synthetic labels. Source verification means observed public metadata, not a guarantee of latest publication or legal applicability.
