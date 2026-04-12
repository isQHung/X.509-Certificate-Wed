-- V018__cert_request_options.sql
ALTER TABLE certificate_requests
ADD COLUMN IF NOT EXISTS alias TEXT,
ADD COLUMN IF NOT EXISTS key_algorithm TEXT NOT NULL DEFAULT 'RSA',
ADD COLUMN IF NOT EXISTS key_size INT NOT NULL DEFAULT 2048,
ADD COLUMN IF NOT EXISTS validity_days INT NOT NULL DEFAULT 365;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'chk_certificate_requests_key_algorithm'
	) THEN
		ALTER TABLE certificate_requests
		ADD CONSTRAINT chk_certificate_requests_key_algorithm
		CHECK (key_algorithm IN ('RSA', 'EC'));
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'chk_certificate_requests_validity_days'
	) THEN
		ALTER TABLE certificate_requests
		ADD CONSTRAINT chk_certificate_requests_validity_days
		CHECK (validity_days BETWEEN 1 AND 3650);
	END IF;
END $$;