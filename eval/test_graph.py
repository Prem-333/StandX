import unittest
import copy
from kb.build_graph import StandardsGraph,build_graph
from services.ingestion.records import read_records


class GraphTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.graph=StandardsGraph(build_graph(read_records()))

    def test_multihop_supersession_resolves_final_current(self):
        result=self.graph.get_version_status('IS-SEED-1001:2020')
        self.assertEqual(result['supersession_path'],['IS-SEED-1001:2020','IS-SEED-1001:2022','IS-SEED-1001:2024'])
        self.assertEqual(result['final_current_standard'],'IS-SEED-1001:2024')
        self.assertFalse(result['is_latest_revision'])

    def test_typed_groups_direction_and_global_deduplication(self):
        groups=self.graph.expand_allied_standards('IS-SEED-1001:2024')
        for kind in ('TEST_METHOD_FOR','TERMINOLOGY_FOR','SAFETY_STANDARD_FOR','INSTALLATION_STANDARD_FOR','NORMATIVE_REFERENCE'):
            self.assertIn(kind,groups)
        items=[x for group in groups.values() for x in group]
        self.assertEqual(len(items),len({x['record_id'] for x in items}))
        self.assertTrue(all(x['evidence_path'] and x['source']=='synthetic_seed' for x in items))

    def test_hop_limit_and_reverse_primary_resolution(self):
        self.assertEqual(self.graph.expand_allied_standards('IS-SEED-1001:2024',0),{})
        one=self.graph.expand_allied_standards('IS-SEED-1001:2020',1)
        self.assertTrue(all(x['hops']==1 for group in one.values() for x in group))
        self.assertEqual(one['TEST_METHOD_FOR'][0]['is_number'],'IS-SEED-1002:2024')
        records=copy.deepcopy(read_records())
        middle=next(r for r in records if r['is_number']=='IS-SEED-1006:2024')
        middle['cross_references'].append({'from':middle['is_number'],'to':'IS-SEED-1007:2024',
            'type':'normative_reference','direction':'outgoing','namespace':'synthetic',
            'evidence_label':'MOCK/SYNTHETIC two-hop fixture'})
        api=StandardsGraph(build_graph(records))
        two=api.expand_allied_standards('IS-SEED-1001:2024',2)
        target=next(x for x in two['NORMATIVE_REFERENCE'] if x['is_number']=='IS-SEED-1007:2024')
        self.assertEqual(target['hops'],2);self.assertEqual(len(target['evidence_path']),2)

    def test_real_metadata_does_not_imply_normative_or_latest_claims(self):
        result=self.graph.get_version_status('IS 12680:1989')
        self.assertIsNone(result['is_latest_revision'])
        self.assertIsNone(result['unresolved_amendments'])
        self.assertEqual(result['amendments_with_unknown_resolution'],2)
        self.assertNotIn('NORMATIVE_REFERENCE',self.graph.expand_allied_standards('IS 12680:1989'))

    def test_amendments_withdrawal_and_missing_identifier(self):
        result=self.graph.get_version_status('IS-SEED-1001:2024')
        self.assertTrue(result['is_latest_revision']);self.assertEqual(result['unresolved_amendments'],1)
        self.assertIsNone(self.graph.get_version_status('IS-SEED-1024:2024')['final_current_standard'])
        with self.assertRaises(KeyError):self.graph.get_version_status('IS-SEED-NOT-IN-KB')


if __name__=='__main__':unittest.main()
