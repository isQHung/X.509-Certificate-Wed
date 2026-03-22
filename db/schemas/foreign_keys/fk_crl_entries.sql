-- Foreign Keys for crl_entries table
ALTER TABLE crl_entries
ADD CONSTRAINT fk_crl_entries_crl_id FOREIGN KEY (crl_id)
REFERENCES crl(id) ON DELETE CASCADE;
