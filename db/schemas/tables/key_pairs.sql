CREATE TABLE key_pairs (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),

    key_type TEXT,
    key_size INT,

    fingerprint TEXT,

    created_at TIMESTAMP DEFAULT now()
);