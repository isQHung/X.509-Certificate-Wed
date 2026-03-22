CREATE TABLE crl (
    id UUID PRIMARY KEY,
    version INT,
    generated_at TIMESTAMP,
    next_update TIMESTAMP,

    crl_pem TEXT
);