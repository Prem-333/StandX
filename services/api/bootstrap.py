"""Idempotent offline initialization for the Compose backend."""
import os
import time
import json
from kb.local_models import config,qdrant,verify_cache
from kb.build_index import build_index
from kb.neo4j_projection import graph_driver,publish
from services.ingestion.records import read_records


def wait_for(action):
    last=None
    for _ in range(90):
        try:return action()
        except Exception as exc:last=exc;time.sleep(1)
    raise RuntimeError('Local backend dependency did not become ready') from last


def main():
    import psycopg
    from services.ingestion.records import SEED
    settings=config();verify_cache(settings,'embedding');verify_cache(settings,'reranker')
    def postgres():
        with psycopg.connect(os.environ['DATABASE_URL']) as connection:connection.execute('SELECT 1')
    def vector():
        client=qdrant(settings)
        try:client.get_collections()
        finally:client.close()
    def graph():
        with graph_driver() as driver:driver.verify_connectivity()
    wait_for(postgres);wait_for(vector);wait_for(graph)
    # Use the same public loader CLI entrypoint contract as Phase 2.
    import subprocess,sys
    subprocess.run([sys.executable,'-m','services.ingestion.load',str(SEED)],check=True)
    records=read_records()
    print(json.dumps({'vectors':build_index(records,settings),'graph':publish(records)}))


if __name__=='__main__':main()
