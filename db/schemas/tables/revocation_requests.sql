CREATE TABLE revocation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    certificate_id UUID REFERENCES certificates(id),

    requested_by UUID REFERENCES users(id),

    reason TEXT,

    status TEXT DEFAULT 'pending', -- pending / approved / rejected

    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now()
);