CREATE TABLE revocations (
    id UUID PRIMARY KEY,

    certificate_id UUID,
    serial_number TEXT NOT NULL,

    reason TEXT,
    revoked_at TIMESTAMP DEFAULT now(),

    UNIQUE(serial_number)
);
