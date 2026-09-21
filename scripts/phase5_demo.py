"""Eight actual local-model queries, tender merge, graph fixture, and durable SQL audit."""
import json
from pathlib import Path
import socket
import statistics
import sys
import time
from datetime import datetime, timezone
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8')

original_connect=socket.socket.connect
original_connect_ex=socket.socket.connect_ex
external_attempts=[]

def guard(address):
    if isinstance(address,tuple) and address[0] not in ('localhost','127.0.0.1','::1'):
        external_attempts.append(str(address))
        raise RuntimeError('External sockets disabled in Phase 5 offline demo')

def local_connect(sock,address):
    guard(address);return original_connect(sock,address)

def local_connect_ex(sock,address):
    guard(address);return original_connect_ex(sock,address)

socket.socket.connect=local_connect
socket.socket.connect_ex=local_connect_ex

from services.ingestion.records import ROOT
from kb.local_models import config,verify_cache
from services.nlp.retrieve import Retriever
from services.recommendation.audit import PostgresAudit
from services.recommendation.engine import RecommendationEngine,configuration,LOW_CONFIDENCE

settings=config()
print('Verified cached local models:',{role:str(verify_cache(settings,role)) for role in ('embedding','reranker')},flush=True)
audit=PostgresAudit()
before=audit.connection.execute('SELECT count(*) FROM kb.recommendations_log').fetchone()[0]
started=time.perf_counter()
engine=RecommendationEngine(Retriever(settings),audit)
load_seconds=time.perf_counter()-started
try:
    # Warm-up is audited too; every recommendation call produces a durable row.
    engine.recommend('wooden bedside table')
    cases=json.loads((ROOT/'eval/recommendation_queries.json').read_text(encoding='utf-8'))
    outputs=[];latencies=[]
    for case in cases:
        started=time.perf_counter();result=engine.recommend(case['query']);elapsed=time.perf_counter()-started
        latencies.append(elapsed)
        rows=result['primary_standards'];top=rows[0] if rows else None
        outputs.append({**case,'wall_seconds_including_audit':elapsed,'response':result,
                        'expected_record_rank':next((i+1 for i,r in enumerate(rows) if r['record_id']==case['expected_record']),None)})
        print(json.dumps({'id':case['id'],'query':case['query'],'status':result['status'],
            'top_is_number':top['is_number'] if top else None,'score':top['confidence_score'] if top else 0,
            'message':result['message'],'seconds':elapsed},ensure_ascii=False),flush=True)
        for candidate in rows:
            assert candidate['record_id'] in engine.records and candidate['citation']
            assert candidate['source']=='bis_public_metadata_verified'
        if case['kind']=='literal':
            assert top and top['is_number']==case['query'] and result['status']=='identifier_match'
        if case['kind']=='out_of_scope':
            assert result['message']==LOW_CONFIDENCE,'Out-of-scope query was not safely withheld'
    tender_text=('Supply wooden bedside tables for the accommodation rooms.\n'
                 'Procure hot rolled steel narrow width strip for welded tubes; supply wooden bedside tables.\n'
                 'Provide cloud payroll software subscription.\n'
                 'Do not purchase steam irons.')
    tender=engine.recommend_tender(tender_text,top_k=3)
    assert len({r['record_id'] for r in tender['primary_standards']})==len(tender['primary_standards'])
    assert tender['extraction']['manual_review_clauses'],'Excluded product must remain visible for review'
    assert any(r['status']=='review_required' for r in tender['phrase_results']),'Unmatched tender requirement lost'
    # Separate explicitly synthetic graph demonstration; never enable fixtures in the eight real queries.
    engine.settings={**configuration(),'include_synthetic':True}
    graph_fixture=engine.recommend('IS-SEED-1001:2020',top_k=1)
    assert graph_fixture['primary_standards'][0]['source']=='synthetic_seed'
    assert graph_fixture['primary_standards'][0]['version_status']['final_current_standard']=='IS-SEED-1001:2024'
    assert graph_fixture['primary_standards'][0]['allied_standards']
    after=audit.connection.execute('SELECT count(*) FROM kb.recommendations_log').fetchone()[0]
    expected=1+len(cases)+len(tender['phrase_results'])+1+1
    assert after-before==expected,(after,before,expected)
    # Read back every main response and compare the complete evidence envelope.
    for result in [o['response'] for o in outputs]+[tender,graph_fixture]:
        persisted=audit.connection.execute('SELECT results FROM kb.recommendations_log WHERE id=%s',
                                          (result['recommendation_id'],)).fetchone()[0]
        assert persisted==result
    assert not external_attempts
    report={'checked_at':datetime.now(timezone.utc).isoformat(),
        'model_startup_seconds':load_seconds,'median_query_seconds_including_audit':statistics.median(latencies),
        'max_query_seconds_including_audit':max(latencies),'external_connection_attempts':external_attempts,
        'audit_rows_before':before,'audit_rows_after':after,'audit_rows_added':after-before,
        'audit_backend':'persistent local PGlite PostgreSQL via psycopg; not a production server',
        'queries':outputs,'tender':tender,'synthetic_graph_fixture':graph_fixture,
        'quality_note':'Eight author-written smoke queries, not expert-labelled calibration or production accuracy evidence.'}
    output=ROOT/'data/processed/recommendation_demo.json'
    output.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    lines=['# Phase 5: eight live offline-model outputs','',f'Run: {report["checked_at"]}. All eight searches exclude synthetic data.',
        '', 'Scores are uncalibrated metadata relevance. Exact identifiers score 1 for identity only. Every result requires applicability review.',
        '', '| Query | Status | First candidate | Score | Wall time with audit |','| --- | --- | --- | --- | --- |']
    for case in outputs:
        result=case['response'];top=next(iter(result['primary_standards']),None)
        lines.append(f'| {case["id"]}: {case["query"]} | {result["status"]} | {top["is_number"] if top else "None"} | {result["top_confidence_score"]:.4f} | {case["wall_seconds_including_audit"]:.3f} s |')
    for case in outputs:
        result=case['response']
        lines.extend(['',f'## {case["id"]}: {case["query"]}','',result['message'],'',
                      '| Rank | Cited KB record | Score | Rationale |','| --- | --- | --- | --- |'])
        for i,r in enumerate(result['primary_standards'],1):
            lines.append(f'| {i} | [{r["is_number"]}]({r["citation"]}) ({r["record_id"]}) | {r["confidence_score"]:.4f} | {r["rationale"].replace("|","/")} |')
        lines.extend(['','The JSON report includes all grouped allied evidence, version/amendment status, provenance, timings, and audit IDs.'])
    lines.extend(['','## Tender and audit demonstration','',
        f'{len(tender["phrase_results"])} phrase queries; {len(tender["primary_standards"])} unique edition candidates; status `{tender["status"]}`.',
        f'{after-before} new audit rows were committed and read back, including warm-up, phrase queries, tender aggregate, and the separately labeled synthetic graph fixture.',
        '',f'Median query including durable audit: {report["median_query_seconds_including_audit"]:.3f} s. External socket attempts: 0.',
        '', 'Full machine-readable output: [recommendation_demo.json](../data/processed/recommendation_demo.json).'])
    (ROOT/'docs/recommendation_demo.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('queries','tender','synthetic_graph_fixture')},indent=2),flush=True)
finally:
    engine.close()
