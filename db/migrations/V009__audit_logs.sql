CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,

    actor_id UUID,
    action TEXT NOT NULL,

    target_type TEXT,
    target_id TEXT,

    metadata JSONB,

    created_at TIMESTAMP DEFAULT now()
);