-- V013__seed_roles.sql
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('customer') ON CONFLICT DO NOTHING;