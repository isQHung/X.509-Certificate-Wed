-- Foreign Keys for key_pairs table
ALTER TABLE key_pairs
ADD CONSTRAINT fk_key_pairs_owner_id FOREIGN KEY (owner_id)
REFERENCES users(id) ON DELETE CASCADE;
