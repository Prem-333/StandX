"""Exercise real PostgreSQL SQL via psycopg against the explicitly supplied local DSN."""
import copy
import json
import os
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8')
import psycopg
from services.ingestion.records import ROOT,SEED,read_records
from services.ingestion.load import load_records,counts

records=read_records()
with psycopg.connect(os.environ['DATABASE_URL'],autocommit=True) as conn:
    first=load_records(conn,records)
    second=load_records(conn,read_records(SEED.with_suffix('.csv')))
    assert first==second,'Second CSV import changed row counts'
    assert conn.execute('SELECT count(*) FROM kb.revision WHERE superseded').fetchone()[0]==10
    target=next(r for r in records if r['is_number']=='IS-SEED-1001:2024')
    with conn.transaction(force_rollback=True):
        changed=copy.deepcopy(target);changed['fetched_at']='2026-09-22T00:00:00+00:00'
        changed['amendments']=[];changed['amendment_count']=0;changed['cross_references']=[]
        changed['title']+=' UPDATED'
        load_records(conn,[changed])
        assert conn.execute('SELECT count(*) FROM kb.amendment WHERE revision_id=%s',(target['record_id'],)).fetchone()[0]==0
        load_records(conn,[target])
        assert conn.execute('SELECT title FROM kb.revision WHERE id=%s',(target['record_id'],)).fetchone()[0].endswith('UPDATED')
    cycle=copy.deepcopy(target)
    cycle['cross_references'].append({'from':target['is_number'],'to':'IS-SEED-1001:2020',
        'type':'superseded_by','direction':'outgoing','namespace':'synthetic','evidence_label':'MOCK/SYNTHETIC invalid cycle test'})
    try:load_records(conn,[cycle])
    except ValueError:pass
    else:raise AssertionError('Cyclic import should fail')
    assert counts(conn)==first['tables'],'Rejected batch was not fully rolled back'
    result={'backend':'PGlite PostgreSQL engine via psycopg; not Docker PostgreSQL',
            **first,'checks':['JSON/CSV idempotency','child reconciliation','stale import protection','cycle rejection and atomic rollback']}
    (ROOT/'data/processed/phase2_report.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2))
    print('Three examples (synthetic records are never real BIS standards):')
    for number in ['IS 12680:1989','IS 9550:2024','IS-SEED-1001:2024']:
        r=next(r for r in records if r['is_number']==number)
        print(json.dumps({k:r[k] for k in ['record_id','is_number','title','source','revision_count','amendment_count','classification','source_url']},indent=2,ensure_ascii=False))
