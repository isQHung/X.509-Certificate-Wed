CREATE FUNCTION revoke_certificate(cert_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE certificates
    SET status = 'revoked'
    WHERE id = cert_id;

    INSERT INTO revocations(id, certificate_id)
    VALUES (uuid_generate_v4(), cert_id);
END;
$$ LANGUAGE plpgsql;