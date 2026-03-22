CREATE TABLE certificate_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    csr_pem TEXT NOT NULL,
    subject JSONB,
    san JSONB,

    status TEXT CHECK (
        status IN ('pending','approved','rejected','issued')
    ),

    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now()
);

