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

-- CREATE OR REPLACE FUNCTION log_audit()
-- RETURNS trigger AS $$
-- BEGIN
--     INSERT INTO audit_logs (actor_id, action, target_type, target_id)
--     VALUES (NULL, TG_OP, TG_TABLE_NAME, NEW.id::TEXT);
--     RETURN NEW;
-- END;
$$ LANGUAGE plpgsql;