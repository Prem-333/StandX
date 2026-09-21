"""Offline scaffold demonstration. This does not perform standards matching."""

import json
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    fixture_path = root / "data" / "mock" / "standards.json"
    records = json.loads(fixture_path.read_text(encoding="utf-8"))
    if not records:
        raise ValueError("The Phase 0 synthetic fixture must not be empty.")
    for record in records:
        if record.get("source") != "synthetic" or not record.get(
            "is_number", ""
        ).startswith("IS-MOCK-"):
            raise ValueError("Phase 0 accepts explicitly synthetic records only.")

    print("MOCK/SYNTHETIC DEMO - no verified BIS data; not for procurement decisions.")
    print(json.dumps({
        "phase": 0,
        "mode": "synthetic",
        "status": "scaffold_only",
        "recommendations": [],
        "message": "Recommendation matching is not implemented. Showing cited fixtures only.",
        "confidence": "not_assessed",
        "fixtures": [
            {
                "label": "MOCK/SYNTHETIC - illustrative metadata only",
                "source": "synthetic",
                "record": record,
                "citation": {
                    "record_id": record["record_id"],
                    "is_number": record["is_number"],
                    "source": "synthetic",
                    "kb_path": fixture_path.relative_to(root).as_posix(),
                },
            }
            for record in records
        ],
    }, indent=2))


if __name__ == "__main__":
    main()
