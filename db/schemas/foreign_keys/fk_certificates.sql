-- Foreign Keys for certificates table
ALTER TABLE certificates
ADD CONSTRAINT fk_certificates_issuer_id FOREIGN KEY (issuer_id)
REFERENCES certificates(id) ON DELETE SET NULL;

ALTER TABLE certificates
ADD CONSTRAINT fk_certificates_csr_id FOREIGN KEY (csr_id)
REFERENCES certificate_requests(id) ON DELETE SET NULL;
