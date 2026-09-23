# Three-minute evidence demonstration

Start `npm run phase9-demo` before presenting and wait for API connected. The demo uses local models and a limited seed: 20 public metadata observations plus 130 synthetic editions. Keep the demo banner visible.

| Time | Action | What to explain |
|---|---|---|
| 0:00–0:30 | Paste `IS 9550:2024` and submit. | This identifier is from the verified metadata seed. Open its evidence panel to show record `bis-10`, source URL and fetch date. The UI preserves unknown latest-version status. |
| 0:30–1:00 | Expand the ISI mapping. | Show the rule verification date, scope limitations and official citation. A relevant standard does not establish legal applicability. |
| 1:00–1:35 | Edit the specification and choose the explicitly marked synthetic supersession example. | `IS-SEED-1001:2020` resolves through the fixture chain to `IS-SEED-1001:2024`. Open test methods and safety groups; every node has a citation and synthetic label. No fixture is represented as an actual BIS standard. |
| 1:35–2:05 | Upload `data/mock/phase9-tender.docx` or use Hindi `लकड़ी की बेडसाइड मेज`. | The API reads the document, or normalizes the query locally. Show original-language text retained with the report. If translation is unavailable, show the explicit English-only fallback notice. |
| 2:05–2:35 | Mark a candidate Correct, open History, and restore that report. | Feedback is stored in local SQL. Saved reports restore the original evidence snapshot without a new inference. History is scoped to the officer's credential. |
| 2:35–3:00 | Open Evidence Reports and export JSON; optionally search `IS-SEED-1001` in Directory. | The download contains the actual audit ID, records, model/config snapshot and KB fingerprint. A fingerprint identifies a snapshot; no digital signature or compliance certification is claimed. |

Cold translation can take longer than a short English query. Warm the Hindi demonstration once before judging, or choose the document flow. Do not quote fixture-only load-test latency as model performance. For an abstention example, use a cloud payroll subscription query and show the closest-candidate review notice.
