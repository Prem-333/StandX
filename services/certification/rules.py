"""Reloadable data rules. Unknown or stale evidence never means voluntary."""
from datetime import date, datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
from urllib.parse import urlparse

from services.ingestion.records import ROOT, identifier

DEFAULT_PATH = ROOT/'data/processed/certification_rules.json'


def validate_rules(data):
    if data.get('schema_version')!=1 or not isinstance(data.get('rules'),list):
        raise ValueError('Invalid rule document')
    seen=set()
    for rule in data['rules']:
        for key in ('id','product_category','category_label','scheme','requirement','verified_on','review_after','evidence','conditions','standard_families'):
            if key not in rule:raise ValueError(f'Missing rule field {key}')
        if rule['id'] in seen:raise ValueError('Duplicate rule ID')
        seen.add(rule['id'])
        if not re.fullmatch(r'[a-z0-9_-]+',rule['product_category']):raise ValueError('Invalid category slug')
        if rule['scheme'] not in data['schemes']:raise ValueError('Unknown scheme')
        if rule['requirement'] not in ('mandatory','voluntary','not_applicable','unknown'):
            raise ValueError('Invalid requirement')
        verified=date.fromisoformat(rule['verified_on']);review=date.fromisoformat(rule['review_after'])
        if verified>datetime.now(timezone.utc).date() or review<verified:raise ValueError('Invalid verification dates')
        if not rule['evidence']:raise ValueError('Every rule needs primary-source evidence')
        for source in rule['evidence']:
            host=urlparse(source['url']).hostname or ''
            if urlparse(source['url']).scheme!='https' or not (host=='gov.in' or host.endswith('.gov.in')):
                raise ValueError('Regulatory sources must be HTTPS government primary sources')
            if not source.get('locator') or not source.get('summary'):raise ValueError('Evidence needs a locator and summary')
        for cond in rule['conditions']:
            if set(cond)!={'field','equals','description'}:raise ValueError('Invalid condition')
    return data


class CertificationRules:
    def __init__(self,path=None):
        self.path=Path(path or os.environ.get('CERTIFICATION_RULES_PATH',DEFAULT_PATH))

    def snapshot(self):
        # Atomic admin replacement makes a full read a consistent request snapshot.
        raw=self.path.read_bytes()
        return validate_rules(json.loads(raw)),hashlib.sha256(raw).hexdigest()

    def evaluate(self,product_category,context=None,*,today=None,trigger=None,snapshot=None):
        data,checksum=snapshot or self.snapshot();context=context or {}
        today=today or datetime.now(timezone.utc).date()
        rows=[r for r in data['rules'] if r['product_category']==product_category]
        results=[]
        for rule in rows:
            expired=today>date.fromisoformat(rule['review_after'])
            future=today<date.fromisoformat(rule.get('effective_from',rule['verified_on']))
            missing=[c for c in rule['conditions'] if c['field'] not in context]
            mismatch=[c for c in rule['conditions'] if c['field'] in context and context[c['field']]!=c['equals']]
            applies=None if expired or future or missing else not bool(mismatch)
            requirement='unknown' if expired else rule['requirement']
            results.append({**rule,'scheme_name':data['schemes'][rule['scheme']]['name'],
                'requirement':requirement,'last_verified_requirement':rule['requirement'],
                'as_verified_on':rule['verified_on'],'stale':expired,'not_yet_effective':future,
                'mandatory_for_listed_category':None if expired else rule['requirement']=='mandatory',
                'applies_to_supplied_context':applies,'missing_conditions':missing,
                'unmet_conditions':mismatch,'context_assertions':context,
                'trigger':trigger or {'type':'explicit_product_category','value':product_category},
                'rules_fingerprint':checksum,
                'notice':'Rule evidence is stale; reverify before relying on this.' if expired else
                    'Category rule is dated; confirm product scope, exemptions and transition conditions before procurement.'})
        return {'product_category':product_category,'status':'mapped' if rows else 'unknown',
                'certification_requirements':results,'rules_fingerprint':checksum,
                'coverage':'Curated subset; an unmapped category does not establish exemption or voluntary status.'}

    def for_record(self,record,context=None,*,snapshot=None):
        if record['source']!='bis_public_metadata_verified':return []
        data,checksum=snapshot or self.snapshot()
        categories=sorted({r['product_category'] for r in data['rules']
            if identifier(record['family']) in {identifier(x) for x in r['standard_families']}})
        results=[]
        for category in categories:
            results.extend(self.evaluate(category,context,snapshot=(data,checksum),trigger={
                'type':'curated_standard_family_classification','value':record['family'],
                'record_id':record['record_id'],'is_number':record['is_number'],
                'kb_classification':record['classification'],'source_url':record.get('source_url'),
                'scope':'candidate standard category; query applicability still requires human review'
            })['certification_requirements'])
        return results


def version_warnings(version,source):
    status=version['status'];number=version['is_number']
    if status not in ('withdrawn','superseded'):return []
    final=version.get('final_current_standard')
    prefix='MOCK/SYNTHETIC: ' if source=='synthetic_seed' else ''
    if status=='superseded' and final:
        message=f'This standard was superseded by {final} — update your tender reference'
    elif status=='superseded':
        message='This standard was superseded — replacement is unresolved; verify before updating your tender reference'
    else:
        message='This standard is withdrawn — do not use it as a current tender reference; verify a replacement'
    return [{'severity':'hard','code':'STANDARD_'+status.upper(),'message':prefix+message,
             'is_number':number,'source':source,'evidence':version}]
