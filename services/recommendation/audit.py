"""PostgreSQL audit writer. No in-memory fallback and no swallowed write errors."""
import os
from contextvars import ContextVar
from pathlib import Path
from urllib.parse import urlparse

import psycopg
from psycopg.types.json import Jsonb

audit_actor = ContextVar('audit_actor', default=None)


class PostgresAudit:
    def __init__(self, database_url=None):
        dsn = database_url or os.environ.get('DATABASE_URL')
        if not dsn:
            raise ValueError('DATABASE_URL is required for durable audit logging; run npm run phase5-demo for the local demo.')
        # This profile is offline. PostgreSQL must be local too.
        allowed=('127.0.0.1','localhost','::1')+ (('postgres',) if os.environ.get('OFFLINE_DOCKER')=='1' else ())
        if urlparse(dsn).hostname not in allowed:
            raise ValueError('Offline audit profile requires a loopback PostgreSQL URL')
        self.connection = psycopg.connect(dsn, autocommit=True)
        try:
            self.connection.execute(Path(__file__).with_name('audit.sql').read_text(encoding='utf-8'))
        except Exception:
            self.close()
            raise

    def append(self, response):
        # Commit before returning. The caller receives no successful result if logging fails.
        with self.connection.transaction():
            self.connection.execute('''
                INSERT INTO kb.recommendations_log
                (id,request_group_id,kind,query_text,created_at,status,scores,results,
                 kb_fingerprint,model_configuration,recommendation_configuration,actor_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ''', (
                    response['recommendation_id'], response['request_group_id'], response['kind'],
                    response['query_text'], response['timestamp'], response['status'],
                    Jsonb([{'record_id':r['record_id'], 'is_number':r['is_number'],
                            'confidence_score':r['confidence_score']} for r in response['primary_standards']]),
                    Jsonb(response), response['kb_fingerprint'], Jsonb(response['model_configuration']),
                    Jsonb(response['recommendation_configuration']), audit_actor.get()))

    def close(self):
        self.connection.close()
