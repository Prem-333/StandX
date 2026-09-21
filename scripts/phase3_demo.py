import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8')
from kb.build_graph import build_graph,save_graph,StandardsGraph
from services.ingestion.records import read_records

g=build_graph(read_records());save_graph(g);api=StandardsGraph(g)
print('MOCK/SYNTHETIC graph demonstration — these examples are not BIS standards.')
print(json.dumps(api.get_version_status('IS-SEED-1001:2020'),indent=2))
groups=api.expand_allied_standards('IS-SEED-1001:2024')
print(json.dumps({kind:rows[:2] for kind,rows in groups.items()},indent=2,ensure_ascii=False))
