-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================
-- This file contains all foreign key definitions separated from table creation
-- to allow for flexible schema ordering and easier maintenance

-- user_roles table FK constraints
ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id)
REFERENCES roles(id) ON DELETE CASCADE;

-- certificate_requests table FK constraints
ALTER TABLE certificate_requests
ADD CONSTRAINT fk_certificate_requests_user_id FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE certificate_requests
ADD CONSTRAINT fk_certificate_requests_approved_by FOREIGN KEY (approved_by)
REFERENCES users(id) ON DELETE SET NULL;

-- certificates table FK constraints
ALTER TABLE certificates
ADD CONSTRAINT fk_certificates_issuer_id FOREIGN KEY (issuer_id)
REFERENCES certificates(id) ON DELETE SET NULL;

ALTER TABLE certificates
ADD CONSTRAINT fk_certificates_csr_id FOREIGN KEY (csr_id)
REFERENCES certificate_requests(id) ON DELETE SET NULL;

-- revocations table FK constraints
ALTER TABLE revocations
ADD CONSTRAINT fk_revocations_certificate_id FOREIGN KEY (certificate_id)
REFERENCES certificates(id) ON DELETE CASCADE;

-- crl_entries table FK constraints
ALTER TABLE crl_entries
ADD CONSTRAINT fk_crl_entries_crl_id FOREIGN KEY (crl_id)
REFERENCES crl(id) ON DELETE CASCADE;

-- key_pairs table FK constraints
ALTER TABLE key_pairs
ADD CONSTRAINT fk_key_pairs_owner_id FOREIGN KEY (owner_id)
REFERENCES users(id) ON DELETE CASCADE;
