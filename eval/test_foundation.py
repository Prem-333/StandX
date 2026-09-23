import copy
from collections import defaultdict
import unittest
from services.ingestion.records import read_records,identifier,validate_record
from services.ingestion.validate import validate
from services.nlp.retrieve import Retriever,rrf


class FoundationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.records=read_records()

    def test_validator_reports_missing_classification_orphan_and_cycle(self):
        r=copy.deepcopy(self.records)
        a=next(x for x in r if x['is_number']=='IS-SEED-1001:2024')
        a['classification']['group']=None
        for target in ('IS-SEED-1001:2020','IS-SEED-9999:2024'):
            a['cross_references'].append({'from':a['is_number'],'to':target,
                'type':'superseded_by' if '1001' in target else 'normative_reference',
                'direction':'outgoing','namespace':'synthetic','evidence_label':'MOCK/SYNTHETIC validator test'})
        report=validate(r)
        for key in ('missing_classification','orphan_cross_reference','circular_supersession'):
            self.assertGreater(report['counts'].get(key,0),0)

    def test_provenance_cannot_silently_change(self):
        r=copy.deepcopy(self.records[0]);r['source']='synthetic_seed'
        with self.assertRaises(ValueError):validate_record(r)

    def test_literal_aliases_unknown_and_family(self):
        engine=Retriever.__new__(Retriever);engine.records=self.records
        engine.by_number={identifier(r['is_number']):i for i,r in enumerate(self.records)}
        engine.by_family=defaultdict(list)
        for i,r in enumerate(self.records):engine.by_family[identifier(r['family'])].append(i)
        hits,literal=engine.exact_matches('Please show IS 7259 : Part 1 : 1988')
        self.assertTrue(literal)
        self.assertEqual(self.records[hits[0]]['is_number'],'IS 7259 (Part 1):1988')
        self.assertEqual(engine.exact_matches('IS 999999:2099'),([],True))
        hits,literal=engine.exact_matches('IS-SEED-1001')
        self.assertEqual(self.records[hits[0]]['publication_year'],2024)
        hits,literal=engine.exact_matches('IS 7524 optical tests and IS 5983 specification')
        self.assertTrue(literal)
        self.assertEqual([self.records[i]['is_number'] for i in hits],['IS 5983:1980'])
        hits,literal=engine.exact_matches('IS 9550:2024 and IS 6188:1988 and IS 9550:2024')
        self.assertEqual(len(hits),2)

    def test_rrf_rewards_agreement_without_comparing_raw_scores(self):
        result=rrf([[1,2,3],[3,2,4]])
        self.assertEqual(result[0][0],3)
        self.assertEqual(len(result),4)
        self.assertGreater(dict(result)[2],dict(result)[1])


if __name__=='__main__':unittest.main()
