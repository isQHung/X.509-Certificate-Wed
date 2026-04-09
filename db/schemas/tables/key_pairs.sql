CREATE TABLE key_pairs (
    id UUID PRIMARY KEY,
    owner_id UUID,
    alias TEXT,

    key_type TEXT,
    key_size INT,

    fingerprint TEXT,

    created_at TIMESTAMP DEFAULT now()
);