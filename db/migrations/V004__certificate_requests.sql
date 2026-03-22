-- V004__certificate_requests.sql
CREATE TABLE certificate_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    csr_pem TEXT NOT NULL,
    subject JSONB,
    san JSONB,

    status csr_status DEFAULT 'pending',

    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now()
);