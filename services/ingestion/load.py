"""Atomic, repeatable JSON/CSV public-metadata loader for PostgreSQL."""
import argparse
from datetime import datetime
import json
import os
from pathlib import Path
import psycopg
from psycopg import sql
from psycopg.types.json import Jsonb
from .records import DOMAINS, ROOT, SEED, digest, identifier, read_records
from .validate import validate, versions

TABLES=('standard','revision','amendment','cross_reference','classification','certification_scheme',
        'product_category','source_snapshot','revision_classification','revision_scheme','revision_product_category')


def upsert(conn, table, values, keys=('id',)):
    assert table in TABLES
    columns=list(values)
    updates=[c for c in columns if c not in keys]
    statement=sql.SQL('INSERT INTO kb.{} ({}) VALUES ({}) ON CONFLICT ({}) ').format(
        sql.Identifier(table),sql.SQL(',').join(map(sql.Identifier,columns)),
        sql.SQL(',').join(sql.Placeholder() for _ in columns),sql.SQL(',').join(map(sql.Identifier,keys)))
    statement += (sql.SQL('DO UPDATE SET ')+sql.SQL(',').join(
        sql.SQL('{}=EXCLUDED.{}').format(sql.Identifier(c),sql.Identifier(c)) for c in updates)
        if updates else sql.SQL('DO NOTHING'))
    conn.execute(statement,list(values.values()))


def counts(conn):
    return {t:conn.execute(sql.SQL('SELECT count(*) FROM kb.{}').format(sql.Identifier(t))).fetchone()[0] for t in TABLES}


def load_records(conn, records):
    """Caller owns connection; one transaction includes child reconciliation and pointers."""
    with conn.transaction():
        conn.execute('SELECT pg_advisory_xact_lock(26108)')
        conn.execute((ROOT/'kb/schema.sql').read_text(encoding='utf-8'))
        for key,name in DOMAINS.items():upsert(conn,'product_category',{'id':key,'name':name})
        for r in records:
            family_id=identifier(r['family'])
            upsert(conn,'standard',{'id':family_id,'family_number':r['family'],'source':r['source']})
            snapshot=digest(r)
            upsert(conn,'source_snapshot',{'id':snapshot,'source':r['source'],'source_url':r.get('source_url'),
                'fetched_at':r['fetched_at'],'content_sha256':r.get('snapshot_sha256',snapshot),'metadata':Jsonb(r)})
            old=conn.execute('SELECT fetched_at,payload FROM kb.revision WHERE id=%s',(r['record_id'],)).fetchone()
            if old and old[0]>datetime.fromisoformat(r['fetched_at']):
                continue  # An older snapshot is auditable but cannot roll current metadata back.
            values={'id':r['record_id'],'standard_id':family_id,'is_number':r['is_number'],'title':r['title'],
                    'publication_year':r['publication_year'],'source':r['source'],'snapshot_id':snapshot,
                    'fetched_at':r['fetched_at'],'payload':Jsonb(r),'status':r.get('status','unknown'),
                    'latest_confirmed':r.get('latest_confirmed',False)}
            for k in ['revision_count','amendment_count','degree_of_equivalence','equivalent_standards_raw',
                      'technical_department','technical_committee','language','scope_abstract','certification_flag_raw']:
                values[k]=r.get(k)
            upsert(conn,'revision',values)
            for table,col in [('amendment','revision_id'),('cross_reference','observed_revision_id'),
                              ('revision_classification','revision_id'),('revision_scheme','revision_id'),
                              ('revision_product_category','revision_id')]:
                conn.execute(sql.SQL('DELETE FROM kb.{} WHERE {}=%s').format(sql.Identifier(table),sql.Identifier(col)),(r['record_id'],))
            parent=None
            for level in ('group','sub_group','sub_sub_group','aspect'):
                label=r['classification'].get(level)
                if label in (None,'','N/A','NA'):continue
                if level=='aspect':parent=None
                cid=digest([r['source'],parent,level,label])
                upsert(conn,'classification',{'id':cid,'parent_id':parent,'level':level,'label':label,'source':r['source']})
                upsert(conn,'revision_classification',{'revision_id':r['record_id'],'classification_id':cid,'snapshot_id':snapshot},('revision_id','classification_id'))
                parent=cid
            upsert(conn,'revision_product_category',{'revision_id':r['record_id'],'product_category_id':r['domain']},('revision_id','product_category_id'))
            for amendment in r['amendments']:
                upsert(conn,'amendment',{'id':f"{r['record_id']}:amendment:{amendment['number']}",
                    'revision_id':r['record_id'],'amendment_number':amendment['number'],'issued_on':amendment.get('issued_on'),
                    'resolution':amendment['resolution'],'source':r['source'],'snapshot_id':snapshot})
            for scheme in r['certification_schemes']:
                upsert(conn,'certification_scheme',{k:scheme.get(k) for k in ('id','name','source','evidence_url')})
                upsert(conn,'revision_scheme',{'revision_id':r['record_id'],'scheme_id':scheme['id'],
                    'requirement':scheme['requirement'],'snapshot_id':snapshot},('revision_id','scheme_id'))
            for index,e in enumerate(r['cross_references']):
                upsert(conn,'cross_reference',{'id':digest([r['record_id'],index,e]),'observed_revision_id':r['record_id'],
                    'from_identifier':identifier(e['from']),'to_identifier':identifier(e['to']),
                    'namespace':e['namespace'],'relationship_type':e['type'],'reported_direction':e['direction'],
                    'referenced_title_raw':e.get('title_raw'),'evidence_label':e['evidence_label'],
                    'source':r['source'],'snapshot_id':snapshot})
        all_records=[row[0] for row in conn.execute('SELECT payload FROM kb.revision').fetchall()]
        report=validate(all_records)
        if any(report['counts'].get(k) for k in ('circular_supersession','ambiguous_supersession')):
            raise ValueError('Supersession validation failed; entire import rolled back')
        computed=versions(all_records)
        for r in all_records:
            v=computed[r['record_id']]
            conn.execute('UPDATE kb.standard SET latest_version=%s WHERE id=%s',(v['latest_version'],identifier(r['family'])))
            conn.execute('UPDATE kb.revision SET superseded=%s,status=%s WHERE id=%s',
                (v['superseded'],'superseded' if v['superseded'] else r.get('status','unknown'),r['record_id']))
            # Re-resolve both sides on every batch, including references imported earlier.
            for col in ('from','to'):
                conn.execute(sql.SQL('UPDATE kb.cross_reference SET {}=%s WHERE {}=%s').format(
                    sql.Identifier(col+'_revision_id'),sql.Identifier(col+'_identifier')),
                    (r['record_id'],identifier(r['is_number'])))
        return {'tables':counts(conn),'validation':report['counts']}


def main():
    p=argparse.ArgumentParser();p.add_argument('input',nargs='?',type=Path,default=SEED)
    a=p.parse_args();dsn=os.environ.get('DATABASE_URL')
    if not dsn:raise SystemExit('Set DATABASE_URL to your local PostgreSQL database')
    with psycopg.connect(dsn,autocommit=True) as conn:
        print(json.dumps(load_records(conn,read_records(a.input)),indent=2))


if __name__=='__main__':main()
