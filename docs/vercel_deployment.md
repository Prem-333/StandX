# Vercel frontend deployment

This phase deploys the React frontend separately from existing Vercel projects.
The existing `zorvian1/latent` project and `latent-rose.vercel.app` must not be
modified. StandX uses its own project and deployment branch, `codex/vercel-standx`.

## Scope and current limitation

Update 2026-09-26 (Phase 15): the production frontend is connected to Render at
https://standx-7gwu.onrender.com via server-only STANDX_API_ORIGIN. Vercel production
redeployment 8QtpSztbDdRHqXwPBnK464gyaQPb reached Ready. Use
https://standx-desk.vercel.app/; historical immutable preview URLs may remain
unconfigured. Browser verification passed connection, recommendation creation
and Audit History. Set STANDX_FRONTEND_ORIGIN and STANDX_API_KEY, then run
`npm run phase15-demo` to repeat read-only gateway checks. The earlier limitations
below describe the initial Phase 13 deployment before the backend existed.

The owner confirmed there is no hosted FastAPI backend. Until one exists, the
frontend displays **Backend not connected** and the gateway returns HTTP 503.
No recommendation, audit persistence, certification result or model inference
is simulated by this deployment. The local Phase 9 demo remains independent.

The repository's multi-service backend requires persistent PostgreSQL, a vector
index, its graph, and verified cached model files. Merely importing `frontend`
into Vercel does not provision those services. Do not upload local audit data,
officer API keys, `.env`, or model-cache evidence to the frontend project.

## Project configuration

- Import `Prem-333/StandX`, branch `codex/vercel-standx`, into a **new** project.
- Root directory: `frontend`; framework: Vite.
- Install: `npm ci`; build: `npm run build`; output: `dist`.
- `frontend/vercel.json` routes `/demo-context` and `/v1/*` to small Node handlers.
- Leave `STANDX_API_ORIGIN` unset until a real, tested HTTPS backend exists.
- Later set `STANDX_API_ORIGIN` to the backend origin, without a path or credentials,
  and redeploy this new project only. Officers supply their individual API keys;
  the gateway does not inject a shared credential or expose keys in a Vite bundle.

## Gateway behavior

Only documented API routes and query parameters are forwarded. The gateway
preserves multipart bytes, propagates JSON status codes and retry hints, disables
caching, refuses redirects, and bounds requests to 4,000,000 bytes. The hosted
file picker reserves 16,384 bytes for multipart fields. This stays below Vercel's
documented 4.5 MB function payload limit checked on 2026-09-23. The local demo
retains its 5 MiB upload limit. A timeout is not retried because the backend may
already have written an audit record. No document text or credentials are logged
by the gateway. Vercel infrastructure receives requests submitted to this host;
an air-gapped installation must use the original local deployment instead.

## Verification

Run `npm run phase13-demo` for eight gateway boundary tests and the frontend
TypeScript/production build. After deployment, check the root page, `/demo-context`
and `/v1/health`. Until the backend is configured, the latter must return 503,
not a successful health status. Backend end-to-end certification remains pending.

Official hosting sources are recorded in `docs/SOURCES.md`.

The Vercel import form parsed a slash-containing branch as a branch plus folder.
A deployment-only alias `codex-vercel-standx` points to the same tested commit as
`codex/vercel-standx`; use the alias for Vercel import. Neither alias modifies main.

Published frontend: https://standx-desk.vercel.app/ — HTTP 200 verified on
2026-09-23. `/demo-context` returns the missing-backend notice and `/v1/health`
correctly returns 503. This is a frontend deployment, not a complete hosted
recommendation service. Browser visual verification was interrupted by the
Computer Use URL-identification safety check. Confirm the new project's
production branch before future pushes; it was imported from
`codex-vercel-standx`, but the production tracking setting was not inspected.
