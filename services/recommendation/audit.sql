CREATE SCHEMA IF NOT EXISTS kb;
CREATE TABLE IF NOT EXISTS kb.recommendations_log (
    id uuid PRIMARY KEY,
    request_group_id uuid NOT NULL,
    kind text NOT NULL CHECK (kind IN ('query','tender_phrase','tender')),
    query_text text NOT NULL,
    created_at timestamptz NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status text NOT NULL,
    scores jsonb NOT NULL,
    results jsonb NOT NULL,
    kb_fingerprint text NOT NULL,
    model_configuration jsonb NOT NULL,
    recommendation_configuration jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS recommendations_log_created_idx ON kb.recommendations_log(created_at);
CREATE INDEX IF NOT EXISTS recommendations_log_group_idx ON kb.recommendations_log(request_group_id);
