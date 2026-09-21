# Live internet lookup audit log

Append one line for every internet-derived fact, dataset sample, or dependency version. Use the exact public source URL, the date it was fetched, and a one-line note explaining what it supported. Prefer official/primary sources. Include robots.txt and Terms of Use checks when accessing portals.

Entry format: `URL | YYYY-MM-DD | What was verified or used, including limitations where relevant`.

No live internet lookups have been performed in Phase 0. No dependency versions, external standards metadata, certification requirements, or model identifiers have been selected or verified. Python 3.11 and the planned stack are user-specified requirements.

| URL | Fetch date | Use / verification note |
| --- | --- | --- |
| https://helpdesk-docs.iso.org/article/596-online-browsing-platform-obp | 2026-09-20 | ISO OBP access and search documentation; searched and read during Phase 1; used as a discovery/access-separation precedent, not evidence of ISO backend architecture. |
| https://www.iso.org/obp/ui?_escaped_fragment_=iso%3Astd%3Aiso%3A18735%3Adis%3Aed-1%3Av1%3Aen | 2026-09-20 | Search-indexed OBP interface describes preview, document search and navigation; no standard content copied or downloaded. |
| https://www.iso.org/es/search/advanced-search/x/ | 2026-09-20 | Search-indexed catalogue filters inspected; subsequent direct open denied by robots.txt and not bypassed; live interface behavior remains unverified. |
| https://blog.ansi.org/ansi/searching-for-standards-comparing/ | 2026-09-20 | ANSI-authored explanation of structured number/title/abstract metadata; historical product guidance, not a current search implementation specification. |
| https://webstore.ansi.org/ | 2026-09-20 | Official indexed product page describes standards search, subscriptions and update alerts; no prices, corpus counts, or standards records adopted. |
| https://www.ansi.org/standards-news/all-news/21-ansi-launches-new-improved-standards-connect | 2026-09-20 | Read official 2020 Standards Connect announcement for subscription access, document viewing and administrative roles; historical feature precedent only. |
| https://web.ansi.org/cn/apjsp/StandardsConnect | 2026-09-20 | Indexed official trial guide describes catalogue/subscription search, filters, lists and alerts; direct open returned 502, so current interactive behavior is unverified. |
| https://europa.eu/youreurope/business/product-rules-compliance/general-product-compliance/identifying-product-requirements/index_en.htm | 2026-09-20 | Official guidance connects product characteristics and customs-code discovery to Access2Markets; used for contextual applicability design, not Indian law. |
| https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking/manufacturers_en | 2026-09-20 | Read official CE workflow separating applicable legislation, standards, product requirements and conformity assessment; used as a workflow precedent only. |
| https://trade.ec.europa.eu/access-to-markets/en/results?destination=BE&origin=US&product=401110 | 2026-09-20 | Indexed My Trade Assistant form shows product name/HS code, origin and destination inputs and database disclaimer; no product-specific legal answer adopted. |
| https://ted.europa.eu/en/simap/cpv | 2026-09-20 | Official CPV definition and hierarchical procurement vocabulary; supports optional versioned code mapping, not a BIS taxonomy or Indian mandate. |
| https://arxiv.org/abs/2107.01910 | 2026-09-20 | I40KG primary research on representing standards and relationships with an ontology; no reported accuracy transferred to this project. |
| https://arxiv.org/abs/2604.09868 | 2026-09-20 | ETSI standards retrieval study abstract inspected; research status and synthetic benchmark limitation recorded. |
| https://arxiv.org/html/2604.09868v1 | 2026-09-20 | Read retrieval method and results: lexical/dense fusion, structure, and graph expansion; expansion did not consistently help, motivating bounded expansion and ablations. |
| https://arxiv.org/abs/2409.05677 | 2026-09-20 | RIRAG/ObliQA primary research motivates evaluation of obligation coverage and contradictions; no dataset downloaded. |
| https://aclanthology.org/2025.regnlp-1.8/ | 2026-09-20 | Primary RegNLP paper documents misleadingly high automated evaluation scores; motivates independent human-reviewed evaluation. |
| https://aclanthology.org/2025.coling-main.178/ | 2026-09-20 | Primary compliance-checking paper separates factual, regulatory/process and computational layers; architectural precedent, not a BIS validation. |
| https://www.bis.gov.in/know-your-standard/?lang=en | 2026-09-20 | Searched and read current BIS description of IS-number/keyword search and related metadata; Explore links to standards.bis.gov.in. |
| https://standards.bis.gov.in/ | 2026-09-20 | Official search-indexed landing page exposes Know Your Standards and published/new/revised/review links; backend/API and complete live taxonomy were not verified. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=Nzc3NQ%3D%3D | 2026-09-20 | One read-only metadata-page inspection confirmed revision/amendment counts, Group/Sub Group/Sub Sub Group/Aspects, and incoming/outgoing references; no record ingested into KB. |
| https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=Nzc3NQ%3D%3D | 2026-09-20 | Final URL after metadata-page redirect; retained for taxonomy evidence and provenance, not an API contract or current-edition certification. |
| https://services.bis.gov.in/php/BIS_2.0/dgdashboard/published/standards?aspect=&commttid=MzMw&commttname=TElURCAyMg%3D%3D&from=&to= | 2026-09-20 | Indexed public catalogue displays Amendment and Reaffirmation Year separately; used for field separation only, not adoption of listed standards. |
| https://www.manakonline.in/MANAK/eBISLogin | 2026-09-20 | Read public login landing page only: CAPTCHA/OTP interface and jeweller-registration direction to NSWS; no login, submission, or credential handling. |
| https://manakonline.in/MANAK/resources/app_srv/Manuals/applicant_new.pdf | 2026-09-20 | Indexed official user-manual description of application/licensing workflows; manual not downloaded, and current transaction workflows not exercised. |
| https://www.bis.gov.in/bis-apps/?lang=en | 2026-09-20 | Read official BIS Care capabilities for licence, HUID and CRS verification and standards information; used to avoid duplicating authority functions. |
| https://www.bis.gov.in/product-certification/products-under-compulsory-certification/?lang=en | 2026-09-20 | Official indexed page explains QCO mechanism and lists Schemes I, II, IV and X; supports extensible scheme model without asserting any product's applicability. |
| https://www.bis.gov.in/product-certification/product-certification-process/?lang=en | 2026-09-20 | Official indexed process page identifies Scheme I mark and Scheme IV conformity-certificate routes; scheme-level context only. |
| https://www.crsbis.in/BIS/whatisCRS.do | 2026-09-20 | Official indexed CRS overview identifies Scheme II; no current product-specific requirement derived. |
| https://www.crsbis.in/BIS/general_dashhome.do?hmode=getProductpage | 2026-09-20 | Indexed CRS product table exposes product, IS identifier and implementation date columns; motivates product/date/rule separation; no rows copied to KB. |
| https://www.bis.gov.in/hallmarking-overview/mandatory-hallmarking-order/?lang=en | 2026-09-20 | Official indexed index lists order amendments and district coverage; supports date/geography-aware model, not a legal determination from the index alone. |
| https://www.bis.gov.in/wp-content/uploads/2021/07/Guidance-document-on-QCOs-Revised-1.pdf | 2026-09-20 | Indexed guidance directs applicability, exemptions and implementation-date queries to issuing ministry; historical guidance only, no PDF downloaded. |
| https://www.bis.gov.in/terms-and-conditions/?lang=en | 2026-09-20 | Read BIS terms: website information is not a statement of law; linked sites have separate policies; supports legal-source verification and policy gates. |
| https://www.bis.gov.in/terms-conditions/ | 2026-09-20 | Initial policy-location lookup did not establish the terms; canonical terms-and-conditions page subsequently located and used. |
| https://www.bis.gov.in/copyright-policy/ | 2026-09-20 | Initial read redirected to Hindi page without English policy text; explicit English URL subsequently read. |
| https://www.bis.gov.in/copyright-policy/?lang=en | 2026-09-20 | Read website-content attribution/reuse policy and third-party exclusion; not treated as permission to copy standards full text. |
| https://bis.gov.in/PDF/lab/copyright.pdf | 2026-09-20 | Standards-specific copyright-policy link timed out; no content retrieved, no permission inferred; project metadata-only restriction retained. |
| https://www.postgresql.org/docs/current/textsearch-controls.html | 2026-09-20 | Verified weighted lexical text search and ts_rank/ts_rank_cd capabilities; no PostgreSQL package/image version selected and no claim of built-in BM25. |
| https://qdrant.tech/documentation/search/hybrid-queries/ | 2026-09-20 | Verified multi-stage/hybrid retrieval and rank fusion concepts; application-side fusion chosen for PostgreSQL plus Qdrant baseline; no cloud inference dependency. |
| https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html | 2026-09-20 | Official retrieve/re-rank pattern supports shortlist cross-encoder stage; no embedding/reranker model selected. |
| https://www.mha.gov.in/MHA1/Par2017/pdfs/par2025-pdfs/LS11022025/118.pdf | 2026-09-20 | Official indexed parliamentary answer lists Hindi, Bengali, Tamil and Marathi in the Eighth Schedule; used for required language selection; no PDF downloaded. |
| https://mermaid.js.org/syntax/entityRelationshipDiagram.html | 2026-09-20 | Checked official ER syntax, keys and cardinality notation for architecture diagrams. |
| https://mermaid.js.org/syntax/flowchart.html | 2026-09-20 | Checked official flowchart syntax for component diagram. |
| https://mermaid.js.org/config/usage.html | 2026-09-20 | Indexed Mermaid API documentation describes parse-based syntax validation; current usage documentation also inspected. |
| https://mermaid.js.org/config/usage | 2026-09-20 | Current indexed runtime/bundle documentation inspected for local diagram validation; no browser CDN dependency added to project. |
| https://registry.npmjs.org/mermaid | 2026-09-20 | Live npm view returned Mermaid 12.0.0 and published tarball integrity for a temporary documentation validator, not a project runtime dependency. |
| https://registry.npmjs.org/mermaid/-/mermaid-12.0.0.tgz | 2026-09-20 | Downloaded official npm package with npm pack --ignore-scripts for temporary local Mermaid validation; integrity sha512-/wQXC9iBxoGV8p3erbvaXs9h77VyLDBH6GdayVjj3hEcSQhFU4N1WUhUppotCEqlIxI2pRMwjwBSwTB1MfZBgQ==; no project dependency or lockfile added. |

## Phase 1 access-policy checks

Research was performed before architecture drafting on 2026-09-20, beginning at 16:47:48 UTC and concluding after 16:57:51 UTC. Search discovery and selected document review used official sources and primary research. Indexed descriptions are identified above; a fetch date is not proof that an underlying index or page is current. Repeated search/open/find inspections of the same URL are summarized in its entry. Unused search hits were not adopted as facts or datasets.

| URL | Fetch date | Use / verification note |
| --- | --- | --- |
| https://services.bis.gov.in/robots.txt | 2026-09-20 | Web tool could not access; one direct policy request returned HTTP 404. No crawl permission or bulk access inferred. |
| https://www.services.bis.gov.in/robots.txt | 2026-09-20 | Direct policy request for redirect host returned HTTP 404; no enumeration or bulk retrieval performed. |
| https://www.manakonline.in/robots.txt | 2026-09-20 | Web tool unavailable; direct policy request returned HTTP 404; only public login landing page inspected. |
| https://manakonline.in/robots.txt | 2026-09-20 | Direct request failed hostname certificate validation; no TLS bypass or retry through an insecure connection. |
| https://www.bis.gov.in/robots.txt | 2026-09-20 | Web tool unavailable and direct request timed out during TLS handshake; policy remains unverified, with no automated collector enabled. |
| https://standards.bis.gov.in/robots.txt | 2026-09-20 | Web tool unavailable and direct request timed out; used indexed landing-page discovery, not an automated portal crawl. |
| https://www.iso.org/robots.txt | 2026-09-20 | Web tool unavailable; direct request returned HTTP 404; separately enforced robots denial on advanced-search page was respected. |
| https://helpdesk-docs.iso.org/robots.txt | 2026-09-20 | Web tool could not retrieve policy; no automated harvesting or standards download. |
| https://www.ansi.org/robots.txt | 2026-09-20 | Web tool could not retrieve policy; limited public documentation research only. |
| https://webstore.ansi.org/robots.txt | 2026-09-20 | Web tool could not retrieve policy; no catalogue harvesting or subscription-content access. |
| https://europa.eu/robots.txt | 2026-09-20 | Read policy; avoided restricted paths and spaced direct visits beyond stated ten-second crawl delay. |
| https://trade.ec.europa.eu/robots.txt | 2026-09-20 | Web tool could not retrieve policy; used indexed form description only. |
| https://single-market-economy.ec.europa.eu/robots.txt | 2026-09-20 | Web tool could not retrieve policy; one public guidance page reviewed, no automated collector. |
| https://arxiv.org/robots.txt | 2026-09-20 | Read policy permitting abstract/HTML paths with fifteen-second general crawl delay; direct paper visits spaced apart and no bulk downloads. |
| https://aclanthology.org/robots.txt | 2026-09-20 | Web tool could not retrieve policy; limited primary-paper abstract review, no corpus download. |

Access limitations above were disclosed during research. Any unverified portal behavior or automation permission is **unverified — confirm before relying on this**. No BIS standard PDF was downloaded, indexed, or redistributed. No authenticated portal workflow was exercised. No supported public BIS bulk metadata API was verified; the architecture therefore does not assume one.

## Phase 2 policy checks and acquisition research (2026-09-20)

| URL | Fetch date | Use / verification note |
| --- | --- | --- |
| https://services.bis.gov.in/robots.txt | 2026-09-20 | Web tool unavailable; direct request HTTP 404. No bulk permission inferred. |
| https://www.services.bis.gov.in/robots.txt | 2026-09-20 | Direct request HTTP 404; no crawler enabled. |
| https://www.manakonline.in/robots.txt | 2026-09-20 | Web tool unavailable; direct request HTTP 404; no bulk permission inferred. |
| https://www.bis.gov.in/terms-and-conditions/?lang=en | 2026-09-20 | Reviewed main-site terms: information requires verification; linked sites have separate policies. Portal-specific terms not located by search. |
| https://www.bis.gov.in/copyright-policy/?lang=en | 2026-09-20 | Page unavailable on repeat check. No additional reuse permission inferred. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=OTY2MA%3D%3D | 2026-09-20 | Manual record 01: furniture materials; public metadata HTML snapshot only. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=NDExMg%3D%3D | 2026-09-20 | Manual record 02: furniture; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTQxODU%3D | 2026-09-20 | Manual record 03: furniture; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTMwMzA%3D | 2026-09-20 | Manual record 04: furniture; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MjQ4NDU%3D | 2026-09-20 | Manual record 05: textiles; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MjI1MDM%3D | 2026-09-20 | Manual record 06: textiles; exact public metadata captured locally; no standards PDF. |
| https://www.services.bis.gov.in/php/BIS_2.0/ISL/is_details?IDS=NDExMg%3D%3D | 2026-09-20 | Older URL embedded in metadata returned HTTP 404; working details route used later, without inventing record content. |
| https://www.manakonline.in/MANAK/login | 2026-09-20 | Reviewed public e-BIS landing page and visible links; no bulk metadata feed or portal-specific harvesting licence verified. |
| https://up.data.gov.in/keywords/Bureau | 2026-09-20 | OGD search found BIS institutional statistics, not a complete standards metadata feed. |
| https://delhi.data.gov.in/resource/firm-wise-enforcement-activity-outlets-selling-toys-without-bureau-indian-standards-bis-0 | 2026-09-20 | OGD search found enforcement statistics rather than record-level standards catalogue. |
| https://www.bis.gov.in/wp-content/uploads/2024/03/ITSD_Tender_document_20240320.pdf | 2026-09-20 | Search-index excerpt only: XML conversion procurement mentions APIs internally; not evidence of an available public metadata API. No PDF downloaded. |

Search audit: `site:data.gov.in "Bureau of Indian Standards"`, `site:data.gov.in "Indian Standards" API`, `site:bis.gov.in "API" standards metadata`, `site:bis.gov.in "bulk" "data"`, and `site:nic.in "Bureau of Indian Standards" "API" yielded no verified documented public bulk standards metadata feed. This is a bounded search result, not proof that no feed exists. Unused unrelated hits were not adopted.

| https://pypi.org/pypi/psycopg/json | 2026-09-20 | Official package metadata checked directly: psycopg 3.3.6; SQL integration-test provisioning. npm web-tool lookups failed; direct registry access succeeded. |
| https://registry.npmjs.org/@electric-sql/pglite/latest | 2026-09-20 | Official package metadata checked directly: @electric-sql/pglite 0.5.8; SQL integration-test provisioning. npm web-tool lookups failed; direct registry access succeeded. |
| https://registry.npmjs.org/@electric-sql/pglite-socket/latest | 2026-09-20 | Official package metadata checked directly: @electric-sql/pglite-socket 0.2.11; SQL integration-test provisioning. npm web-tool lookups failed; direct registry access succeeded. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=Mjg1MTE%3D | 2026-09-20 | Manual record 07: textiles; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=Mjc0NzQ%3D | 2026-09-20 | Manual record 08: textiles; exact public metadata captured locally; no standards PDF. |
| https://huggingface.co/spaces/mteb/leaderboard | 2026-09-21 | Leaderboard landing page checked; dynamic rank table requires further inspection. |
| https://huggingface.co/BAAI/bge-m3 | 2026-09-21 | Candidate publisher card: MIT; 1024 dimensions; multilingual; no query prefix required. |
| https://huggingface.co/Qwen/Qwen3-Embedding-0.6B | 2026-09-21 | Candidate publisher model card retrieved for licence and architecture comparison. |
| https://huggingface.co/ibm-granite/granite-embedding-107m-multilingual | 2026-09-21 | Web fetch unavailable; not treated as verified model identity. |
| https://www.psycopg.org/psycopg3/docs/basic/transactions.html | 2026-09-21 | Atomic loader transaction semantics. |
| https://www.postgresql.org/docs/current/sql-insert.html | 2026-09-21 | PostgreSQL conflict upsert syntax. |
| https://pglite.dev/docs/pglite-socket | 2026-09-21 | Local SQL testing via PostgreSQL wire protocol; single-connection limitations acknowledged. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MzAxMzU%3D | 2026-09-21 | Manual record 09: steel_construction; exact public metadata captured locally; no standards PDF. |
| https://huggingface.co/api/spaces/mteb/leaderboard/tree/main | 2026-09-21 | Publisher metadata: leaderboard repository discovery or model commit, parameter count and weight size for laptop feasibility. |
| https://huggingface.co/api/models/ibm-granite/granite-embedding-97m-multilingual-r2?blobs=true | 2026-09-21 | Publisher metadata: leaderboard repository discovery or model commit, parameter count and weight size for laptop feasibility. |
| https://huggingface.co/api/models/Qwen/Qwen3-Embedding-0.6B?blobs=true | 2026-09-21 | Publisher metadata: leaderboard repository discovery or model commit, parameter count and weight size for laptop feasibility. |
| https://huggingface.co/api/models/BAAI/bge-m3?blobs=true | 2026-09-21 | Publisher metadata: leaderboard repository discovery or model commit, parameter count and weight size for laptop feasibility. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MzIwMTc%3D | 2026-09-21 | Manual record 10: steel_construction; exact public metadata captured locally; no standards PDF. |
| https://pypi.org/pypi/networkx/json | 2026-09-21 | Verified dependency networkx 3.6.1 for local graph/retrieval. |
| https://pypi.org/pypi/qdrant-client/json | 2026-09-21 | Verified dependency qdrant-client 1.19.1 for local graph/retrieval. |
| https://pypi.org/pypi/sentence-transformers/json | 2026-09-21 | Verified dependency sentence-transformers 6.1.0 for local graph/retrieval. |
| https://pypi.org/pypi/rank-bm25/json | 2026-09-21 | Verified dependency rank-bm25 0.2.2 for local graph/retrieval. |
| https://pypi.org/pypi/torch/json | 2026-09-21 | Verified dependency torch 2.14.0 for local graph/retrieval. |
| https://pypi.org/pypi/huggingface-hub/json | 2026-09-21 | Verified dependency huggingface-hub 1.32.0 for local graph/retrieval. |
| https://pypi.org/pypi/psutil/json | 2026-09-21 | Verified dependency psutil 7.2.2 for local graph/retrieval. |
| https://huggingface.co/spaces/mteb/leaderboard/raw/main/Dockerfile | 2026-09-21 | Live leaderboard application discovery; inspect current published rankings if exposed. |
| https://mteb-leaderboard.hf.space/ | 2026-09-21 | Live leaderboard application discovery; inspect current published rankings if exposed. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=NzgwOQ%3D%3D | 2026-09-21 | Manual record 11: steel_construction; exact public metadata captured locally; no standards PDF. |
| https://mteb-leaderboard-backend.hf.space/openapi.json | 2026-09-21 | Discovered leaderboard backend from its public HTML; inspected documented read-only benchmark endpoints. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=Nzc3NQ%3D%3D | 2026-09-21 | Manual record 12: steel_construction; exact public metadata captured locally; no standards PDF. |
| https://mteb-leaderboard-backend.hf.space/v1/benchmarks | 2026-09-21 | Current benchmark names and definitions from the official leaderboard backend. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTI4MTk%3D | 2026-09-21 | Manual record 13: safety_equipment; exact public metadata captured locally; no standards PDF. |
| https://mteb-leaderboard-backend.hf.space/v1/benchmarks/menu | 2026-09-21 | Leaderboard primary benchmark discovery. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTQ0OTc%3D | 2026-09-21 | Manual record 14: safety_equipment; exact public metadata captured locally; no standards PDF. |
| https://mteb-leaderboard-backend.hf.space/v1/benchmarks/MTEB%28Indic%2C%20v1%29/scores | 2026-09-21 | Current Indic benchmark scores for embedding candidate comparison; raw response archived. |
| https://huggingface.co/api/models/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1?blobs=true | 2026-09-21 | Reranker immutable revision and weight footprint verified. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTA2MA%3D%3D | 2026-09-21 | Manual record 15: safety_equipment; exact public metadata captured locally; no standards PDF. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2 | 2026-09-21 | Selected 97M multilingual R2 model card; Apache 2.0, 384 dimensions, Hindi/Bengali/Marathi/Telugu enhanced support; benchmark claims are publisher-reported. |
| https://huggingface.co/jinaai/jina-embeddings-v5-text-nano | 2026-09-21 | Publisher card lists CC BY-NC 4.0; excluded as default without suitable commercial licence. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 2026-09-21 | Selected multilingual cross-encoder card; Apache 2.0; language coverage limitations retained. |
| https://qdrant.tech/documentation/quickstart/ | 2026-09-21 | Local Docker port/volume and Qdrant client collection operations verified. |
| https://registry.npmjs.org/@electric-sql/pglite/-/pglite-0.5.8.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite, version 0.5.8; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-age/-/pglite-age-0.0.9.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-age, version 0.0.9; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_hashids/-/pglite-pg_hashids-0.0.9.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-pg_hashids, version 0.0.9; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_ivm/-/pglite-pg_ivm-0.0.9.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-pg_ivm, version 0.0.9; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_textsearch/-/pglite-pg_textsearch-0.0.10.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-pg_textsearch, version 0.0.10; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_uuidv7/-/pglite-pg_uuidv7-0.0.9.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-pg_uuidv7, version 0.0.9; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-pgtap/-/pglite-pgtap-0.0.9.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-pgtap, version 0.0.9; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-pgvector/-/pglite-pgvector-0.0.9.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-pgvector, version 0.0.9; integrity in package-lock.json. |
| https://registry.npmjs.org/@electric-sql/pglite-socket/-/pglite-socket-0.2.11.tgz | 2026-09-21 | npm SQL demo dependency node_modules/@electric-sql/pglite-socket, version 0.2.11; integrity in package-lock.json. |
| https://files.pythonhosted.org/packages/9e/c9/b2622292ea83fbb4ec318f5b9ab867d0a28ab43c5717bb85b0a5f6b3b0a4/networkx-3.6.1-py3-none-any.whl | 2026-09-21 | Python dependency networkx 3.6.1; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/d0/9f/becebdda02beddd422587eba0d7dfac5b1f1e0aa1ada5bcf9b9e6f1c3717/qdrant_client-1.19.1-py3-none-any.whl | 2026-09-21 | Python dependency qdrant-client 1.19.1; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/b5/6e/9115e19589c83172bd37ec793cfef7f7c719464053fa6a8882700c1f4488/sentence_transformers-6.1.0-py3-none-any.whl | 2026-09-21 | Python dependency sentence-transformers 6.1.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/1b/cf/d98dd561d6d0d7b7d7a64d1563f8aaaa7c235daee41c1c9bcc3da62420ed/huggingface_hub-1.32.0-py3-none-any.whl | 2026-09-21 | Python dependency huggingface_hub 1.32.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/2a/21/f691fb2613100a62b3fa91e9988c991e9ca5b89ea31c0d3152a3210344f9/rank_bm25-0.2.2-py3-none-any.whl | 2026-09-21 | Python dependency rank-bm25 0.2.2; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/9a/1e/a5475c00b0555e686333e6b4036f2213e7cbea021a772ce6f9ced4dcbd2f/torch-2.14.0-cp314-cp314-win_amd64.whl | 2026-09-21 | Python dependency torch 2.14.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/b4/90/e2159492b5426be0c1fef7acba807a03511f97c5f86b3caeda6ad92351a7/psutil-7.2.2-cp37-abi3-win_amd64.whl | 2026-09-21 | Python dependency psutil 7.2.2; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/98/b7/8c59a66d15205024662f1d66968136f13893f96df1ddc5087e2e281fc95f/hf_xet-1.6.0-cp38-abi3-win_amd64.whl | 2026-09-21 | Python dependency hf-xet 1.6.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/2a/39/e50c7c3a983047577ee07d2a9e53faf5a69493943ec3f6a384bdc792deb2/httpx-0.28.1-py3-none-any.whl | 2026-09-21 | Python dependency httpx 0.28.1; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/7e/f5/f66802a942d491edb555dd61e3a9961140fd64c90bce1eafd741609d334d/httpcore-1.0.9-py3-none-any.whl | 2026-09-21 | Python dependency httpcore 1.0.9; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/4b/a6/38c8e2f318bf67d338f4d629e93b0b4b9af331f455f0390ea8ce4a099b26/portalocker-3.2.0-py3-none-any.whl | 2026-09-21 | Python dependency portalocker 3.2.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/e8/d0/c502b60d684adbd98a8dc7d5bb866842772b816ac4354e4608be240041ae/transformers-5.17.0-py3-none-any.whl | 2026-09-21 | Python dependency transformers 5.17.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/db/f7/0a69ac6b82dbccf3f71add938a161c497952749294b8dd6dfe03a819dc40/tokenizers-0.23.2-cp310-abi3-win_amd64.whl | 2026-09-21 | Python dependency tokenizers 0.23.2; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/29/33/af0635ab07fe83b1788a1dbe370ff3e226062495a998335cb18a1cac81aa/filelock-4.0.1-py3-none-any.whl | 2026-09-21 | Python dependency filelock 4.0.1; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/6c/c0/a98505f18594f1bce828bb159cec0fcf9860562f1a2c85913409fc8f3d9e/fsspec-2026.9.0-py3-none-any.whl | 2026-09-21 | Python dependency fsspec 2026.9.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/44/03/640811d4d8c84f5e603995c5a9bab725223aa472cad9ca4286c3bbf1c3e3/grpcio-1.84.0-cp314-cp314-win_amd64.whl | 2026-09-21 | Python dependency grpcio 1.84.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/7e/22/e85faf23bd72a92d1921e37d674ca56eb298a3c8be31fdecef0ff2b3aaac/h2-4.4.1-py3-none-any.whl | 2026-09-21 | Python dependency h2 4.4.1; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/71/b4/4a9fcfb2aef6ba44d9073ecd301443aa00b3dac95de5619f2a7de7ec8a91/hpack-4.2.0-py3-none-any.whl | 2026-09-21 | Python dependency hpack 4.2.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/48/30/47d0bf6072f7252e6521f3447ccfa40b421b6824517f82854703d0f5a98b/hyperframe-6.1.0-py3-none-any.whl | 2026-09-21 | Python dependency hyperframe 6.1.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/21/82/3bf86d2e2808902013132e1ce905a7da0da53790f3836c64bf44d55e24f3/pywin32-312-cp314-cp314-win_amd64.whl | 2026-09-21 | Python dependency pywin32 312; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/c1/38/40a93e72703a741235115ed1b1e5f6b869917677b7643005034ce1611d70/regex-2026.9.10-cp314-cp314-win_amd64.whl | 2026-09-21 | Python dependency regex 2026.9.10; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/1b/6d/3fba214c1e5e0f69991677ec3bc17023f0421776975e1de0c682dca475e2/safetensors-0.8.0-cp310-abi3-win_amd64.whl | 2026-09-21 | Python dependency safetensors 0.8.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/a2/09/77d55d46fd61b4a135c444fc97158ef34a095e5681d0a6c10b75bf356191/sympy-1.14.0-py3-none-any.whl | 2026-09-21 | Python dependency sympy 1.14.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/43/e3/7d92a15f894aa0c9c4b49b8ee9ac9850d6e63b03c9c32c0367a13ae62209/mpmath-1.3.0-py3-none-any.whl | 2026-09-21 | Python dependency mpmath 1.3.0; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/dc/bf/205d0004930ede8f542fb58f601526fccf4ae7626075ca1e6c4de5d3d652/typer-0.27.2-py3-none-any.whl | 2026-09-21 | Python dependency typer 0.27.2; package-manager resolution recorded. |
| https://files.pythonhosted.org/packages/e0/f9/0595336914c5619e5f28a1fb793285925a8cd4b432c9da0a987836c7f822/shellingham-1.5.4-py2.py3-none-any.whl | 2026-09-21 | Python dependency shellingham 1.5.4; package-manager resolution recorded. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/1_Pooling/config.json | 2026-09-21 | Local embedding asset; SHA256 8bc5c9a40814fcf48d2fbe7cfeff4bee6736c3c2a823ba0ce098985c59d12ab7. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/config.json | 2026-09-21 | Local embedding asset; SHA256 de948b0bdc6f356afad7a84b276d8dd7e7fe10fb9add1bb5e610621c28e41ebc. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/config_sentence_transformers.json | 2026-09-21 | Local embedding asset; SHA256 93a59cbc7d82a47a7148719d9b21c0f2f111121e495b3918143184f4cd0ea25e. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/model.safetensors | 2026-09-21 | Local embedding asset; SHA256 f3ea88b230492811046145513710e76b4cc8c2ad49e8708da0e7247e548903be. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/modules.json | 2026-09-21 | Local embedding asset; SHA256 84e40c8e006c9b1d6c122e02cba9b02458120b5fb0c87b746c41e0207cf642cf. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/README.md | 2026-09-21 | Local embedding asset; SHA256 a73d22110e7e6d947f55cdd4f1a8b0b622e340fd09a66d302f5fe800899024bd. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/sentence_bert_config.json | 2026-09-21 | Local embedding asset; SHA256 967ef958285e4a7a37d8ff1832473d967edd913b4e48572f31c3d3ea361d5327. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/special_tokens_map.json | 2026-09-21 | Local embedding asset; SHA256 013787ee251ff611722479197c00853b62113ad303cb0a36524231783c676c69. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/tokenizer.json | 2026-09-21 | Local embedding asset; SHA256 4f2842d568e2724370aec203652a42ac783c7937f8347a1a2cc7506d71f1582f. |
| https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/resolve/835ad14087e140460703cf0fae09f97d469d65c2/tokenizer_config.json | 2026-09-21 | Local embedding asset; SHA256 6ed69389e30a8ecabfce2f9ebcdf0c908b34056f24d994340f2f216521c057d5. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/config.json | 2026-09-21 | Local reranker asset; SHA256 cc2cfe51aa3fd759d21d21acf5dfd6994aa67a3c9210636d22e143699d336c77. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/model.safetensors | 2026-09-21 | Local reranker asset; SHA256 5daeca2481a76b5976a2bdc32f0a78532b6716da4f8cd3ff59460ef8d2f359b4. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/README.md | 2026-09-21 | Local reranker asset; SHA256 474736a65d6393a060119a8dc304563af67af4d8d86ccfee4a05dd0df107fc11. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/sentencepiece.bpe.model | 2026-09-21 | Local reranker asset; SHA256 cfc8146abe2a0488e9e2a0c56de7952f7c11ab059eca145a0a727afce0db2865. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/special_tokens_map.json | 2026-09-21 | Local reranker asset; SHA256 378eb3bf733eb16e65792d7e3fda5b8a4631387ca04d2015199c4d4f22ae554d. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/tokenizer.json | 2026-09-21 | Local reranker asset; SHA256 62c24cdc13d4c9952d63718d6c9fa4c287974249e16b7ade6d5a85e7bbb75626. |
| https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1/resolve/1427fd652930e4ba29e8149678df786c240d8825/tokenizer_config.json | 2026-09-21 | Local reranker asset; SHA256 e7fbfbfa6347b4e414c1cee50d142e2c2f9a895dad68b068ae83a8b564c3837e. |
| https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MzAyNTQ%3D | 2026-09-21 | Manual record 16: safety_equipment; exact public metadata captured locally; no standards PDF. |
| https://api.github.com/repos/qdrant/qdrant/releases/latest | 2026-09-21 | Official Qdrant release v1.19.1 verified before pinning Compose image. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTMxNTE%3D | 2026-09-21 | Manual record 17: electrical_electronic; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MzE5MDE%3D | 2026-09-21 | Manual record 18: electrical_electronic; exact public metadata captured locally; no standards PDF. |
| https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MTEyODM%3D | 2026-09-21 | Manual record 19: electrical_electronic; exact public metadata captured locally; no standards PDF. |
| https://services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MjUxNDk%3D | 2026-09-21 | Manual record 20: electrical_electronic; exact public metadata captured locally; no standards PDF. |
| https://huggingface.co/api/models/Qwen/Qwen3-Embedding-0.6B?blobs=true | 2026-09-21 | Rechecked candidate licence and published weight bytes for comparison table. |
| https://huggingface.co/api/models/BAAI/bge-m3?blobs=true | 2026-09-21 | Rechecked candidate licence and published weight bytes for comparison table. |

## Audit closeout and date clarifications

Fetch dates use UTC. Earlier entries are retained; corrections below clarify when material was originally retrieved.

| URL | Fetch date | Use / verification note |
| --- | --- | --- |
| https://pypi.org/pypi/psycopg-binary/3.3.6/json | 2026-09-21 | Verified installed psycopg binary distribution version for the PostgreSQL loader. |
| https://www.psycopg.org/psycopg3/docs/basic/transactions.html | 2026-09-20 | Date clarification: originally fetched during Phase 2 before the date change; its later audit entry used the logging date 2026-09-21. |
| https://www.postgresql.org/docs/current/sql-insert.html | 2026-09-20 | Date clarification: originally fetched during Phase 2 before the date change; its later audit entry used the logging date 2026-09-21. |
| https://pglite.dev/docs/pglite-socket | 2026-09-20 | Date clarification: originally fetched during Phase 2 before the date change; its later audit entry used the logging date 2026-09-21. |
| https://registry.npmjs.org/@electric-sql/pglite/-/pglite-0.5.8.tgz | 2026-09-20 | Date clarification: npm package 0.5.8 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-age/-/pglite-age-0.0.9.tgz | 2026-09-20 | Date clarification: npm package 0.0.9 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_hashids/-/pglite-pg_hashids-0.0.9.tgz | 2026-09-20 | Date clarification: npm package 0.0.9 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_ivm/-/pglite-pg_ivm-0.0.9.tgz | 2026-09-20 | Date clarification: npm package 0.0.9 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_textsearch/-/pglite-pg_textsearch-0.0.10.tgz | 2026-09-20 | Date clarification: npm package 0.0.10 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-pg_uuidv7/-/pglite-pg_uuidv7-0.0.9.tgz | 2026-09-20 | Date clarification: npm package 0.0.9 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-pgtap/-/pglite-pgtap-0.0.9.tgz | 2026-09-20 | Date clarification: npm package 0.0.9 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-pgvector/-/pglite-pgvector-0.0.9.tgz | 2026-09-20 | Date clarification: npm package 0.0.9 was originally installed on this UTC date; later audit entry used logging date. |
| https://registry.npmjs.org/@electric-sql/pglite-socket/-/pglite-socket-0.2.11.tgz | 2026-09-20 | Date clarification: npm package 0.2.11 was originally installed on this UTC date; later audit entry used logging date. |

Phase 2 collection closed at 20 successful individual metadata snapshots (plus one older metadata URL returning 404). No additional BIS data retrieval is needed for graph/index rebuilds. The loader, parser, graph, and retrieval runtime contain no BIS network collector.

- 2026-09-21T08:18:13.537924+00:00 | https://huggingface.co/spaces/mteb/leaderboard | Rechecked live dynamic leaderboard frontend before retaining Phase 4 model choice.
- 2026-09-21T08:18:13.537937+00:00 | https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2 | Rechecked publisher card: Apache 2.0, 97M parameters, multilingual baseline.
- 2026-09-21T08:18:13.537941+00:00 | https://huggingface.co/Qwen/Qwen3-Embedding-0.6B | Rechecked publisher card: Apache 2.0 embedding candidate.
- 2026-09-21T08:18:13.537944+00:00 | https://huggingface.co/BAAI/bge-m3 | Rechecked publisher card: MIT embedding candidate.
- 2026-09-21T08:18:13.537947+00:00 | https://mteb-leaderboard-backend.hf.space/v1/benchmarks/MTEB%28Indic%2C%20v1%29/scores | Browser read failed; direct HTTPS read succeeded; saved current Indic scores in mteb_indic_scores_recheck.json.
- 2026-09-21T08:32:11.540259+00:00 | https://www.bis.gov.in/robots.txt | Manual robots policy retry; no collector or bulk crawl. Saved bis-robots.txt SHA256 48193a25243ddf0be6164a1c41812e0ef797874dfacdb7d691f8091cbd88d7d2

- 2026-09-21T08:32:12.054891+00:00 | https://huggingface.co/api/models/ai4bharat/indictrans2-indic-en-dist-200M?blobs=true | Official publisher repository metadata: commit, licence, gating and files/weight sizes. Saved indictrans2.json SHA256 4bba79a7e60ecc0c1f5d329e2875479eb931c3cf4b3cb26649bebdfd8445438c

- 2026-09-21T08:32:12.493932+00:00 | https://huggingface.co/api/models/facebook/nllb-200-distilled-600M?blobs=true | Official publisher repository metadata: commit, licence, gating and files/weight sizes. Saved nllb.json SHA256 ca477b0621e0648a06d5a13c0ac4a2bf8c4e7a49a67844efc765226edbff86cd

- 2026-09-21T08:32:12.946429+00:00 | https://huggingface.co/api/models/Helsinki-NLP/opus-mt-hi-en?blobs=true | Official publisher repository metadata: commit, licence, gating and files/weight sizes. Saved opus-hi-en.json SHA256 f145e9c116b7b0d69cf184a6e06627afdb721f80cc30622e3bf3f7c7bae4d497

- 2026-09-21T08:32:42.680333+00:00 | https://pypi.org/pypi/fastapi/json | Verified package release 0.141.1, Python requirement >=3.10; API/translation/document/graph dependencies.

- 2026-09-21T08:32:43.215770+00:00 | https://pypi.org/pypi/uvicorn/json | Verified package release 0.53.0, Python requirement >=3.10; API/translation/document/graph dependencies.

- 2026-09-21T08:32:44.662388+00:00 | https://pypi.org/pypi/pydantic/json | Verified package release 2.13.5, Python requirement >=3.9; API/translation/document/graph dependencies.

- 2026-09-21T08:32:45.209264+00:00 | https://pypi.org/pypi/python-multipart/json | Verified package release 0.0.32, Python requirement >=3.10; API/translation/document/graph dependencies.

- 2026-09-21T08:32:46.054654+00:00 | https://pypi.org/pypi/pypdf/json | Verified package release 6.19.0, Python requirement >=3.9; API/translation/document/graph dependencies.

- 2026-09-21T08:32:46.609214+00:00 | https://pypi.org/pypi/python-docx/json | Verified package release 1.2.0, Python requirement >=3.9; API/translation/document/graph dependencies.

- 2026-09-21T08:32:47.053968+00:00 | https://pypi.org/pypi/httpx/json | Verified package release 0.28.1, Python requirement >=3.8; API/translation/document/graph dependencies.

- 2026-09-21T08:32:47.531388+00:00 | https://pypi.org/pypi/langid/json | Verified package release 1.1.6, Python requirement None; API/translation/document/graph dependencies.

- 2026-09-21T08:32:48.336604+00:00 | https://pypi.org/pypi/sentencepiece/json | Verified package release 0.2.2, Python requirement >=3.9; API/translation/document/graph dependencies.

- 2026-09-21T08:32:48.938470+00:00 | https://pypi.org/pypi/sacremoses/json | Verified package release 0.2.0, Python requirement >=3.9; API/translation/document/graph dependencies.

- 2026-09-21T08:32:49.443522+00:00 | https://pypi.org/pypi/neo4j/json | Verified package release 6.3.1, Python requirement >=3.10; API/translation/document/graph dependencies.

- 2026-09-21T08:32:50.223963+00:00 | https://pypi.org/pypi/PyYAML/json | Verified package release 6.0.3, Python requirement >=3.8; API/translation/document/graph dependencies.

- 2026-09-21T08:33:14.884047+00:00 | https://huggingface.co/api/models/prajdabre/rotary-indictrans2-indic-en-dist-200M?blobs=true | Checked IndicTrans2 card-linked RoPE checkpoint licence, gating, commit and official asset formats.

- 2026-09-21T08:34:07.360827+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/README.md | Reviewed pinned IndicTrans2 RoPE local loading/preprocessing code before selecting the translation adapter.

- 2026-09-21T08:34:08.166222+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/configuration_rotary_indictrans.py | Reviewed pinned IndicTrans2 RoPE local loading/preprocessing code before selecting the translation adapter.

- 2026-09-21T08:34:09.216533+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/modeling_rotary_indictrans.py | Reviewed pinned IndicTrans2 RoPE local loading/preprocessing code before selecting the translation adapter.

- 2026-09-21T08:34:10.148266+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/tokenization_indictrans.py | Reviewed pinned IndicTrans2 RoPE local loading/preprocessing code before selecting the translation adapter.

- 2026-09-21T08:34:11.047004+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/config.json | Reviewed pinned IndicTrans2 RoPE local loading/preprocessing code before selecting the translation adapter.

- 2026-09-21T08:34:11.479028+00:00 | https://pypi.org/pypi/IndicTransToolkit/json | Verified official preprocessing toolkit version 1.1.1

- 2026-09-21T08:35:48.728763+00:00 | https://www.meity.gov.in/robots.txt | Allows all paths for User-agent *.

- 2026-09-21T08:35:48.728777+00:00 | https://www.bis.gov.in/terms-and-conditions/?lang=en | Website content is not a statement of law; verify ambiguities with BIS.

- 2026-09-21T08:35:48.728782+00:00 | https://www.bis.gov.in/product-certification/products-under-compulsory-certification/?lang=en | Current gateway separates Schemes I, II, IV and X; QCOs make selected product certification mandatory.

- 2026-09-21T08:35:48.728784+00:00 | https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en | Current Scheme I list includes bright steel bars, published IS 9550 2001; retain legal edition separately from KB 2024 observation.

- 2026-09-21T08:35:48.728787+00:00 | https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en | Current CRS row 2 covers Laptop/Notebook/Tablets and lists IS/IEC 62368 Part 1:2023; links March 2026 amendment.

- 2026-09-21T08:35:48.728790+00:00 | https://www.bis.gov.in/hallmarking-overview/mandatory-hallmarking-order/?lang=en | Index checked 21 September; lists amendments through August 2026. Gold scope and district/exemption conditions must be retained.

- 2026-09-21T08:35:48.728792+00:00 | https://www.bis.gov.in/wp-content/uploads/2026/08/Notification-related-to-mandatory-Hallmarking-2.pdf | Gazette 6 August 2026, order dated 3 August, substitutes gold hallmarking district annexure. Legal notification, not a standards PDF.

- 2026-09-21T08:35:48.728796+00:00 | https://bis.gov.in/wp-content/uploads/2024/09/Steel-and-Steel-Products-QCO-2024.pdf | Legal QCO table item 59: IS 9550:2001 Bright steel bars, immediate effect. No standards full text downloaded.

- 2026-09-21T08:35:48.728798+00:00 | https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2163768&lang=2&reg=48 | Government announcement dated 4 September 2025 explicitly states voluntary silver HUID hallmarking from 1 September 2025.

- 2026-09-21T08:35:48.728801+00:00 | https://www.bis.gov.in/hallmarking-jewellers/?lang=en | Current BIS FAQ describes gold mandatory scheme exemptions and registration for sellers of hallmarked articles.

- 2026-09-21T08:35:48.728803+00:00 | https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M | MIT, gated 200M distilled Indic-to-English card; links newer RoPE variants, toolkit preprocessing.

- 2026-09-21T08:35:48.728805+00:00 | https://huggingface.co/facebook/nllb-200-distilled-600M | CC-BY-NC-4.0; research model limitations, not selected as production default.

- 2026-09-21T08:35:48.728808+00:00 | https://huggingface.co/collections/prajdabre/indictrans2-rope | Card-linked extended-context IndicTrans2 family, including distilled Indic-to-English checkpoint.

- 2026-09-21T08:35:48.728810+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M | Ungated MIT author-published RoPE adaptation; selected CPU translation candidate, no official GGUF/quantized assets in repository.

- 2026-09-21T08:35:48.728812+00:00 | https://huggingface.co/Helsinki-NLP/opus-mt-hi-en | Apache-2.0 ungated Hindi-English alternative investigated; not selected while multilingual RoPE candidate is evaluated.

- 2026-09-21T08:36:44.724875+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/config.json | Local translation asset, SHA256 06dd19da284ef8478fcfb876fdadbacecd21e796dd11c8386c48f804b3cb0f86.

- 2026-09-21T08:36:44.734119+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/configuration_rotary_indictrans.py | Local translation asset, SHA256 1f52df6092f2bdf94603c5fd479302e53c97d8f2d81d74efb53912ef9bf9f952.

- 2026-09-21T08:36:44.746890+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/dict.SRC.json | Local translation asset, SHA256 3d3b180702520742dec423a5a7f7b4e3dad399d69e40ca7df294a1567884bed5.

- 2026-09-21T08:36:44.754685+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/dict.TGT.json | Local translation asset, SHA256 13c3a162fe655dbe99c790a413675c5d0634cd771fadcefe8d407676a7d1a311.

- 2026-09-21T08:36:44.759619+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/generation_config.json | Local translation asset, SHA256 ef78b1ec7fbbb8bd4c8d2621bc6147759747c797939e3cd25b7315f0a4bdc90e.

- 2026-09-21T08:36:44.771262+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/model.SRC | Local translation asset, SHA256 ac9257c8e76b8b607705b959cc3d075656ea33032f7a974e467b8941df6e98d4.

- 2026-09-21T08:36:44.778928+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/model.TGT | Local translation asset, SHA256 3cedc5cbcc740369b76201942a0f096fec7287fee039b55bdb956f301235b914.

- 2026-09-21T08:36:44.788264+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/modeling_rotary_indictrans.py | Local translation asset, SHA256 23072891eee99b50141112876130e4b2120d24ffb13529f5cda5ee9d67e9230c.

- 2026-09-21T08:36:46.531743+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/pytorch_model.bin | Local translation asset, SHA256 7dd9c49534c12a50da26222457d6b874d5473467be4a8afba5a0ea354b733341.

- 2026-09-21T08:36:46.539710+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/README.md | Local translation asset, SHA256 27db473409885b005d4c63fde293ad727b1c1b42fd2411af4b4b2cbbe4a1b54a.

- 2026-09-21T08:36:46.545008+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/special_tokens_map.json | Local translation asset, SHA256 9046da57c270c8e74d0f38832b4adce269c9d914ef21d2a0925e7772152dd793.

- 2026-09-21T08:36:46.546250+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/tokenization_indictrans.py | Local translation asset, SHA256 35396cf65b9fdc21379f8bc12cd658eec32fbe5de87a25fa5f4df190c5ffc4e3.

- 2026-09-21T08:36:46.553456+00:00 | https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M/resolve/00213ee82929050694b162123bb26a8dc177cdae/tokenizer_config.json | Local translation asset, SHA256 ec33ff280f6c68887696398c1aac67ca2f9bf0774b55123f5c1284f5e2b89f5f.

- 2026-09-21T08:36:48.919015+00:00 | https://pypi.org/pypi/einops/json | Verified einops 0.8.2 required by publisher translation code.

- 2026-09-21 | https://www.bis.gov.in/wp-content/uploads/2026/05/amendments-to-the-Electronics-and-Information-Technology-Goods-Requirements-for-Compulsory-Registration-2021-1.pdf | Browser revisiting failed; direct PDF transfer incomplete. No local snapshot accepted; unverified — confirm before relying on this until a successful primary read.

- 2026-09-21T08:40:32.840302+00:00 | https://hub.docker.com/v2/repositories/library/postgres/tags/17-bookworm | Verified official container tag 17-bookworm digest sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652

- 2026-09-21T08:40:33.339757+00:00 | https://hub.docker.com/v2/repositories/library/neo4j/tags/5.26-community | Verified official container tag 5.26-community digest sha256:3388e05ee53c8313d01acdf33e63ad175af95a92226dc8551160564439ce2c8c

- 2026-09-21T08:40:33.923389+00:00 | https://hub.docker.com/v2/repositories/library/python/tags/3.11-slim-bookworm | Verified official container tag 3.11-slim-bookworm digest sha256:a36c24f9cbdf4fd0f52d67f0823eeac19c2028c637cecc392d97f980d4fec56b

- 2026-09-21T08:53:42.406363+00:00 | https://pypi.org/pypi/indic-nlp-library-itt/0.1.1/json | Verified pure-Python Indic normalization/transliteration dependency used after toolkit Cython build failed.

- 2026-09-21T08:53:42.950361+00:00 | https://pypi.org/pypi/transformers/5.17.0/json | Pin the tested runtime for the reviewed local IndicTrans2 compatibility adapter.

- 2026-09-21T08:53:43.807124+00:00 | https://download.pytorch.org/whl/cpu/torch/ | Verify CPU-only Torch 2.14.0 Linux CPython 3.11 wheel availability for Docker provisioning.

- 2026-09-21T08:53:44.446889+00:00 | https://raw.githubusercontent.com/VarunGumma/IndicTransToolkit/main/IndicTransToolkit/processor.pyx | Read publisher preprocessing procedure: Unicode normalization, tokenization, script transliteration, language tags and English detokenization.

- 2026-09-21T08:53:44.465461+00:00 | https://files.pythonhosted.org/packages/cb/03/10388a42375ee7e4ac9b94eb2c5c569c8b5795e377e701c9ac3ad63de890/fastapi-0.141.1-py3-none-any.whl | Installed dependency fastapi 0.141.1; local pip report retains archive hash.

- 2026-09-21T08:53:44.465476+00:00 | https://files.pythonhosted.org/packages/76/18/0eea75741ee812e9f598b687619ce2454f6c3a1c5cd21ea990ec6bd26f45/uvicorn-0.53.0-py3-none-any.whl | Installed dependency uvicorn 0.53.0; local pip report retains archive hash.

- 2026-09-21T08:53:44.465480+00:00 | https://files.pythonhosted.org/packages/eb/47/c95ffc2009878c7aac0c5e08528022dcb885933252a88b5f170058014464/pydantic-2.13.5-py3-none-any.whl | Installed dependency pydantic 2.13.5; local pip report retains archive hash.

- 2026-09-21T08:53:44.465484+00:00 | https://files.pythonhosted.org/packages/3c/2c/c43c03eaf630435f023f1dc61ec4a4a78951ad5530a62c71cc89bde307b7/pypdf-6.19.0-py3-none-any.whl | Installed dependency pypdf 6.19.0; local pip report retains archive hash.

- 2026-09-21T08:53:44.465487+00:00 | https://files.pythonhosted.org/packages/d0/00/1e03a4989fa5795da308cd774f05b704ace555a70f9bf9d3be057b680bcf/python_docx-1.2.0-py3-none-any.whl | Installed dependency python-docx 1.2.0; local pip report retains archive hash.

- 2026-09-21T08:53:44.465489+00:00 | https://files.pythonhosted.org/packages/ea/4c/0fb7d900d3b0b9c8703be316fbddffecdab23c64e1b46c7a83561d78bd43/langid-1.1.6.tar.gz | Installed dependency langid 1.1.6; local pip report retains archive hash.

- 2026-09-21T08:53:44.465492+00:00 | https://files.pythonhosted.org/packages/33/fe/4906f12c458274edd96387e4baaad7c6f064a2b7c11a1cc2401c8a7bd483/sentencepiece-0.2.2-cp314-cp314-win_amd64.whl | Installed dependency sentencepiece 0.2.2; local pip report retains archive hash.

- 2026-09-21T08:53:44.465495+00:00 | https://files.pythonhosted.org/packages/f6/b7/c00aa54e29f8d79ba8ec22e7c48a1f02fa1b7c55bd1e4429edf7c6ecb231/sacremoses-0.2.0-py3-none-any.whl | Installed dependency sacremoses 0.2.0; local pip report retains archive hash.

- 2026-09-21T08:53:44.465497+00:00 | https://files.pythonhosted.org/packages/08/a5/e33f76f4eb7e72c350e65802151884048325f889ab5d156ce4b6d9bde959/neo4j-6.3.1-py3-none-any.whl | Installed dependency neo4j 6.3.1; local pip report retains archive hash.

- 2026-09-21T08:53:44.465500+00:00 | https://files.pythonhosted.org/packages/f7/3c/60674207246bc0a4009d2391b7c7251c7159f279c8d2ab8aae8ef46f3dee/pydantic_core-2.46.5-cp314-cp314-win_amd64.whl | Installed dependency pydantic_core 2.46.5; local pip report retains archive hash.

- 2026-09-21T08:53:44.465502+00:00 | https://files.pythonhosted.org/packages/0f/bc/5811cc73cac05e324e05ba9b0924e1a163a317a167ede8a9c748b11db30a/lxml-6.1.3-cp314-cp314-win_amd64.whl | Installed dependency lxml 6.1.3; local pip report retains archive hash.

- 2026-09-21T08:53:44.465508+00:00 | https://files.pythonhosted.org/packages/0f/7b/39c34ca613b0b198cb866466651b26b045e2009864c5183c979a3b83f383/pytz-2026.3.post1-py2.py3-none-any.whl | Installed dependency pytz 2026.3.post1; local pip report retains archive hash.

- 2026-09-21T08:53:44.482036+00:00 | https://files.pythonhosted.org/packages/2a/09/f8d8f8f31e4483c10a906437b4ce31bdf3d6d417b73fe33f1a8b59e34228/einops-0.8.2-py3-none-any.whl | Installed dependency einops 0.8.2; local pip report retains archive hash.

- 2026-09-21T08:53:44.482048+00:00 | https://files.pythonhosted.org/packages/99/2d/0c8b8de90ed687f8e7009b4e7c026d057b05be2bc3520a9515df235202f5/indic_nlp_library_itt-0.1.1-py3-none-any.whl | Installed dependency indic-nlp-library-itt 0.1.1; local pip report retains archive hash.
