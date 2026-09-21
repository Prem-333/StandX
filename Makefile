PYTHON ?= python

.PHONY: phase0-demo phase1-demo phase2-demo phase3-demo phase4-demo
phase0-demo:
	$(PYTHON) scripts/phase0_demo.py

phase1-demo:
	$(PYTHON) scripts/phase1_demo.py

phase2-demo:
	node scripts/phase2_demo.mjs

phase3-demo:
	$(PYTHON) scripts/phase3_demo.py

phase4-demo:
	$(PYTHON) scripts/phase4_demo.py
