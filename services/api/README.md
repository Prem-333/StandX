# FastAPI service

Run `python scripts/setup_local_env.py` then `npm run api:local` from the repository root. The local launcher uses the provisioned model/index caches and persistent PGlite development database. For native PostgreSQL, export `DATABASE_URL` and run `python scripts/serve_api.py`.

See [API documentation](../../docs/api.md) for endpoints, API keys, offline Swagger UI, uploads, audit/feedback, Docker setup and deployment limitations. `npm run phase8-demo` executes actual-model endpoint integration tests. Container and Neo4j startup remain untested on this host because Docker is unavailable.
