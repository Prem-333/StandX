"""Rebuild the mixed seed entirely offline from individually captured metadata."""
from pathlib import Path
import csv
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from services.ingestion.parse_snapshot import parse
from services.ingestion.records import DOMAINS, SEED, validate_record


def real_record(path):
    provenance = json.loads(path.with_suffix('.provenance.json').read_text(encoding='utf-8'))
    fields, tables = parse(path)
    number = re.match(r'^(.*?:\s*\d{4})', fields['IS Number']).group(1)
    year = int(re.search(r'(\d{4})$', number).group())
    family = re.sub(r':\s*\d{4}$', '', number).strip()
    references = []
    for table in tables:
        label = table['label']
        incoming = 'is Refered in following' in label
        international = label.startswith('International')
        for row in table['rows'][1:]:
            if not row or not row[0].isdigit() or len(row) < 2:
                continue
            references.append({'from': row[1] if incoming else number,
                'to': number if incoming else row[1], 'type': 'untyped_reference',
                'direction': 'incoming' if incoming else 'outgoing',
                'namespace': 'international' if international else 'indian',
                'title_raw': row[2] if len(row) > 2 else None,
                'committee_raw': row[3] if len(row) > 3 else None,
                'evidence_label': label, 'published_row': row})
    quality = []
    if '\ufffd' in json.dumps(fields, ensure_ascii=False):
        quality.append('Publisher HTML contains replacement characters; retained verbatim')
    if any(x['namespace']=='international' and not re.search('[A-Za-z]',x['to']) for x in references):
        quality.append('Malformed international reference retained for curation, excluded from graph resolution')
    record = {
        'record_id': f'bis-{path.stem}', 'family': family, 'is_number': number,
        'title': fields['IS Title [Eng-Hn]'], 'source':'bis_public_metadata_verified',
        'source_url': provenance['url'], 'resolved_url': provenance['resolved_url'],
        'fetched_at':provenance['fetched_at'], 'snapshot_path':path.relative_to(ROOT).as_posix(),
        'snapshot_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
        'domain':provenance['domain'], 'domain_mapping_source':'project_curated',
        'publication_year':year, 'revision_count':int(fields['No of Revision']),
        'amendment_count':int(fields['No of Amendments']), 'amendments':[],
        'amendment_detail_status':'not_published_in_captured_page',
        'degree_of_equivalence':fields.get('Degree of Equivalence'),
        'equivalent_standards_raw':fields.get('Identical/Equivalent Standards'),
        'technical_department':fields.get('Technical Department'),
        'technical_committee':fields.get('Technical Committee'), 'language':fields.get('Language'),
        'scope_abstract':None, 'scope_status':'not_published_in_captured_page',
        'classification':{k:fields.get(v) for k,v in [('group','Group'),('sub_group','Sub Group'),
            ('sub_sub_group','Sub Sub Group'),('aspect','Aspects')]},
        'certification_flag_raw':fields.get('Certification'), 'certification_required':None,
        'certification_schemes':[], 'status':'unknown', 'latest_confirmed':False,
        'superseding_raw':None, 'superseded_by_raw':None,
        'supersession_status':'not_published_in_captured_page',
        'cross_references':references, 'raw_fields':fields, 'quality_notes':quality,
        'display_label':'BIS public metadata verified; applicability/version completeness not confirmed'
    }
    validate_record(record)
    return record


def synthetic_records():
    out = []
    products = {'electrical_electronic':'LED street lighting', 'steel_construction':'steel reinforcement',
                'textiles':'protective textile fabric', 'furniture':'office furniture',
                'safety_equipment':'protective safety equipment'}
    roles = ['product specification','test method','terminology','safety requirements',
             'installation practice','allied component']
    for domain_index,(domain,label) in enumerate(DOMAINS.items()):
        start = 1001 + domain_index*100
        for j in range(24):
            years = [2020,2022,2024] if j == 0 else [2024]
            for year in years:
                family=f'IS-SEED-{start+j}'
                number=f'{family}:{year}'
                title=f'MOCK/SYNTHETIC {products[domain]} — {roles[j % len(roles)]} fixture {j+1}'
                r={'record_id':f'seed-{start+j}-{year}', 'family':family, 'is_number':number,
                   'title':title, 'source':'synthetic_seed','source_url':None,
                   'fetched_at':'2026-09-21T00:00:00+00:00', 'publication_year':year,
                   'domain':domain,'domain_mapping_source':'synthetic_seed',
                   'revision_count':years.index(year), 'amendment_count':2 if j==0 and year==2024 else 0,
                   'amendments':[], 'amendment_detail_status':'synthetic_complete',
                   'degree_of_equivalence':'MOCK/SYNTHETIC Indigenous', 'equivalent_standards_raw':'',
                   'technical_department':f'MOCK/SYNTHETIC {label} department',
                   'technical_committee':f'SEED-COMMITTEE-{domain_index}', 'language':'English',
                   'scope_abstract':f'MOCK/SYNTHETIC procurement fixture for {products[domain]}; {roles[j % len(roles)]}. No real standard or compliance claim.',
                   'scope_status':'synthetic_seed',
                   'classification':{'group':f'MOCK/SYNTHETIC {label}','sub_group':'MOCK/SYNTHETIC procurement products',
                                     'sub_sub_group':f'MOCK/SYNTHETIC {products[domain]}','aspect':f'MOCK/SYNTHETIC {roles[j % len(roles)]}'},
                   'certification_flag_raw':'MOCK/SYNTHETIC — no legal effect',
                   'certification_required':True if j==0 else None,
                   'certification_schemes':[], 'status':'superseded' if year<2024 else 'active',
                   'latest_confirmed':True, 'superseding_raw':None,'superseded_by_raw':None,
                   'supersession_status':'synthetic_complete','cross_references':[],
                   'raw_fields':{},'quality_notes':[], 'display_label':'MOCK/SYNTHETIC — not a BIS standard'}
                if j==0:
                    r['certification_schemes']=[{'id':f'SCHEME-SEED-{domain_index}',
                       'name':f'MOCK/SYNTHETIC {label} scheme','requirement':'required','source':'synthetic_seed'}]
                    if year < 2024:
                        target=f'{family}:{year+2}'
                        r['superseded_by_raw']=target
                        r['cross_references'].append({'from':number,'to':target,'type':'superseded_by',
                            'direction':'outgoing','namespace':'synthetic','title_raw':title,
                            'evidence_label':'MOCK/SYNTHETIC explicit supersession fixture'})
                    else:
                        r['amendments']=[{'number':1,'issued_on':None,'resolution':'incorporated'},
                                         {'number':2,'issued_on':None,'resolution':'unresolved'}]
                        r['cross_references'].append({'from':number,'to':f'IS-SEED-{start+5}:2024',
                            'type':'normative_reference','direction':'outgoing','namespace':'synthetic',
                            'title_raw':None,'evidence_label':'MOCK/SYNTHETIC normative fixture'})
                if j in (1,2,3,4):
                    kind={1:'test_method_for',2:'terminology_for',3:'allied_safety_standard',4:'installation_standard'}[j]
                    r['cross_references'].append({'from':number,'to':f'IS-SEED-{start}:2024','type':kind,
                        'direction':'outgoing','namespace':'synthetic','title_raw':None,
                        'evidence_label':'MOCK/SYNTHETIC typed relationship fixture'})
                if j==23:
                    r['status']='withdrawn'
                validate_record(r)
                out.append(r)
    return out


def main():
    real = [real_record(p) for p in sorted((ROOT/'data/raw/bis').glob('*.html'))]
    if len(real)!=20:
        raise ValueError(f'Expected 20 manually verified snapshots, found {len(real)}')
    synthetic = synthetic_records()
    for path,records in [(ROOT/'data/processed/bis_verified.json',real),
                         (ROOT/'data/mock/synthetic_seed.json',synthetic),(SEED,real+synthetic)]:
        path.write_text(json.dumps(records,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    with SEED.with_suffix('.csv').open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=['is_number','source','record_json']);writer.writeheader()
        for r in real+synthetic:
            writer.writerow({'is_number':r['is_number'],'source':r['source'],'record_json':json.dumps(r,ensure_ascii=False)})
    print(json.dumps({'verified':len(real),'synthetic':len(synthetic),'total':len(real+synthetic)}))


if __name__=='__main__':
    main()
