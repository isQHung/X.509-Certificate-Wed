CREATE TRIGGER trg_audit_cert
AFTER INSERT OR UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION audit_log_insert();