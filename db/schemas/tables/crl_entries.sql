CREATE TABLE crl_entries (
    id UUID PRIMARY KEY,

    crl_id UUID REFERENCES crl(id),
    serial_number TEXT,
    revoked_at TIMESTAMP,

    reason TEXT
);