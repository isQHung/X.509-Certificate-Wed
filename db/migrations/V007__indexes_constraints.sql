CREATE INDEX idx_csr_status ON certificate_requests(status);

CREATE INDEX idx_cert_serial ON certificates(serial_number);
ALTER TABLE certificates ADD CONSTRAINT unique_csr UNIQUE (csr_id);

CREATE INDEX idx_cert_status ON certificates(status);

CREATE INDEX idx_crl_serial ON crl_entries(serial_number);