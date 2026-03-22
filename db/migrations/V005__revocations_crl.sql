CREATE TABLE revocations (
    id UUID PRIMARY KEY,

    certificate_id UUID REFERENCES certificates(id),
    serial_number TEXT NOT NULL,

    reason TEXT,
    revoked_at TIMESTAMP DEFAULT now(),

    UNIQUE(serial_number)
);

CREATE TABLE crl (
    id UUID PRIMARY KEY,
    version INT,
    generated_at TIMESTAMP,
    next_update TIMESTAMP,

    crl_pem TEXT
);

CREATE TABLE crl_entries (
    id UUID PRIMARY KEY,

    crl_id UUID REFERENCES crl(id),
    serial_number TEXT,
    revoked_at TIMESTAMP,

    reason TEXT
);

