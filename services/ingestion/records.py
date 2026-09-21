"""Shared, offline record contract and identifier handling."""
import csv
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / 'data/processed/standards_seed.json'
TYPES = {'untyped_reference', 'normative_reference', 'test_method_for', 'terminology_for',
         'superseded_by', 'allied_safety_standard', 'installation_standard'}
DOMAINS = {'electrical_electronic': 'Electrical/electronic goods',
           'steel_construction': 'Steel/construction materials', 'textiles': 'Textiles',
           'furniture': 'Furniture', 'safety_equipment': 'Safety equipment'}


def identifier(value):
    """Whitespace/punctuation aliases only; never replace part/section/year digits."""
    return re.sub(r'[^A-Z0-9]', '', value.upper())


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def read_records(path=SEED):
    path = Path(path)
    if path.suffix.lower() == '.csv':
        with path.open(encoding='utf-8-sig', newline='') as f:
            records = [json.loads(row['record_json']) for row in csv.DictReader(f)]
    else:
        records = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(records, list):
        raise ValueError('Expected a JSON record array or CSV record_json column')
    seen = set()
    for r in records:
        validate_record(r)
        key = identifier(r['is_number'])
        if key in seen:
            raise ValueError('Duplicate edition: ' + r['is_number'])
        seen.add(key)
    return records


def validate_record(r):
    for k in ['record_id','family','is_number','title','source','fetched_at','publication_year',
              'classification','cross_references','amendments','certification_schemes','domain']:
        if k not in r:
            raise ValueError('Missing field: ' + k)
    source = r['source']
    if source not in ('synthetic_seed','bis_public_metadata_verified'):
        raise ValueError('Unsupported provenance')
    synthetic = source == 'synthetic_seed'
    if synthetic != r['is_number'].startswith('IS-SEED-') or synthetic != r['family'].startswith('IS-SEED-'):
        raise ValueError('Identifier/provenance mismatch')
    if not synthetic and (not r.get('source_url') or not r.get('snapshot_sha256')):
        raise ValueError('Verified metadata needs a URL and snapshot checksum')
    if synthetic and 'SYNTHETIC' not in r['title']:
        raise ValueError('Synthetic title must be visibly labelled')
    if r['domain'] not in DOMAINS:
        raise ValueError('Unknown procurement domain')
    for k in ['revision_count','amendment_count']:
        if r.get(k) is not None and (not isinstance(r[k], int) or r[k] < 0):
            raise ValueError('Invalid count: ' + k)
    for edge in r['cross_references']:
        if edge['type'] not in TYPES or edge['direction'] not in ('incoming','outgoing'):
            raise ValueError('Invalid cross-reference type or direction')
        if not edge.get('from') or not edge.get('to') or not edge.get('evidence_label'):
            raise ValueError('Cross-reference requires endpoints and evidence')
        if not synthetic and ('IS-SEED-' in edge['from'] or 'IS-SEED-' in edge['to']):
            raise ValueError('Real evidence cannot assert synthetic references')
    numbers = [a['number'] for a in r['amendments']]
    if len(set(numbers)) != len(numbers) or any(n < 1 for n in numbers):
        raise ValueError('Invalid amendment numbers')
    if r.get('amendment_count') is not None and len(numbers) > r['amendment_count']:
        raise ValueError('Amendment detail count exceeds published count')
