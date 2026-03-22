-- V006__revocations.sql
CREATE TABLE revocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL UNIQUE,

    reason TEXT,
    revoked_at TIMESTAMP DEFAULT now()
);