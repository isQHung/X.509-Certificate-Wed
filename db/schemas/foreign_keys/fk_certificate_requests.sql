-- Foreign Keys for certificate_requests table
ALTER TABLE certificate_requests
ADD CONSTRAINT fk_certificate_requests_user_id FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE certificate_requests
ADD CONSTRAINT fk_certificate_requests_approved_by FOREIGN KEY (approved_by)
REFERENCES users(id) ON DELETE SET NULL;
