PYTHON ?= python

.PHONY: phase0-demo phase1-demo phase2-demo phase3-demo phase4-demo phase5-demo phase6-demo phase7-demo phase8-demo phase9-demo phase10-demo eval\:retrain
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

phase5-demo:
	node scripts/phase5_demo.mjs

phase6-demo:
	$(PYTHON) scripts/phase6_demo.py

phase7-demo:
	node scripts/local_backend_demo.mjs scripts/phase7_demo.py

phase8-demo:
	node scripts/local_backend_demo.mjs scripts/phase8_demo.py

.PHONY: phase9-demo
phase9-demo:
	node scripts/phase9_demo.mjs

phase10-demo:
	$(PYTHON) -X utf8 eval/run_eval.py

eval\:retrain:
	$(PYTHON) -X utf8 scripts/retrain_reranker.py
