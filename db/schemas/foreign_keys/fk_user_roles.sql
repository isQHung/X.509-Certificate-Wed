-- Foreign Keys for user_roles table
ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id)
REFERENCES roles(id) ON DELETE CASCADE;
