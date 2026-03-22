CREATE OR REPLACE FUNCTION revoke_certificate(cert_uuid UUID, reason_text TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE certificates
    SET status = 'revoked'
    WHERE id = cert_uuid;

    INSERT INTO revocations (certificate_id, serial_number, reason)
    SELECT id, serial_number, reason_text
    FROM certificates
    WHERE id = cert_uuid;
END;
$$ LANGUAGE plpgsql;