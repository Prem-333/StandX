# Dated certification mappings

The initial rules are a **curated four-category subset**, verified on **21 September 2026**. They are not a complete mandatory-products database. The engine never treats an absent mapping as a voluntary category or an exemption.

| Product category slug | Dated category requirement | Evidence and limits |
| --- | --- | --- |
| `bright_steel_bars` | BIS Product Certification / ISI, Scheme I: mandatory for the covered category | [Current BIS Scheme I list](https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en) and [Steel QCO](https://bis.gov.in/wp-content/uploads/2024/09/Steel-and-Steel-Products-QCO-2024.pdf), clauses 2, 4(1), 7 and schedule item 59. Preserve the legal table's IS 9550:2001 separately from the KB's 2024 observation. Export exceptions and actual scope need review. |
| `laptop_notebook_tablet` | CRS, Scheme II: mandatory for the covered category | [Current BIS Scheme II table](https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en), row 2. The category is verified; detailed transition provisions in its linked March 2026 amendment could not be reliably retrieved. |
| `gold_jewellery_artefacts` | Mandatory hallmarking, subject to scope, district and exemption conditions | [BIS order index](https://www.bis.gov.in/hallmarking-overview/mandatory-hallmarking-order/?lang=en) and [August 2026 notification](https://www.bis.gov.in/wp-content/uploads/2026/08/Notification-related-to-mandatory-Hallmarking-2.pdf). District coverage is not assumed nationwide. |
| `silver_jewellery_artefacts` | Voluntary hallmarking; neither ISI nor CRS is mapped for ordinary silver jewellery in this subset | [Government silver announcement](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2163768&lang=2&reg=48) explicitly states voluntary HUID hallmarking from 1 September 2025. Current checked gold-order sources did not establish a later silver mandate. This does not exempt other regulated products incorporating silver. |

The CRS amendment's detailed transition rules remain **unverified — confirm before relying on this**. The rule data carries this exact limitation. Do not replace the legal edition in a tender solely from the web table. The [BIS terms](https://www.bis.gov.in/terms-and-conditions/?lang=en) distinguish website information from a statement of law; officials should resolve legal ambiguities with the issuing authority.

## Rule data and evaluation

`data/processed/certification_rules.json` stores schemes and product-category rules, with IDs, source URLs, source locators, verification date, review date, effective date where established, legal references, conditions, and standard-family mappings. Legal references are **not new Standard KB records** and do not imply that their full metadata is present locally. No standard PDFs were downloaded. Access was manual and low volume; the direct BIS robots read allowed public paths while excluding the admin path. Source checks and failed reads are in `SOURCES.md`.

The 30-day review interval is an engineering policy, not a BIS requirement. After `review_after`, the evaluator changes the effective requirement to `unknown`, sets mandatory applicability to null, and exposes the last verified value. Every response says “as verified on” the actual observation date. Runtime performs no automatic internet refresh.

`mandatory_for_listed_category` describes the dated source listing. `applies_to_supplied_context` evaluates explicit officer assertions such as domestic supply, no exemption claimed, and district membership. Missing conditions produce null; unmet conditions require separate review rather than establishing voluntary status. `legal_applicability_confirmed` remains false. The current gold rule does not maintain its own district master list: the officer must check the cited annexure, article/purity scope, and exemptions.

`recommend()` attaches rules to a candidate through an explicit curated standard-family mapping and records that classification trigger, the candidate record ID/IS number, and the source URL. At present the real seeded bright-steel record has this mapping. Broad BIS taxonomy groups never imply that every product in that group needs the same certification. Callers can supply `product_category` explicitly, which is recorded as an asserted category rather than inferred from a weak retrieval result. Synthetic fixtures cannot trigger real legal rules.

## Updates without redeployment

Prepare one complete rule object as JSON, check its official evidence, and run:

```sh
python -m services.certification.admin reviewed-rule.json --actor officer-id
```

The CLI validates the rule, permits only HTTPS government source URLs, acquires a file lock, journals the intended change with before/after hashes and operator identity, and atomically replaces the document. The next request rereads it. Failed validation leaves the active rules unchanged. The local journal is `data/local/certification_rule_changes.jsonl`; an intent without matching active hash should be investigated after a crash. Administrative filesystem permissions control access to this script. This is not a cryptographically immutable approval workflow.

Compose mounts the **parent data directory**, so atomic file replacement becomes visible inside the container without restarting the API. A rule update does not rebuild embeddings or relabel the standards corpus. Add a controlled legal-review workflow and change approvals before a government deployment.

## Obsolete-version warnings and verification

Superseded and withdrawn candidates carry `severity="hard"`, with the complete supported successor chain resolved by Phase 3. The warning points to the final successor, never an intermediate edition. Unknown real publication status remains unknown. The demo uses explicitly labeled synthetic chains because the sampled real metadata does not establish such a chain.

Run `npm run phase6-demo` for the three category checks (ISI, CRS, and voluntary silver/no mapped ISI or CRS) plus the hard supersession warning. `npm test` also checks missing conditions, stale rules, unknown categories, validated hot updates, and withdrawn fixtures.
