-- V005__certificates.sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    serial_number TEXT UNIQUE NOT NULL,
    issuer_id UUID REFERENCES certificates(id),

    subject JSONB,
    san JSONB,

    public_key TEXT NOT NULL,

    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,

    status cert_status DEFAULT 'active',

    certificate_pem TEXT NOT NULL,

    csr_id UUID REFERENCES certificate_requests(id),

    created_at TIMESTAMP DEFAULT now()
);