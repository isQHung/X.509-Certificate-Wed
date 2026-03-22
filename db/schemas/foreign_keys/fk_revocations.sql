-- Foreign Keys for revocations table
ALTER TABLE revocations
ADD CONSTRAINT fk_revocations_certificate_id FOREIGN KEY (certificate_id)
REFERENCES certificates(id) ON DELETE CASCADE;
