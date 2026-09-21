"""Local admin CLI with validation, atomic update, and append-only change journal."""
import argparse
from datetime import datetime,timezone
import hashlib
import json
from pathlib import Path
import tempfile
import portalocker

from services.ingestion.records import ROOT
from .rules import CertificationRules,validate_rules


def upsert_rule(rule,actor,path=None):
    if not actor.strip():raise ValueError('An operator identity is required')
    store=CertificationRules(path);store.path.parent.mkdir(parents=True,exist_ok=True)
    with portalocker.Lock(str(store.path)+'.lock',timeout=5):
        data,before=store.snapshot()
        data['rules']=[r for r in data['rules'] if r['id']!=rule['id']]+[rule]
        validate_rules(data)
        raw=(json.dumps(data,indent=2,ensure_ascii=False)+'\n').encode('utf-8')
        after=hashlib.sha256(raw).hexdigest()
        journal=ROOT/'data/local/certification_rule_changes.jsonl';journal.parent.mkdir(parents=True,exist_ok=True)
        event={'timestamp':datetime.now(timezone.utc).isoformat(),'actor':actor,'before_sha256':before,
               'after_sha256':after,'rule':rule,'operation':'validated_replace_intent'}
        with journal.open('a',encoding='utf-8') as f:f.write(json.dumps(event,ensure_ascii=False)+'\n')
        with tempfile.NamedTemporaryFile(dir=store.path.parent,delete=False,suffix='.tmp') as f:
            f.write(raw);temporary=Path(f.name)
        try:temporary.replace(store.path)
        finally:temporary.unlink(missing_ok=True)
    return {'rule_id':rule['id'],'rules_fingerprint':after,'reload':'next request'}


def main():
    p=argparse.ArgumentParser();p.add_argument('rule_json',type=Path);p.add_argument('--actor',required=True);p.add_argument('--rules',type=Path)
    args=p.parse_args()
    print(json.dumps(upsert_rule(json.loads(args.rule_json.read_text(encoding='utf-8')),args.actor,args.rules),indent=2))


if __name__=='__main__':main()
