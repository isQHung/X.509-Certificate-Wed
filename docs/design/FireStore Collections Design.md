**Collection** `user`:
`username` (String - Unique)

`password` (String - Hashed)

`role` (Admin / User)

`email` (String)

`created_at` (timestamp)


**Collection** `certificates`:

`serial_number` (String - Unique)

`owner_id` (Reference)

`status` (Active / Revoked / Expired)

`expires_at` (Timestamp)

`pem_data` (Text)

**Collection** `csr_requests`:

`status` (Pending / Approved / Rejected)

`csr_data` (Text)

`submitted_at` (Timestamp)

**Collection** `audit_log`:
`id` (String - Unique)

`user_id` (Reference)

`action` (String)

`entity_type` (String)

`entity_id` (Reference)

`details` (Text)

`created_at` (timestamp)

