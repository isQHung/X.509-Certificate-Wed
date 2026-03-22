CREATE TABLE certificates (
    id UUID PRIMARY KEY,

    serial_number TEXT UNIQUE NOT NULL,
    issuer_id UUID REFERENCES certificates(id), -- self for root

    subject JSONB,
    san JSONB,

    public_key TEXT NOT NULL,

    valid_from TIMESTAMP,
    valid_to TIMESTAMP,

    status TEXT CHECK (
        status IN ('active','revoked','expired')
    ),

    certificate_pem TEXT NOT NULL,

    csr_id UUID REFERENCES certificate_requests(id),

    created_at TIMESTAMP DEFAULT now()
);

