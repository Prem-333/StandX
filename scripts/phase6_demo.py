import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8')
from services.certification.rules import CertificationRules,version_warnings
from services.ingestion.records import ROOT,read_records
from kb.build_graph import StandardsGraph,build_graph

rules=CertificationRules();context={'domestic_supply':True,'exemption_claimed':False}
output={category:rules.evaluate(category,context) for category in ('bright_steel_bars','laptop_notebook_tablet','silver_jewellery_artefacts')}
graph=StandardsGraph(build_graph(read_records()))
output['synthetic_version_warning']=version_warnings(graph.get_version_status('IS-SEED-1001:2020'),'synthetic_seed')
(ROOT/'data/processed/certification_demo.json').write_text(json.dumps(output,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps(output,indent=2,ensure_ascii=False))
