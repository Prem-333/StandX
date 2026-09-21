# Allied standards graph

## Implemented model

Each `Standard` node is **one edition**, not an entire numbered family. It holds the published identifier and title, classification, source tag, fetch date, citation, latest observed edition, and known status. A real page whose publication status was not established has `status: unknown`; forcing it to `active` would make an unsupported claim. Synthetic nodes explicitly exercise `active`, `superseded`, and `withdrawn` states.

Amendments and certification schemes are separate node types. There are 150 edition nodes, 10 synthetic amendment nodes, and 5 synthetic scheme nodes. Real amendment counts are retained on their editions; individual amendment details are not invented from a count. Every synthetic node and relationship retains `source: synthetic_seed`.

| Edge | Stored direction | Expansion behavior |
| --- | --- | --- |
| `NORMATIVE_REFERENCE` | Referencing standard → referenced standard | Follow outward |
| `TEST_METHOD_FOR` | Test standard → product standard | Follow inward from the product |
| `TERMINOLOGY_FOR` | Terminology standard → subject standard | Follow inward |
| `SAFETY_STANDARD_FOR` | Safety standard → product standard | Follow inward |
| `INSTALLATION_STANDARD_FOR` | Installation standard → product standard | Follow inward |
| `SUPERSEDES` | New edition → old edition | Resolve old → new through the complete chain |
| `AMENDED_BY` | Edition → amendment | Used for amendment status, not an allied-standard result |
| `SAME_COMMITTEE` | Both directions between editions with the same observed committee | Weak association; never used as a traversal bridge |
| `REQUIRES_CERTIFICATION` | Edition → scheme | Only explicit evidence; this seed has synthetic examples only |
| `UNTYPED_REFERENCE` | Referencing standard → referenced standard | Preserve BIS's generic reference without claiming it is normative |

The SQL import uses `superseded_by` in the opposite direction to the graph's `SUPERSEDES` edge; conversion is explicit. Incoming-reference tables are converted to their true reference direction. International references and absent Indian-standard endpoints remain in the unresolved-evidence ledger, not fabricated Standard nodes. Multiple observations can support an edge, so the graph is a `MultiDiGraph`.

## Why NetworkX now

NetworkX offers local, dependency-light traversal and persistence without requiring a Docker service on this machine. The graph is saved at `kb/graph.gpickle` using Python's pickle support. Load only the artifact built by this repository: pickle is executable serialization. Rebuild it from the audited JSON rather than accepting uploaded graph files.

Neo4j remains the planned option for concurrent users, indexed server queries, and a larger catalogue. Pairwise committee edges are acceptable for the 150-edition demo but grow quadratically within a committee; a production graph should use Committee nodes and derive these associations at query time. This phase does not claim 22,000-standard graph performance or install Neo4j.

## Public functions

```python
from kb.build_graph import expand_allied_standards, get_version_status

groups = expand_allied_standards("IS-SEED-1001:2024", max_hops=2)
status = get_version_status("IS-SEED-1001:2020")
```

Those identifiers are **MOCK/SYNTHETIC** fixtures. The first result is a dictionary keyed by relationship type. Lists are ranked and globally deduplicated by edition; if several paths reach an edition, the strongest path determines its group. Each item includes the source, record citation, hop count, resolved edition, and evidence path. Direct normative/test/safety links rank above generic references; committee matches are weak. Scores are deterministic engineering weights, not probabilities or a trained applicability model. The default traversal depth is two; the supported safety bound is four. Supersession resolution is independent of that hop budget.

The second call follows `2020 → 2022 → 2024` and returns the final edition, not the intermediate one. It reports the immediate successor separately. Withdrawn standards with no supported replacement return no final current standard. Cyclic or ambiguous chains reject graph publication; absent successors remain unresolved. A family-only identifier resolves to the newest observed edition, while an explicit edition resolves to that edition first.

For real metadata, `is_latest_observed` may be true while `is_latest_revision` remains null. `latest_confirmed` is false for the limited sample. Amendment counts are edition-specific: `known_unresolved_amendments` counts explicit unresolved entries, `amendments_with_unknown_resolution` includes published amendments whose details were not captured, and `unresolved_amendments` is null if the complete answer is unknown. No legal certification requirement is inferred from a blank or “Voluntary Certification” catalogue field.

Run `npm run phase3-demo` to build/persist the graph and inspect synthetic typed groups. `python -m unittest eval.test_graph -v` runs the five requested tests, covering final supersession resolution, directional groups/deduplication, two-hop evidence, unknown real metadata, amendment resolution, withdrawal, and absent identifiers.
