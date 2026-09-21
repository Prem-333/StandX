CREATE TABLE IF NOT EXISTS kb.user_feedback (
    id uuid PRIMARY KEY,
    recommendation_id uuid NOT NULL REFERENCES kb.recommendations_log(id),
    actor_id text NOT NULL,
    decision text NOT NULL CHECK (decision IN ('confirm','correct','reject')),
    record_id text,
    comment text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evidence jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS feedback_recommendation_idx ON kb.user_feedback(recommendation_id);
