"""Print the offline architecture review and future judged-demo script."""

from pathlib import Path
import sys


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    root = Path(__file__).resolve().parents[1]
    architecture = root / "docs" / "architecture.md"
    document = architecture.read_text(encoding="utf-8")
    print("PHASE 1 - ARCHITECTURE REVIEW ONLY")
    print("The recommendation engine and judged product demo are not implemented yet.")
    print(f"Architecture: {architecture}")
    print(f"Source audit: {root / 'docs' / 'SOURCES.md'}")
    print(f"Mermaid diagrams: {document.count('```mermaid')}")
    print("\nDesign outline:")
    for line in document.splitlines():
        if line.startswith("## "):
            print(line.removeprefix("## "))
    heading = "## 6. Three-minute judged demo script"
    script = document.split(heading, 1)[1].split("\n## 7.", 1)[0]
    print(f"\n{heading}\n{script.strip()}")


if __name__ == "__main__":
    main()
