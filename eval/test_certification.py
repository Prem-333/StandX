import copy
from datetime import date
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from services.certification.rules import CertificationRules,version_warnings
from services.certification.admin import upsert_rule
from kb.build_graph import StandardsGraph,build_graph
from services.ingestion.records import read_records


class CertificationTests(unittest.TestCase):
    def setUp(self):self.rules=CertificationRules()

    def test_three_categories_and_unknown(self):
        context={'domestic_supply':True,'exemption_claimed':False}
        for cat,scheme in [('bright_steel_bars','ISI'),('laptop_notebook_tablet','CRS')]:
            result=self.rules.evaluate(cat,context,today=date(2026,9,21))['certification_requirements'][0]
            self.assertEqual(result['scheme'],scheme);self.assertEqual(result['requirement'],'mandatory')
            self.assertTrue(result['applies_to_supplied_context']);self.assertTrue(result['evidence'])
        silver=self.rules.evaluate('silver_jewellery_artefacts',today=date(2026,9,21))['certification_requirements']
        self.assertEqual([r['requirement'] for r in silver],['voluntary'])
        self.assertFalse(any(r['scheme'] in ('ISI','CRS') and r['mandatory_for_listed_category'] for r in silver))
        self.assertEqual(self.rules.evaluate('unmapped')['status'],'unknown')

    def test_missing_conditions_staleness_and_gold_geography(self):
        row=self.rules.evaluate('gold_jewellery_artefacts',today=date(2026,9,21))['certification_requirements'][0]
        self.assertIsNone(row['applies_to_supplied_context'])
        self.assertIn('district_in_current_annexure',[c['field'] for c in row['missing_conditions']])
        row=self.rules.evaluate('bright_steel_bars',today=date(2027,1,1))['certification_requirements'][0]
        self.assertEqual(row['requirement'],'unknown');self.assertIsNone(row['mandatory_for_listed_category'])

    def test_hot_reload_validation(self):
        with TemporaryDirectory() as folder:
            path=Path(folder)/'rules.json';data,_=self.rules.snapshot();path.write_text(json.dumps(data),encoding='utf-8')
            store=CertificationRules(path);before=store.snapshot()[1]
            row=copy.deepcopy(data['rules'][0]);row['review_after']='2026-11-01'
            result=upsert_rule(row,'unit-test',path)
            self.assertNotEqual(before,result['rules_fingerprint'])
            self.assertEqual(store.snapshot()[0]['rules'][-1]['review_after'],'2026-11-01')
            row['evidence']=[]
            with self.assertRaises(ValueError):upsert_rule(row,'unit-test',path)

    def test_hard_warnings_resolve_final_successor_and_withdrawal(self):
        graph=StandardsGraph(build_graph(read_records()))
        warning=version_warnings(graph.get_version_status('IS-SEED-1001:2020'),'synthetic_seed')[0]
        self.assertEqual(warning['severity'],'hard');self.assertIn('IS-SEED-1001:2024',warning['message'])
        self.assertIn('MOCK/SYNTHETIC',warning['message'])
        warning=version_warnings(graph.get_version_status('IS-SEED-1024:2024'),'synthetic_seed')[0]
        self.assertIn('withdrawn',warning['message'])
