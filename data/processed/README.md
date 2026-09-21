# Processed metadata and measurements

`bis_verified.json` contains the 20 individually checked metadata observations. `standards_seed.json` and its CSV counterpart contain 150 editions, including 130 explicitly labeled `synthetic_seed` fixtures. Rebuild offline with `python scripts/build_seed.py`. Original wording, empty values, source URLs/timestamps, record IDs, and raw-page hashes are retained; verification does not prove current legal applicability or latest publication.

`validation_report.json`, `phase2_report.json`, and `retrieval_benchmark.json` record curation findings, SQL integration counts/checks, and measured local inference. Run logs are supplementary diagnostics. Performance on the author-written smoke set is not a procurement-grade accuracy claim.

`recommendation_demo.json` contains eight real-only recommendation responses, the tender phrase/merge report, and a separately labeled synthetic graph fixture. It includes complete citations, version/amendment uncertainty, confidence decisions, query timings, and audit UUIDs. Persistent SQL rows live outside this directory in the Git-ignored `data/local/recommendations_pg` demo store. Rebuild these outputs with `npm run phase5-demo`.
