-- V007__crl.sql
CREATE TABLE crl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INT NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    next_update TIMESTAMP NOT NULL,
    crl_pem TEXT NOT NULL
);

CREATE TABLE crl_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    crl_id UUID REFERENCES crl(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL,

    revoked_at TIMESTAMP,
    reason TEXT
);