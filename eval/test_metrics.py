import unittest
from eval.metrics import evaluate,recall_at_k

class MetricsTests(unittest.TestCase):
    def test_recall_counts_all_expected_and_deduplicates(self):
        self.assertEqual(recall_at_k(['IS-SEED-1','IS-SEED-2'],['IS-SEED-1','IS-SEED-1']),.5)
    def test_out_of_scope_does_not_inflate_recall(self):
        gold=[{'id':'a','query':'a','expected_is_numbers':['IS-SEED-1']},{'id':'b','query':'b','expected_is_numbers':[],'allow_empty':True}]
        r=evaluate(gold,[{'primary_standards':[]},{'primary_standards':[],'status':'review_required'}],{'IS-SEED-1'})
        self.assertEqual(r['aggregates']['recall_at_5'],0)
        self.assertEqual(r['aggregates']['abstention_accuracy'],1)
    def test_errors_are_not_successful_abstentions(self):
        r=evaluate([{'id':'x','query':'x','expected_is_numbers':[]}],[{'status':'error'}],set())
        self.assertEqual(r['aggregates']['execution_errors'],1)
        self.assertEqual(r['aggregates']['abstention_accuracy'],0)
    def test_allied_grounding_and_review_only_candidates(self):
        r=evaluate([{'id':'x','query':'x','expected_is_numbers':[]}],[{'status':'review_required','primary_standards':[{'is_number':'IS-SEED-1','meets_confidence_threshold':False,'allied_standards':{'TEST_METHOD_FOR':[{'is_number':'IS-SEED-MISSING'}]}}]}],{'IS-SEED-1'})
        self.assertEqual(r['aggregates']['hallucinated_items'],1)
        self.assertEqual(r['aggregates']['false_positive_items'],0)
        self.assertEqual(r['aggregates']['abstention_accuracy'],1)
