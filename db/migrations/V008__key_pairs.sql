-- V008__key_pairs.sql
CREATE TABLE key_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    alias TEXT,
    key_type TEXT,
    key_size INT,
    fingerprint TEXT,

    created_at TIMESTAMP DEFAULT now()
);