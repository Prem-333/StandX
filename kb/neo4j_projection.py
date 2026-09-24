"""Versioned Neo4j graph projection; startup loads the exact indexed snapshot."""
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
import networkx as nx
from neo4j import GraphDatabase

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from kb.build_graph import build_graph
from services.ingestion.records import read_records,digest

RELATIONS={'NORMATIVE_REFERENCE','TEST_METHOD_FOR','TERMINOLOGY_FOR','SAFETY_STANDARD_FOR',
           'INSTALLATION_STANDARD_FOR','SUPERSEDES','AMENDED_BY','SAME_COMMITTEE',
           'REQUIRES_CERTIFICATION','UNTYPED_REFERENCE'}


def graph_driver():
    uri=os.environ.get('NEO4J_URI','bolt://127.0.0.1:7687')
    return GraphDatabase.driver(uri,auth=(os.environ.get('NEO4J_USERNAME','neo4j'),os.environ['NEO4J_PASSWORD']))


def publish(records):
    graph=build_graph(records);fingerprint=digest(records)
    def write(tx):
        for kind in ('Standard','Amendment','CertificationScheme'):
            nodes=[{'key':key,'payload':json.dumps(attrs,ensure_ascii=False),'is_number':attrs.get('is_number'),
                    'title':attrs.get('title'),'status':attrs.get('status'),'latest_version':attrs.get('latest_version'),
                    'group':attrs.get('classification',{}).get('group')} for key,attrs in graph.nodes(data=True) if attrs['kind']==kind]
            tx.run(f'''UNWIND $rows AS row MERGE (n:KBNode:{kind} {{snapshot:$snapshot,key:row.key}})
                SET n.payload=row.payload,n.is_number=row.is_number,n.title=row.title,n.status=row.status,
                    n.latest_version=row.latest_version,n.group=row.group''',rows=nodes,snapshot=fingerprint).consume()
        for relation in RELATIONS:
            rows=[{'a':a,'b':b,'id':digest([a,b,e]),'payload':json.dumps(e,ensure_ascii=False)}
                  for a,b,e in graph.edges(data=True) if e['type']==relation]
            tx.run(f'''UNWIND $rows AS row MATCH (a:KBNode {{snapshot:$snapshot,key:row.a}}),
                (b:KBNode {{snapshot:$snapshot,key:row.b}})
                MERGE (a)-[r:{relation} {{id:row.id}}]->(b) SET r.payload=row.payload''',rows=rows,snapshot=fingerprint).consume()
        tx.run('MERGE (s:KBSnapshot {fingerprint:$key}) SET s.payload=$payload',key=fingerprint,
               payload=json.dumps(graph.graph,ensure_ascii=False)).consume()
    with graph_driver() as driver:
        with driver.session() as session:
            session.run('CREATE CONSTRAINT kb_node_key IF NOT EXISTS FOR (n:KBNode) REQUIRE (n.snapshot,n.key) IS UNIQUE').consume()
            session.execute_write(write)
    return {'fingerprint':fingerprint,'nodes':len(graph),'edges':graph.number_of_edges()}


def load_projection(expected):
    with graph_driver() as driver:
        with driver.session() as session:
            def read(tx):
                row=tx.run('MATCH (s:KBSnapshot {fingerprint:$key}) RETURN s.payload AS payload',key=expected).single()
                if row is None:raise ValueError('Neo4j snapshot does not match retrieval KB')
                graph=nx.MultiDiGraph(**json.loads(row['payload']))
                for n in tx.run('MATCH (n:KBNode {snapshot:$key}) RETURN n.key AS key,n.payload AS payload',key=expected):
                    graph.add_node(n['key'],**json.loads(n['payload']))
                for e in tx.run('MATCH (a:KBNode {snapshot:$key})-[r]->(b:KBNode {snapshot:$key}) RETURN a.key AS a,b.key AS b,r.payload AS payload',key=expected):
                    graph.add_edge(e['a'],e['b'],**json.loads(e['payload']))
                return graph
            return session.execute_read(read)


if __name__=='__main__':print(json.dumps(publish(read_records()),indent=2))
