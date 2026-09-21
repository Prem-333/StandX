"""Offline corpus validation. Missing endpoints are findings, never invented records."""
import argparse
from collections import Counter, defaultdict
import json
from pathlib import Path
from .records import read_records, SEED, identifier


def validate(records):
    known = {identifier(r['is_number']) for r in records}
    findings = []
    successor = defaultdict(set)
    for r in records:
        for field in ('group','sub_group','sub_sub_group','aspect'):
            if r['classification'].get(field) in (None, '', 'N/A', 'NA'):
                findings.append({'code':'missing_classification','record':r['is_number'],'field':field})
        for e in r['cross_references']:
            a,b = identifier(e['from']),identifier(e['to'])
            if e['namespace']=='international':
                if not any(c.isalpha() for c in e['to']):
                    findings.append({'code':'malformed_international_reference','record':r['is_number'],'target':e['to']})
                continue
            missing = [raw for raw,key in [(e['from'],a),(e['to'],b)] if key not in known]
            if missing:
                findings.append({'code':'orphan_cross_reference','record':r['is_number'],
                                 'missing':missing,'type':e['type']})
            if e['type']=='superseded_by':
                successor[a].add(b)
    for start, targets in successor.items():
        if len(targets)>1:
            findings.append({'code':'ambiguous_supersession','record':start,'targets':sorted(targets)})
    # Iterative DFS avoids recursion limits on a larger catalogue.
    state, reported = {}, set()
    for start in list(successor):
        if state.get(start):
            continue
        stack=[(start,iter(successor[start]))]; state[start]=1
        while stack:
            node,children=stack[-1]
            child=next(children,None)
            if child is None:
                state[node]=2;stack.pop();continue
            if state.get(child)==1:
                cycle=[x[0] for x in stack]
                cycle=cycle[cycle.index(child):]+[child]
                key=tuple(sorted(set(cycle)))
                if key not in reported:
                    findings.append({'code':'circular_supersession','path':cycle});reported.add(key)
            elif not state.get(child):
                state[child]=1;stack.append((child,iter(successor.get(child,()))))
    return {'records':len(records),'counts':dict(Counter(f['code'] for f in findings)), 'findings':findings}


def versions(records):
    families=defaultdict(list)
    superseded={identifier(e['from']) for r in records for e in r['cross_references'] if e['type']=='superseded_by'}
    for r in records:
        families[r['family']].append(r)
    result={}
    for family,rows in families.items():
        newest=max(r['publication_year'] for r in rows)
        candidates=[r for r in rows if r['publication_year']==newest]
        latest=candidates[0]['record_id'] if len(candidates)==1 else None
        for r in rows:
            result[r['record_id']]={'latest_version':latest,
                'superseded':identifier(r['is_number']) in superseded or r.get('status')=='superseded'}
    return result


def main():
    p=argparse.ArgumentParser();p.add_argument('input',nargs='?',type=Path,default=SEED)
    p.add_argument('--output',type=Path);p.add_argument('--strict',action='store_true')
    a=p.parse_args(); report=validate(read_records(a.input))
    if a.output:a.output.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='findings'},indent=2))
    fatal=any(report['counts'].get(k) for k in ('circular_supersession','ambiguous_supersession'))
    raise SystemExit(1 if fatal or (a.strict and report['findings']) else 0)


if __name__=='__main__':main()
