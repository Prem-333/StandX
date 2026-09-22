# Standards Desk frontend — Phase 9

React, TypeScript, Vite and Tailwind power two responsive screens: New Specification and Recommendations. Recommendations and feedback use the existing local FastAPI service. There are no canned recommendation responses in the app.

From the repository root, after the earlier backend dependencies, model caches and index are provisioned:

```sh
npm ci --ignore-scripts
npm --prefix frontend ci --ignore-scripts
npm run phase9-demo
```

Open `http://127.0.0.1:5173`. Allow the cached backend models to load during startup. The command starts a dedicated persistent PGlite database, the real API on an available loopback port, and Vite on port 5173. Close another API instance using the same local Qdrant index first. Stop with Ctrl+C. There are no runtime model downloads or external embedding calls.

The launcher enables the original Phase 2 synthetic records in a separate generated demo configuration; it does not change the production recommendation configuration. A persistent banner and per-record labels distinguish fixtures from individually verified BIS metadata. Synthetic version/certification examples have no legal effect. Sample buttons exercise an obsolete street-lighting fixture, a real bright-steel identifier, and Hindi input.

The local Vite proxy supplies a temporary API credential server-side, never through `VITE_*`, URLs, browser storage, or the client bundle. This is a trusted loopback demonstration, not a production authentication gateway. For a separately running API, use `npm --prefix frontend run dev` and enter the API key under **Connection**. It stays in tab memory only. The proxy target defaults to `http://127.0.0.1:8000`; `API_PROXY_TARGET` can select another loopback backend.

## Working interactions

- Paste a specification or drag/drop/select one PDF or DOCX up to 5 MiB. A selected file takes precedence over pasted text and is visibly removable. Multiple-product text can use tender phrase extraction. PDFs need selectable text; OCR is not implemented.
- Select English, Hindi or Hinglish. Original text, normalization and any translation fallback notices remain visible.
- Review scores, conditional latest-version badges, hard supersession/withdrawal warnings, amendment unknowns, grouped allied standards and exact record/relationship citations. Unknown currentness never becomes “Latest Version.”
- Expand dated ISI/CRS/Hallmark rules. Mandatory, voluntary and unknown states use distinct text and colors. An optional officer-supplied category remains a scope assertion; legal applicability is not confirmed.
- Use **Correct**, **Not relevant**, or **Suggest a different standard**. Suggestions first resolve an allowed KB record through the API; unknown identifiers cannot be submitted as corrections. Feedback persists in `kb.user_feedback`.
- Export the complete evidence envelope as JSON. The UI holds only the current report in memory; reload does not retrieve prior audit history.

## Build and verification

```sh
npm run frontend:build
npm run phase9-test
```

The browser suite starts the same real backend and closes it afterward. It covers desktop/mobile, synthetic and verified records, all feedback actions, Hindi/Hinglish, PDF/DOCX, upload validation, loading/error/empty states and export. Only the explicit unavailable-service test substitutes an error response; recommendations and feedback use actual API calls. External browser requests are blocked and fail their test. The demo API blocks external socket connections.

Playwright uses its provisioned browser, an explicit `E2E_CHROMIUM_PATH`, or an existing Windows Chromium cache. It never downloads a browser during tests. On a new host, provision a compatible test browser separately while online. See `data/processed/frontend_browser_environment.json`, `frontend_e2e_report.json`, `frontend_audit_check.json` and `frontend_screenshots/` for execution evidence. Audit row counts are cumulative in the dedicated development database. Do not run `phase9-test` concurrently with `phase9-demo`, since they share its database and vector store.

`npm run frontend:build` produces static assets in `frontend/dist`. A real deployment must serve those files behind an approved origin/session gateway and route `/v1` to the API. The development proxy must not be exposed as that gateway. The existing Docker Compose configuration covers the backend; this phase's clickable frontend launcher runs locally with Node. See [portal_integration_plan.md](../docs/portal_integration_plan.md) for proposed iframe/web-component and server-side REST modes, research limits, and required formal GeM partnership approval.
