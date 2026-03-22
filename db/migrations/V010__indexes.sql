-- V010__indexes.sql
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_csr_status ON certificate_requests(status);

CREATE INDEX idx_cert_serial ON certificates(serial_number);
CREATE INDEX idx_cert_status ON certificates(status);

CREATE INDEX idx_revocation_serial ON revocations(serial_number);

CREATE INDEX idx_crl_serial ON crl_entries(serial_number);

CREATE INDEX idx_audit_created ON audit_logs(created_at);