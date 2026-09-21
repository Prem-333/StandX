"""Decision, evidence, and tender regression tests; no models or network needed."""
import copy
import math
from types import SimpleNamespace
import unittest

from services.ingestion.records import read_records
from services.recommendation.engine import RecommendationEngine, configuration, confidence, LOW_CONFIDENCE
from services.nlp.tender_phrases import extract_phrases


class MemoryAudit:
    """Test double only. Runtime always requires the durable SQL audit writer."""
    def __init__(self): self.rows=[]
    def append(self, response): self.rows.append(copy.deepcopy(response))
    def close(self): pass


class FixtureRetriever:
    def __init__(self, records, results):
        self.records=records;self.results=results
        self.settings={'max_tokens':256,'embedding_revision':'test-fixture','reranker_revision':'test-fixture'}
        self.reranker=SimpleNamespace(tokenizer=None)

    def search(self, query, include_synthetic=False, top_k=10):
        rows=self.results.get(query,self.results.get('*',[]))
        return {'results':[r for r in rows if include_synthetic or r['source']!='synthetic_seed'][:top_k]}

    def close(self): pass


class RecommendationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records=read_records()
        cls.by_number={r['is_number']:r for r in cls.records}

    def candidate(self, number, score, exact=False):
        r=self.by_number[number]
        return {k:r[k] for k in ('record_id','is_number','title','source','display_label','status')} | {
            'citation':r.get('source_url') or r['record_id'],
            'match':'exact_identifier' if exact else 'hybrid_reranked','reranker_score':score}

    def engine(self, results, **settings):
        audit=MemoryAudit()
        engine=RecommendationEngine(FixtureRetriever(self.records,results),audit,{**configuration(),**settings})
        return engine,audit

    def test_low_confidence_is_explicit_and_logged(self):
        engine,audit=self.engine({'*':[self.candidate('IS 6188:1988',-8)]})
        result=engine.recommend('unrelated software')
        self.assertEqual(result['message'],LOW_CONFIDENCE)
        self.assertEqual(result,audit.rows[0])
        self.assertFalse(result['primary_standards'][0]['meets_confidence_threshold'])

    def test_threshold_boundary_and_ambiguous_alternatives(self):
        engine,_=self.engine({'*':[self.candidate('IS 6188:1988',0),self.candidate('IS 12680:1989',0)]},confidence_threshold=.5)
        result=engine.recommend('wooden furniture',top_k=1)
        self.assertEqual(result['status'],'ambiguous') # Top_k=1 cannot hide the runner-up.
        self.assertEqual(result['top_confidence_score'],.5)
        self.assertTrue(result['primary_standards'][0]['meets_confidence_threshold'])

    def test_exact_old_fixture_resolves_final_version_without_claiming_applicability(self):
        engine,_=self.engine({'*':[self.candidate('IS-SEED-1001:2020',0,True)]},include_synthetic=True)
        r=engine.recommend('IS-SEED-1001:2020')['primary_standards'][0]
        self.assertEqual(r['confidence_score'],1)
        self.assertFalse(r['applicability_confirmed'])
        self.assertEqual(r['version_status']['final_current_standard'],'IS-SEED-1001:2024')
        self.assertIn('TEST_METHOD_FOR',r['allied_standards'])
        self.assertIn('MOCK/SYNTHETIC',r['rationale'])

    def test_real_metadata_evidence_preserves_unknowns(self):
        engine,_=self.engine({'*':[self.candidate('IS 9550:2024',8)]})
        r=engine.recommend('bright steel bars')['primary_standards'][0]
        self.assertIsNone(r['certification']['required'])
        self.assertIsNone(r['version_status']['is_latest_revision'])
        self.assertIsNone(r['version_status']['unresolved_amendments'])
        self.assertIn(self.by_number['IS 9550:2024']['title'],r['rationale'])
        for item in r['metadata_evidence']:
            self.assertEqual(item['citation']['record_id'],r['record_id'])
            self.assertEqual(item['citation']['is_number'],r['is_number'])

    def test_empty_candidates_and_audit_failure_do_not_return_success(self):
        engine,audit=self.engine({})
        self.assertEqual(engine.recommend('IS 999999:2099')['message'],LOW_CONFIDENCE)
        def fail(_): raise RuntimeError('database unavailable')
        audit.append=fail
        with self.assertRaisesRegex(RuntimeError,'database unavailable'):
            engine.recommend('anything')

    def test_tender_deduplicates_retains_unmatched_and_negated_requirements(self):
        candidate=self.candidate('IS 6188:1988',8)
        engine,audit=self.engine({'wooden bedside tables':[candidate],'wooden bedside table':[candidate]})
        text='Supply wooden bedside tables.\nProcure wooden bedside table.\nCloud payroll software.\nDo not buy steam irons.'
        result=engine.recommend_tender(text)
        self.assertEqual(len(result['primary_standards']),1)
        self.assertEqual(len(result['primary_standards'][0]['matched_phrases']),1)
        phrase=next(p for p in result['extraction']['phrases'] if p['text']=='wooden bedside tables')
        self.assertEqual(len(phrase['occurrences']),2)
        for occurrence in phrase['occurrences']:
            self.assertTrue(text[occurrence['start']:occurrence['end']].startswith('wooden bedside table'))
        self.assertEqual(result['status'],'partial_review_required')
        self.assertTrue(result['extraction']['manual_review_clauses'])
        self.assertTrue(any(r['status']=='review_required' for r in result['phrase_results']))
        self.assertEqual(len(audit.rows),len(result['phrase_results'])+1)
        self.assertEqual(len({r['request_group_id'] for r in audit.rows}),1)

    def test_extraction_overflow_is_visible(self):
        text='Unknown software.\nAnother requirement.\nThird requirement.'
        result=extract_phrases(text,self.records,max_phrases=1)
        self.assertEqual(len(result['phrases']),1)
        self.assertEqual(len(result['omitted_phrases']),2)

    def test_invalid_scores_and_configuration_fail_closed(self):
        self.assertEqual(confidence(1000,'logit'),1)
        self.assertEqual(confidence(-1000,'logit'),0)
        for value,space in [(float('nan'),'logit'),(2,'probability'),(0,'unknown')]:
            with self.assertRaises(ValueError): confidence(value,space)
        with self.assertRaises(ValueError): self.engine({},confidence_threshold=1.1)
        engine,_=self.engine({})
        with self.assertRaises(ValueError): engine.recommend('query',top_k=0)
        with self.assertRaises(ValueError): engine.recommend_tender('query',top_k=11)


if __name__=='__main__':unittest.main()
