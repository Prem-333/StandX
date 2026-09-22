"""Eight local translation + retrieval evaluations; no external connections."""
import json
from pathlib import Path
import socket
import sys
import time
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8')
from services.ingestion.records import ROOT


def evaluate(runtime):
    from services.api.schemas import RecommendRequest
    cases=json.loads((ROOT/'eval/multilingual_queries.json').read_text(encoding='utf-8'))
    output=[]
    for case in cases:
        started=time.perf_counter()
        result=runtime.recommend(RecommendRequest(text=case['query']))
        rank=next((i+1 for i,r in enumerate(result['primary_standards']) if r['is_number']==case['expected']),None)
        item={**case,'expected_rank':rank,'elapsed_seconds':time.perf_counter()-started,'response':result}
        output.append(item)
        print(json.dumps({'id':case['id'],'original':case['query'],
            'english':result['normalization']['normalized_text'],'translation':result['normalization']['status'],
            'top':result['primary_standards'][0]['is_number'] if result['primary_standards'] else None,
            'expected_rank':rank,'decision':result['status']},ensure_ascii=False),flush=True)
        persisted=runtime.connection.execute('SELECT query_text,results FROM kb.recommendations_log WHERE id=%s',
                                             (result['recommendation_id'],)).fetchone()
        assert persisted[0]==case['query'] and persisted[1]['normalization']['original_text']==case['query']
    report={'queries':output,'top1':sum(x['expected_rank']==1 for x in output),'top5':sum(x['expected_rank'] is not None for x in output),
            'translation_completed':sum(x['response']['normalization']['status']=='translated' for x in output),
            'caveat':'Eight author-written smoke cases; no broad multilingual accuracy claim.'}
    (ROOT/'data/processed/multilingual_demo.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    return report


if __name__=='__main__':
    original=socket.socket.connect
    def local_only(sock,address):
        if isinstance(address,tuple) and address[0] not in ('127.0.0.1','localhost','::1'):raise RuntimeError('External network disabled')
        return original(sock,address)
    socket.socket.connect=local_only
    from services.api.runtime import create_runtime
    runtime=create_runtime()
    try:print(json.dumps({k:v for k,v in evaluate(runtime).items() if k!='queries'},indent=2))
    finally:runtime.close()
