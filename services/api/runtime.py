"""Single-process runtime: serialize model and database use across HTTP requests."""
import os
from pathlib import Path
from threading import RLock
from uuid import uuid4
from psycopg.types.json import Jsonb

from services.certification.rules import version_warnings
from services.ingestion.records import identifier
from services.nlp.multilingual import QueryNormalizer
from services.recommendation.audit import audit_actor


def evidence(record):
    return {k:record.get(k) for k in ('record_id','is_number','source','source_url','fetched_at','snapshot_sha256','display_label')}


def allied_evidence(groups,records):
    for rows in groups.values():
        for item in rows:
            item['evidence']=[evidence(records[item['record_id']])]
    return groups


class Runtime:
    def __init__(self,engine,normalizer=None):
        self.engine=engine;self.normalizer=normalizer or QueryNormalizer();self.lock=RLock()
        self.connection=engine.audit.connection
        self.connection.execute(Path(__file__).with_name('feedback.sql').read_text(encoding='utf-8'))

    def recommend(self,request,actor=None):
        with self.lock:
            if not request.tender and len(request.text)>self.engine.settings['max_query_characters']:
                raise ValueError('Query too long; set tender=true for document text')
            normalization=self.normalizer.normalize(request.text,request.language_hint)
            method=self.engine.recommend_tender if request.tender else self.engine.recommend
            token=audit_actor.set(actor)
            try:
                return method(request.text,request.top_k,normalization=normalization,
                              product_category=request.product_category,
                              certification_context=request.certification_context.model_dump(exclude_none=True))
            finally:
                audit_actor.reset(token)

    def directory(self,query='',limit=20,offset=0):
        rows=[r for r in self.engine.records.values()
              if (self.engine.settings['include_synthetic'] or r['source']!='synthetic_seed')
              and query.casefold() in (r['is_number']+' '+r['title']).casefold()]
        rows.sort(key=lambda r:(r['source']=='synthetic_seed',r['is_number']))
        return {'total':len(rows),'limit':limit,'offset':offset,
                'items':[self.standard(r['is_number']) for r in rows[offset:offset+limit]]}

    def history(self,actor,limit=20,offset=0):
        with self.lock:
            total=self.connection.execute("SELECT count(*) FROM kb.recommendations_log WHERE actor_id=%s AND kind!='tender_phrase'",(actor,)).fetchone()[0]
            rows=self.connection.execute('''SELECT id,created_at,LEFT(query_text,240),status,
                jsonb_array_length(results->'primary_standards') FROM kb.recommendations_log
                WHERE actor_id=%s AND kind!='tender_phrase' ORDER BY created_at DESC,id DESC LIMIT %s OFFSET %s''',
                (actor,limit,offset)).fetchall()
            return {'total':total,'limit':limit,'offset':offset,'items':[
                dict(zip(('recommendation_id','timestamp','query_text','status','candidate_count'),r)) for r in rows]}

    def saved_report(self,actor,report_id):
        with self.lock:
            row=self.connection.execute("SELECT results FROM kb.recommendations_log WHERE id=%s AND actor_id=%s AND kind!='tender_phrase'",(report_id,actor)).fetchone()
            if row is None:raise KeyError(report_id)
            return row[0]

    def system(self):
        allowed=[r for r in self.engine.records.values() if self.engine.settings['include_synthetic'] or r['source']!='synthetic_seed']
        return {'kb_fingerprint':self.engine.fingerprint,'visible_records':len(allowed),
                'verified_records':sum(r['source']=='bis_public_metadata_verified' for r in allowed),
                'synthetic_records':sum(r['source']=='synthetic_seed' for r in allowed),
                'include_synthetic':self.engine.settings['include_synthetic'],
                'confidence_threshold':self.engine.settings['confidence_threshold'],
                'graph_backend':os.environ.get('GRAPH_BACKEND','networkx'),
                'models':{k:v for k,v in self.engine.model_configuration.items() if k.endswith(('_model','_revision'))},
                'ranking_adjustments':'disabled; feedback proposals require separate evaluation',
                'notice':'Metadata sample only. No claim of complete coverage, current legal applicability, or BIS endorsement.'}

    def standard(self,number):
        key=self.engine.graph._key(number)
        record=self.engine.graph.graph.nodes[key]
        if record['source']=='synthetic_seed' and not self.engine.settings['include_synthetic']:raise KeyError(number)
        version=self.engine.graph.get_version_status(number)
        return {'record':record,'version_status':version,'evidence':[evidence(record)],
                'warnings':version_warnings(version,record['source']),
                'certification_requirements':self.engine.certification_rules.for_record(record)}

    def allied(self,number,hops):
        item=self.standard(number)
        groups=self.engine.graph.expand_allied_standards(number,hops)
        if not self.engine.settings['include_synthetic']:
            groups={kind:[r for r in rows if r['source']!='synthetic_seed'] for kind,rows in groups.items()}
        return {'is_number':item['record']['is_number'],'allied_standards':allied_evidence(groups,self.engine.records),
                'evidence':item['evidence']}

    def feedback(self,request,actor):
        with self.lock:
            row=self.connection.execute('SELECT results FROM kb.recommendations_log WHERE id=%s AND actor_id=%s',
                                        (request.recommendation_id,actor)).fetchone()
            if row is None:raise KeyError('Recommendation not found')
            record=self.engine.records.get(request.record_id) if request.record_id else None
            if request.decision in ('confirm','correct') and record is None:raise ValueError('A known KB record_id is required')
            if request.record_id and record is None:raise ValueError('Unknown KB record_id')
            if record and record['source']=='synthetic_seed' and not self.engine.settings['include_synthetic']:
                raise ValueError('Synthetic feedback is disabled')
            if request.decision in ('confirm','reject') and request.record_id and request.record_id not in {r['record_id'] for r in row[0]['primary_standards']}:
                raise ValueError('Candidate feedback must reference a returned candidate; use correct for an alternative')
            fid=uuid4()
            with self.connection.transaction():
                self.connection.execute('''INSERT INTO kb.user_feedback
                    (id,recommendation_id,actor_id,decision,record_id,comment,evidence) VALUES (%s,%s,%s,%s,%s,%s,%s)''',
                    (fid,request.recommendation_id,actor,request.decision,request.record_id,request.comment,
                     Jsonb({'record':evidence(record) if record else None,'kb_fingerprint':row[0]['kb_fingerprint']})))
            return {'feedback_id':fid,'recommendation_id':request.recommendation_id,'stored':True}

    def health(self):
        with self.lock:
            states={}
            try:self.connection.execute('SELECT 1');states['postgres']='ok'
            except Exception:states['postgres']='unavailable'
            try:
                ok=self.engine.retriever.client.collection_exists(self.engine.retriever.manifest['collection'])
                states['qdrant']='ok' if ok else 'index_missing'
            except Exception:states['qdrant']='unavailable'
            states['graph']='ok'
            if os.environ.get('GRAPH_BACKEND')=='neo4j':
                try:
                    from kb.neo4j_projection import graph_driver
                    with graph_driver() as driver:driver.verify_connectivity()
                except Exception:states['graph']='unavailable'
            return {'status':'ok' if all(s=='ok' for s in states.values()) else 'degraded','services':states,
                    'translation':{'loaded':self.normalizer.translator is not None,
                                   'status':'available' if self.normalizer.translator else 'lazy_or_english_only',
                                   'notice':'Requests fall back to English-only matching when translation cannot load.'}}

    def close(self):self.engine.close()


def create_runtime():
    from services.recommendation.engine import RecommendationEngine
    from services.recommendation.audit import PostgresAudit
    from services.nlp.retrieve import Retriever
    audit=PostgresAudit();retriever=None
    try:
        retriever=Retriever();engine=RecommendationEngine(retriever,audit)
        if os.environ.get('GRAPH_BACKEND')=='neo4j':
            from kb.neo4j_projection import load_projection
            from kb.build_graph import StandardsGraph
            engine.graph=StandardsGraph(load_projection(engine.fingerprint))
        return Runtime(engine)
    except Exception:
        if retriever:retriever.close()
        audit.close();raise
