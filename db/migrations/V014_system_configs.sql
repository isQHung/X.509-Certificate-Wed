CREATE TABLE system_configs(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    key_algorithm TEXT NOT NULL,
    key_size INT,
    signature_algorithm TEXT NOT NULL,
    hash_algorithm TEXT NOT NULL,
    default_validity_days INT NOT NULL
);