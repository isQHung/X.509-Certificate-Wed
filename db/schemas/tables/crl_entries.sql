CREATE TABLE crl_entries (
    id UUID PRIMARY KEY,

    crl_id UUID,
    serial_number TEXT,
    revoked_at TIMESTAMP,

    reason TEXT
);