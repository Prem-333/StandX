"""Phase 5: deterministic evidence assembly over local retrieval and graph methods."""
import json
import math
import os
from pathlib import Path
import time
from datetime import datetime, timezone
from uuid import uuid4

from kb.build_graph import StandardsGraph, build_graph
from services.ingestion.records import digest
from services.nlp.tender_phrases import extract_phrases
from services.certification.rules import CertificationRules, version_warnings

LOW_CONFIDENCE = 'no confident match — showing closest candidates for human review'


class InvalidQuery(ValueError):
    """Input needs splitting or correction, not a model/database failure."""


def configuration():
    path = Path(os.environ.get('RECOMMENDATION_CONFIG', Path(__file__).with_name('config.json')))
    return json.loads(path.read_text(encoding='utf-8'))


def confidence(value, space):
    value = float(value)
    if not math.isfinite(value):
        raise ValueError('Non-finite relevance score')
    if space == 'probability':
        if not 0 <= value <= 1:
            raise ValueError('Configured probability score outside [0,1]')
        return value
    if space != 'logit':
        raise ValueError('reranker_score_space must be logit or probability')
    if value >= 0:
        return 1 / (1 + math.exp(-value))
    exp = math.exp(value)
    return exp / (1 + exp)


class RecommendationEngine:
    def __init__(self, retriever, audit, settings=None, certification_rules=None):
        self.retriever = retriever; self.audit = audit
        self.settings = settings or configuration()
        for key in ('confidence_threshold', 'ambiguity_margin'):
            if not 0 <= self.settings[key] <= 1:
                raise ValueError(f'{key} must be in [0,1]')
        if self.settings['reranker_score_space'] not in ('logit', 'probability'):
            raise ValueError('Invalid reranker_score_space')
        self.records = {r['record_id']:r for r in retriever.records}
        # Construct from the actual index snapshot, so graph/retrieval cannot drift.
        self.graph = StandardsGraph(build_graph(retriever.records))
        self.fingerprint = digest(retriever.records)
        self.certification_rules = certification_rules or CertificationRules()
        self.model_configuration = {k:v for k,v in retriever.settings.items()
                                    if k not in ('qdrant_path', 'embedding_path', 'reranker_path')}

    def close(self):
        try:
            self.retriever.close()
        finally:
            self.audit.close()

    def _base(self, text, kind, group_id=None):
        request_id = str(uuid4())
        return {'schema_version':1, 'recommendation_id':request_id,
                'request_group_id':group_id or request_id, 'kind':kind, 'query_text':text,
                'timestamp':datetime.now(timezone.utc).isoformat(),
                'kb_fingerprint':self.fingerprint, 'model_configuration':self.model_configuration,
                'recommendation_configuration':dict(self.settings),
                'confidence_notice':'Uncalibrated metadata relevance score, not a probability of correctness or a certification decision.',
                'synthetic_enabled':self.settings['include_synthetic'],
                'human_review_required':True}

    def _enrich(self, candidate, rule_snapshot=None, certification_context=None):
        record = self.records[candidate['record_id']]
        exact = candidate['match'] == 'exact_identifier'
        score = 1.0 if exact else confidence(candidate['reranker_score'], self.settings['reranker_score_space'])
        evidence = {k:record.get(k) for k in ('record_id','is_number','source','source_url',
                                             'fetched_at','snapshot_sha256','display_label')}
        fields = [{'field':'title', 'value':record['title'], 'citation':evidence}]
        classification = record['classification']
        fields.extend({'field':f'classification.{k}', 'value':v, 'citation':evidence}
                      for k,v in classification.items() if v)
        if record.get('scope_abstract'):
            fields.append({'field':'scope_abstract', 'value':record['scope_abstract'], 'citation':evidence})
        prefix = 'Identifier matches this KB record.' if exact else 'Selected by local hybrid retrieval and metadata reranking.'
        rationale = f'{prefix} The recorded title is "{record["title"]}".'
        if classification.get('group'):
            rationale += f' The recorded group is "{classification["group"]}".'
        if record['source'] == 'synthetic_seed':
            rationale = 'MOCK/SYNTHETIC fixture. ' + rationale
        allied = self.graph.expand_allied_standards(record['is_number'], self.settings['allied_max_hops'])
        if not self.settings['include_synthetic']:
            allied = {kind:[r for r in rows if r['source'] != 'synthetic_seed'] for kind,rows in allied.items()}
            allied = {kind:rows for kind,rows in allied.items() if rows}
        for rows in allied.values():
            for item in rows:
                related=self.records[item['record_id']]
                item['evidence']=[{k:related.get(k) for k in ('record_id','is_number','source','source_url','fetched_at','snapshot_sha256','display_label')}]
        version=self.graph.get_version_status(record['is_number'])
        return {**candidate, 'confidence_score':score, 'score':score, 'status':version['status'],
                'confidence_basis':'identifier_identity_only' if exact else 'sigmoid_reranker_logit' if self.settings['reranker_score_space']=='logit' else 'reranker_output',
                'meets_confidence_threshold':score >= self.settings['confidence_threshold'],
                'applicability_confirmed':False, 'rationale':rationale,
                'metadata_evidence':fields, 'evidence':[evidence], 'allied_standards':allied,
                'version_status':version, 'warnings':version_warnings(version,record['source']),
                'certification_requirements':self.certification_rules.for_record(record,certification_context,snapshot=rule_snapshot),
                'certification':{'required':record.get('certification_required'),
                    'published_flag':record.get('certification_flag_raw'),
                    'schemes':record.get('certification_schemes', []),
                    'determination':'synthetic_fixture' if record['source']=='synthetic_seed' else 'not_legally_determined',
                    'citation':evidence}}

    def recommend(self, query_text: str, top_k=5, *, group_id=None, kind='query', normalization=None,
                  product_category=None, certification_context=None):
        if not isinstance(query_text, str) or not query_text.strip():
            raise InvalidQuery('query_text must be nonempty text')
        if len(query_text) > self.settings['max_query_characters']:
            raise InvalidQuery('Query too long; use recommend_tender for document text')
        if not isinstance(top_k, int) or isinstance(top_k, bool) or not 1 <= top_k <= 10:
            raise ValueError('top_k must be 1..10')
        if kind not in ('query', 'tender_phrase'):
            raise ValueError('Invalid query audit kind')
        # No silent cross-encoder truncation of a long single query.
        search_text=normalization['normalized_text'] if normalization else query_text
        tokenizer = getattr(self.retriever.reranker, 'tokenizer', None)
        if tokenizer is not None:
            tokens = len(tokenizer.encode(search_text, add_special_tokens=False))
            if tokens > self.retriever.settings['max_tokens'] // 2:
                raise InvalidQuery('Query exceeds safe reranker budget; split with recommend_tender')
        started = time.perf_counter()
        retrieval = self.retriever.search(search_text, include_synthetic=self.settings['include_synthetic'], top_k=10) if search_text.strip() else {'results':[],'reason':'no_english_terms_after_translation_fallback'}
        rule_snapshot=self.certification_rules.snapshot()
        candidates = [self._enrich(c,rule_snapshot,certification_context) for c in retrieval['results']]
        # Family literal queries preserve newest-first ordering on equal identity scores.
        candidates.sort(key=lambda c:-c['confidence_score'])
        top = candidates[0]['confidence_score'] if candidates else 0.0
        low = not candidates or top < self.settings['confidence_threshold']
        ambiguous = (len(candidates)>1 and candidates[0]['match']!='exact_identifier'
                     and candidates[1]['meets_confidence_threshold']
                     and top-candidates[1]['confidence_score'] < self.settings['ambiguity_margin'])
        status = 'review_required' if low else 'ambiguous' if ambiguous else 'identifier_match' if candidates[0]['match']=='exact_identifier' else 'candidate_match'
        message = LOW_CONFIDENCE if low else 'multiple plausible standards — human review required' if ambiguous else 'identifier found; product applicability requires review' if status=='identifier_match' else 'metadata match found; product applicability requires review'
        response = {**self._base(query_text, kind, group_id), 'status':status, 'message':message,
                    'top_confidence_score':top, 'primary_standards':candidates[:top_k],
                    'retrieval_reason':retrieval.get('reason'),
                    'retrieval_timings':retrieval.get('timings', {}),
                    'candidates_reranked':retrieval.get('candidates_reranked', 0),
                    'processing_seconds':time.perf_counter()-started}
        self._attach_policy(response,product_category,certification_context,rule_snapshot)
        if normalization:response['normalization']=normalization
        self.audit.append(response)
        return response

    def recommend_tender(self, query_text: str, top_k=5, *, normalization=None, product_category=None, certification_context=None):
        if not isinstance(top_k, int) or isinstance(top_k, bool) or not 1 <= top_k <= 10:
            raise ValueError('top_k must be 1..10')
        if not isinstance(query_text,str) or not query_text.strip():
            raise ValueError('Tender must contain text')
        if len(query_text)>self.settings['max_tender_characters']:
            raise ValueError('Tender exceeds configured character limit')
        response = self._base(query_text, 'tender')
        records = [r for r in self.records.values() if self.settings['include_synthetic'] or r['source']!='synthetic_seed']
        normalized_text=normalization['normalized_text'] if normalization else query_text
        extracted = extract_phrases(normalized_text, records, self.settings['max_tender_phrases'])
        extracted['offset_basis']='normalization.normalized_text' if normalization else 'query_text'
        phrase_results = []; merged = {}
        for phrase in extracted['phrases']:
            try:
                result = self.recommend(phrase['text'], top_k, group_id=response['request_group_id'], kind='tender_phrase',
                                        certification_context=certification_context)
            except InvalidQuery as exc:
                # Validation failures remain visible; database/model failures must propagate.
                extracted['manual_review_clauses'].append({**phrase, 'reason':str(exc)})
                continue
            phrase_results.append({'phrase':phrase, 'recommendation_id':result['recommendation_id'],
                'status':result['status'], 'message':result['message'],
                'primary_record_ids':[r['record_id'] for r in result['primary_standards']]})
            for candidate in result['primary_standards']:
                key = candidate['record_id']
                match = {'phrase':phrase['text'], 'recommendation_id':result['recommendation_id'],
                         'confidence_score':candidate['confidence_score'], 'phrase_status':result['status']}
                previous = merged.get(key)
                matches = previous['matched_phrases'] if previous else []
                if previous is None or candidate['confidence_score']>previous['confidence_score']:
                    merged[key] = {**candidate, 'matched_phrases':matches}
                matches.append(match)
        primaries = sorted(merged.values(), key=lambda c:(-c['confidence_score'],c['is_number']))
        review = (not phrase_results or any(r['status'] in ('review_required','ambiguous') for r in phrase_results)
                  or bool(extracted['manual_review_clauses']) or bool(extracted['omitted_phrases']))
        all_low = not primaries or primaries[0]['confidence_score']<self.settings['confidence_threshold']
        response.update(status='review_required' if all_low else 'partial_review_required' if review else 'candidate_matches',
            message=LOW_CONFIDENCE if all_low else 'tender candidates assembled; review each phrase and original clause',
            primary_standards=primaries, top_confidence_score=primaries[0]['confidence_score'] if primaries else 0.0,
            extraction=extracted, phrase_results=phrase_results,
            aggregation='Deduplicated by KB edition record; maximum per-phrase relevance, never summed confidence.')
        self._attach_policy(response,product_category,certification_context,self.certification_rules.snapshot())
        if normalization:response['normalization']=normalization
        self.audit.append(response)
        return response

    def _attach_policy(self,response,product_category,context,snapshot):
        requirements=[r for c in response['primary_standards'] for r in c['certification_requirements']]
        if product_category:
            category=self.certification_rules.evaluate(product_category,context,snapshot=snapshot)
            response['category_assessment']=category
            requirements.extend(category['certification_requirements'])
        response['certification_requirements']=list({(r['id'],str(r['trigger'])):r for r in requirements}.values())
        response['warnings']=[w for c in response['primary_standards'] for w in c['warnings']]
        response['certification_rules_fingerprint']=snapshot[1]
        grouped={}
        for primary in response['primary_standards']:
            for relation,items in primary['allied_standards'].items():
                target=grouped.setdefault(relation,{})
                for item in items:
                    if item['record_id'] not in target:target[item['record_id']]={**item,'primary_record_ids':[]}
                    target[item['record_id']]['primary_record_ids'].append(primary['record_id'])
        response['allied_standards']={k:list(v.values()) for k,v in grouped.items()}


_engine = None


def _default_engine():
    global _engine
    if _engine is None:
        from services.nlp.retrieve import Retriever
        from .audit import PostgresAudit
        audit = PostgresAudit()
        try:
            retriever = Retriever()
            try:
                _engine = RecommendationEngine(retriever, audit)
            except Exception:
                retriever.close()
                raise
        except Exception:
            audit.close()
            raise
    return _engine


def recommend(query_text: str, top_k=5):
    return _default_engine().recommend(query_text, top_k)


def recommend_tender(query_text: str, top_k=5):
    return _default_engine().recommend_tender(query_text, top_k)


def close_engine():
    global _engine
    if _engine is not None:
        _engine.close(); _engine = None
