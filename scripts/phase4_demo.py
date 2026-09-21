"""Rebuild and measure real local inference while disallowing external sockets."""
import json
from pathlib import Path
import socket
import statistics
import sys
import time
from datetime import datetime,timezone
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8')

original_connect=socket.socket.connect
blocked_attempts=[]
def local_connect(sock,address):
    if isinstance(address,tuple) and address[0] not in ('127.0.0.1','::1','localhost'):
        blocked_attempts.append(str(address))
        raise RuntimeError('External network is disabled during the offline benchmark')
    return original_connect(sock,address)
socket.socket.connect=local_connect

from services.ingestion.records import ROOT,read_records
from kb.local_models import config,verify_cache
from kb.build_index import build_index
from services.nlp.retrieve import Retriever
import psutil

settings=config()
print('Offline model-cache verification:',verify_cache(settings,'embedding'),verify_cache(settings,'reranker'),flush=True)
build=build_index(read_records(),settings)
print('Index build:',json.dumps(build),flush=True)
started=time.perf_counter();engine=Retriever(settings);load_seconds=time.perf_counter()-started
try:
    engine.search('office furniture procurement',include_synthetic=True) # Warm-up excluded from timings.
    cases=json.loads((ROOT/'eval/retrieval_queries.json').read_text(encoding='utf-8'))
    results=[];latencies=[]
    for case in cases:
        runs=[engine.search(case['query'],include_synthetic=True) for _ in range(3)]
        result=runs[-1];times=[r['timings']['total_seconds'] for r in runs]
        numbers=[r['is_number'] for r in result['results']]
        passed=(not numbers) if case['expected'] is None else case['expected'] in numbers
        if case['kind']!='semantic' and not passed:raise AssertionError('Literal resolution failed: '+case['query'])
        if case['kind']=='semantic':latencies.extend(times)
        results.append({**case,'top10_hit':passed,'top_result':numbers[0] if numbers else None,
                        'median_seconds':statistics.median(times),'timings':result.get('timings'),
                        'candidates_reranked':result.get('candidates_reranked',0),
                        'ranking':result['results']})
        print(json.dumps({k:v for k,v in results[-1].items() if k not in ('ranking','timings')},ensure_ascii=False),flush=True)
    assert not blocked_attempts,'Model attempted an external connection'
    memory=psutil.Process().memory_info()
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'python':sys.version,'device':settings['device'],
        'backend':settings['qdrant_mode'],'embedding_model':settings['embedding_model'],
        'embedding_revision':settings['embedding_revision'],'reranker_model':settings['reranker_model'],
        'offline_external_connection_attempts':blocked_attempts,'build':build,'retriever_load_seconds':load_seconds,
        'warm_semantic_queries':len(latencies),'warm_semantic_median_seconds':statistics.median(latencies),
        'warm_semantic_p95_seconds':sorted(latencies)[int(.95*(len(latencies)-1))],
        'process_rss_bytes':memory.rss,'process_peak_working_set_bytes':getattr(memory,'peak_wset',None),
        'synthetic_enabled':True,'evaluation_caveat':'Small author-written smoke set, not an expert-labelled relevance benchmark.',
        'queries':results}
    (ROOT/'data/processed/retrieval_benchmark.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='queries'},indent=2),flush=True)
finally:engine.close()
