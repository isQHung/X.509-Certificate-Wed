-- V012__triggers.sql
CREATE OR REPLACE FUNCTION prevent_update_delete()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_delete
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_update_delete();

CREATE OR REPLACE FUNCTION log_audit()
RETURNS trigger AS $$
BEGIN
    INSERT INTO audit_logs (actor_id, action, target_type, target_id)
    VALUES (NULL, TG_OP, TG_TABLE_NAME, NEW.id::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_certificates
AFTER INSERT OR UPDATE ON certificates
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_crl
AFTER INSERT OR UPDATE ON crl
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_revocations
AFTER INSERT OR UPDATE ON revocations
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_revocation_requests
AFTER INSERT OR UPDATE ON revocation_requests
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_system_configs
AFTER INSERT OR UPDATE ON system_configs
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_certificate_requests
AFTER INSERT OR UPDATE ON certificate_requests
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_key_pairs
AFTER INSERT OR UPDATE ON key_pairs
FOR EACH ROW EXECUTE FUNCTION log_audit();