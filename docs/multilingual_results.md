# Multilingual smoke results — 21 September 2026

Actual cached IndicTrans2 RoPE translation, local Granite retrieval, cross-encoder reranking, and persistent PostgreSQL-compatible audit. All eight translated queries retained their original text in the audit database.

| ID | Original query | English normalization | First result | Expected rank | Decision | Warm query seconds |
| --- | --- | --- | --- | --- | --- | --- |
| HI1 | लकड़ी की बेडसाइड मेज | Wooden bedside table | IS 6188:1988 | 1 | candidate_match | 0.645 |
| HI2 | आँखों की सुरक्षा के लिए चश्मे | Glasses for protection of the eyes | IS 18518:2023 | 2 | review_required | 0.729 |
| HI3 | मूंगफली की पैकिंग के लिए जूट के बोरे | Jute sacks for packing groundnut | IS 18163:2023 | 1 | candidate_match | 0.837 |
| HI4 | भाप वाली बिजली की इस्त्री | steam electric ironing | IS 6290:1986 | 1 | candidate_match | 0.515 |
| HI5 | चमकीली स्टील की छड़ें | Bright steel rods | IS 9550:2024 | 1 | candidate_match | 0.608 |
| HL1 | wooden bedside table chahiye | Wooden bedside table is required. | IS 6188:1988 | 1 | review_required | 0.763 |
| HL2 | aankhon ki suraksha ke liye chashme | Glasses for protection of the eyes | IS 18518:2023 | 2 | review_required | 0.705 |
| HL3 | moongfali ke liye jute bags chahiye | jute bags needed for peanuts | IS 18163:2023 | 1 | review_required | 0.762 |

Expected result first: **6/8**. Expected result within five: **8/8**. HI2 and HL2 incorrectly rank security glass above eye protectors (expected IS 5983:1980, rank 2); both responses require human review. Other low-confidence responses remain review-required even when the expected record ranks first.

These are eight author-written smoke cases, not proof of broad language coverage or calibrated retrieval quality. The complete per-record citations, scores, model revisions and audit identifiers are in [the JSON report](../data/processed/multilingual_demo.json).
