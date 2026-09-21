"""Offline NetworkX graph. Load only this project's locally generated pickle."""
import argparse
from collections import defaultdict
import json
from pathlib import Path
import pickle
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import networkx as nx
from services.ingestion.records import ROOT, SEED, identifier, read_records
from services.ingestion.validate import validate, versions

GRAPH_PATH=ROOT/'kb/graph.gpickle'
EDGE_TYPES={'normative_reference':'NORMATIVE_REFERENCE','test_method_for':'TEST_METHOD_FOR',
    'terminology_for':'TERMINOLOGY_FOR','allied_safety_standard':'SAFETY_STANDARD_FOR',
    'installation_standard':'INSTALLATION_STANDARD_FOR','superseded_by':'SUPERSEDES',
    'untyped_reference':'UNTYPED_REFERENCE'}
WEIGHTS={'NORMATIVE_REFERENCE':1.0,'TEST_METHOD_FOR':0.95,'SAFETY_STANDARD_FOR':0.95,
    'INSTALLATION_STANDARD_FOR':0.9,'TERMINOLOGY_FOR':0.8,'UNTYPED_REFERENCE':0.5,'SAME_COMMITTEE':0.15}
REVERSE_TYPES={'TEST_METHOD_FOR','TERMINOLOGY_FOR','SAFETY_STANDARD_FOR','INSTALLATION_STANDARD_FOR'}


def build_graph(records):
    report=validate(records)
    if report['counts'].get('circular_supersession') or report['counts'].get('ambiguous_supersession'):
        raise ValueError('Cannot publish cyclic or ambiguous supersession graph')
    g=nx.MultiDiGraph(schema_version=1,unresolved=[],successors={},families={})
    v=versions(records);by_record={r['record_id']:r for r in records};committees=defaultdict(list)
    for r in records:
        key=identifier(r['is_number']);latest=v[r['record_id']]['latest_version']
        g.add_node(key,kind='Standard',**r,latest_version=by_record[latest]['is_number'] if latest else None,
                   superseded=v[r['record_id']]['superseded'])
        g.graph['families'][identifier(r['family'])]=identifier(by_record[latest]['is_number']) if latest else None
        if r.get('technical_committee'):committees[(r['source'],r['technical_committee'])].append(key)
    for r in records:
        key=identifier(r['is_number'])
        evidence={'record_id':r['record_id'],'is_number':r['is_number'],'source':r['source'],
                  'url':r.get('source_url'),'fetched_at':r['fetched_at'],'snapshot_sha256':r.get('snapshot_sha256')}
        for e in r['cross_references']:
            a,b=identifier(e['from']),identifier(e['to']);kind=EDGE_TYPES[e['type']]
            if kind=='SUPERSEDES':g.graph['successors'][a]=b
            if e['namespace']=='international' or a not in g or b not in g:
                g.graph['unresolved'].append({'edge':e,'evidence':evidence});continue
            if kind=='SUPERSEDES':a,b=b,a
            g.add_edge(a,b,type=kind,evidence={**evidence,'label':e['evidence_label']})
        for amendment in r['amendments']:
            aid=f"{key}:AMENDMENT:{amendment['number']}"
            g.add_node(aid,kind='Amendment',source=r['source'],**amendment)
            g.add_edge(key,aid,type='AMENDED_BY',evidence=evidence)
        for scheme in r['certification_schemes']:
            sid='SCHEME:'+scheme['id'];g.add_node(sid,kind='CertificationScheme',**scheme)
            if scheme['requirement']=='required':g.add_edge(key,sid,type='REQUIRES_CERTIFICATION',evidence=evidence)
    for (source,committee),members in committees.items():
        for a in members:
            for b in members:
                if a!=b:g.add_edge(a,b,type='SAME_COMMITTEE',evidence={'source':source,'label':committee,
                    'record_ids':[g.nodes[a]['record_id'],g.nodes[b]['record_id']],
                    'urls':[g.nodes[a].get('source_url'),g.nodes[b].get('source_url')]})
    return g


def save_graph(graph,path=GRAPH_PATH):
    path=Path(path);tmp=path.with_suffix('.tmp')
    with tmp.open('wb') as f:pickle.dump(graph,f,protocol=pickle.HIGHEST_PROTOCOL)
    tmp.replace(path)


def load_graph(path=GRAPH_PATH):
    # Pickle can execute code: never accept an uploaded/untrusted graph file.
    with Path(path).open('rb') as f:return pickle.load(f)


class StandardsGraph:
    def __init__(self,graph):self.graph=graph

    def _key(self,value):
        key=identifier(value)
        if key not in self.graph:key=self.graph.graph['families'].get(key)
        if key is None or key not in self.graph or self.graph.nodes[key]['kind']!='Standard':
            raise KeyError(f'No KB edition for {value}')
        return key

    def _final(self,key):
        path=[key];seen={key};successors=self.graph.graph['successors']
        while key in successors:
            key=successors[key]
            if key in seen:raise ValueError('Circular supersession')
            path.append(key);seen.add(key)
            if key not in self.graph:return None,path
        return key,path

    def get_version_status(self,is_number):
        key=self._key(is_number);node=self.graph.nodes[key]
        final,path=self._final(key);terminal=self.graph.nodes[final] if final else None
        details=node['amendments'];reported=node.get('amendment_count')
        unresolved=sum(a['resolution']=='unresolved' for a in details)
        unknown=None if reported is None else max(0,reported-len(details))+sum(a['resolution']=='unknown' for a in details)
        latest_observed=bool(node['latest_version'] and identifier(node['latest_version'])==key and final==key)
        withdrawn=bool(terminal and terminal['status']=='withdrawn')
        return {'is_number':node['is_number'],'record_id':node['record_id'],'source':node['source'],
            'status':'superseded' if len(path)>1 else node['status'],
            'latest_version':node['latest_version'],'is_latest_observed':latest_observed,
            'is_latest_revision':(latest_observed and not withdrawn) if node['latest_confirmed'] else (False if len(path)>1 else None),
            'latest_basis':'synthetic_fixture' if node['source']=='synthetic_seed' else 'latest_observed_in_partial_kb',
            'superseded_by':self.graph.nodes[path[1]]['is_number'] if len(path)>1 and path[1] in self.graph else None,
            'final_current_standard':terminal['is_number'] if terminal and not withdrawn else None,
            'final_current_confirmed':bool(terminal and terminal['latest_confirmed'] and not withdrawn),
            'supersession_path':[self.graph.nodes[x]['is_number'] if x in self.graph else x for x in path],
            'replacement_unresolved':final is None,'amendments_reported':reported,
            'known_unresolved_amendments':unresolved,'amendments_with_unknown_resolution':unknown,
            'unresolved_amendments':unresolved if unknown==0 else None,
            'amendments_apply_to':node['is_number'],'citation':node.get('source_url') or node['record_id']}

    def expand_allied_standards(self,is_number,max_hops=2):
        if not isinstance(max_hops,int) or not 0<=max_hops<=4:raise ValueError('max_hops must be 0..4')
        original=self._key(is_number);start,_=self._final(original)
        if start is None:return {}
        frontier=[(start,[],1.0,{start})];best={}
        for hop in range(1,max_hops+1):
            following=[]
            for current,path,path_score,visited in frontier:
                candidates=[]
                for _,target,e in self.graph.out_edges(current,data=True):
                    if e['type'] in WEIGHTS and e['type'] not in REVERSE_TYPES:candidates.append((target,e))
                for target,_,e in self.graph.in_edges(current,data=True):
                    if e['type'] in REVERSE_TYPES:candidates.append((target,e))
                for target,e in candidates:
                    if target in visited or target==original:continue
                    resolved,chain=self._final(target)
                    if resolved is None or resolved in visited or resolved==original:continue
                    node=self.graph.nodes[resolved]
                    if node['kind']!='Standard' or node['status']=='withdrawn':continue
                    steps=path+[{'from':self.graph.nodes[current]['is_number'],
                        'to':self.graph.nodes[target]['is_number'],'relationship':e['type'],'evidence':e['evidence']}]
                    score=path_score*WEIGHTS[e['type']]*(0.7 if hop>1 else 1)
                    item={'is_number':node['is_number'],'record_id':node['record_id'],'title':node['title'],
                        'source':node['source'],'display_label':node['display_label'],'relationship_type':e['type'],
                        'score':round(score,6),'hops':hop,'evidence_path':steps,
                        'resolved_from':self.graph.nodes[target]['is_number'],
                        'supersession_path':[self.graph.nodes[x]['is_number'] for x in chain if x in self.graph],
                        'citation':node.get('source_url') or node['record_id']}
                    if resolved not in best or score>best[resolved]['score']:best[resolved]=item
                    if e['type']!='SAME_COMMITTEE':following.append((resolved,steps,score,visited|{resolved}))
            frontier=following
        grouped=defaultdict(list)
        for item in sorted(best.values(),key=lambda x:(-x['score'],x['is_number'])):
            grouped[item['relationship_type']].append(item)
        return dict(grouped)


def expand_allied_standards(is_number,max_hops=2):
    return StandardsGraph(load_graph()).expand_allied_standards(is_number,max_hops)


def get_version_status(is_number):
    return StandardsGraph(load_graph()).get_version_status(is_number)


def main():
    p=argparse.ArgumentParser();p.add_argument('--input',type=Path,default=SEED)
    a=p.parse_args();g=build_graph(read_records(a.input));save_graph(g)
    print(json.dumps({'nodes':g.number_of_nodes(),'edges':g.number_of_edges(),
        'unresolved_references':len(g.graph['unresolved']),'path':str(GRAPH_PATH)},indent=2))


if __name__=='__main__':main()
