INSERT INTO system_configs (
    name,
    key_algorithm,
    key_size,
    signature_algorithm,
    hash_algorithm,
    default_validity_days
)
VALUES (
    'default-rsa-2048',
    'RSA',
    2048,
    'SHA256WithRSA',
    'SHA-256',
    365
);