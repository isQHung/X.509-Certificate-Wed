-- V002__types.sql
CREATE TYPE user_status AS ENUM ('active','disabled');

CREATE TYPE cert_status AS ENUM ('active','revoked','expired');

CREATE TYPE csr_status AS ENUM (
    'pending','approved','rejected','issued'
);