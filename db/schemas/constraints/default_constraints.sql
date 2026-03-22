ALTER TABLE certificates ADD CONSTRAINT unique_csr UNIQUE (csr_id);
