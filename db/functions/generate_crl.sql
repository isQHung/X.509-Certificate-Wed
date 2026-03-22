CREATE OR REPLACE FUNCTION generate_crl()
RETURNS VOID AS $$
DECLARE
    new_crl_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO crl (id, version, generated_at, next_update, crl_pem)
    VALUES (new_crl_id, 1, now(), now() + interval '1 day', 'CRL_PLACEHOLDER');

    INSERT INTO crl_entries (crl_id, serial_number, revoked_at, reason)
    SELECT new_crl_id, serial_number, revoked_at, reason
    FROM revocations;
END;
$$ LANGUAGE plpgsql;