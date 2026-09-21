"""Compatibility entry point for the implemented offline vector index."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from kb.build_index import main

if __name__ == "__main__":
    main()
