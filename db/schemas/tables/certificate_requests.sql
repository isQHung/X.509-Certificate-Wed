CREATE TABLE certificate_requests (
    id UUID PRIMARY KEY,
    user_id UUID,
    
    csr_pem TEXT NOT NULL,
    subject JSONB,
    san JSONB,
    alias TEXT,
    key_algorithm TEXT DEFAULT 'RSA' CHECK (key_algorithm IN ('RSA', 'EC')),
    key_size INT DEFAULT 2048,
    validity_days INT DEFAULT 365 CHECK (validity_days BETWEEN 1 AND 3650),

    status TEXT CHECK (
        status IN ('pending','approved','rejected','issued')
    ),

    approved_by UUID,
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now()
);
