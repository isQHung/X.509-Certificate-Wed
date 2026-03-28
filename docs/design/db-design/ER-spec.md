Ok, phần này rất quan trọng — tôi sẽ giải thích **từng field của từng table theo góc nhìn PKI thật**, không phải chỉ “cột lưu gì”.

---

# 1. `users`

```sql
id UUID PK
email TEXT
password_hash TEXT
status user_status
created_at TIMESTAMP
```

## Ý nghĩa

* **id**

  * định danh user
  * dùng làm FK khắp hệ thống (CSR, audit…)

* **email**

  * định danh đăng nhập
  * unique để tránh trùng identity

* **password_hash**

  * KHÔNG lưu password raw
  * dùng bcrypt/argon2

* **status**

  * `active` / `disabled`
  * disable user → không revoke quyền history

* **created_at**

  * phục vụ audit & compliance

---

# 2. `roles`

```sql
id SERIAL PK
name TEXT
```

## Ý nghĩa

* định nghĩa role:

  * admin
  * customer

👉 Dùng RBAC cơ bản

---

# 3. `user_roles`

```sql
user_id FK
role_id FK
```

## Ý nghĩa

* mapping many-to-many
* 1 user có thể:

  * vừa là admin
  * vừa là customer (nếu cần)

---

# 4. `certificate_requests` (CSR)

```sql
id UUID PK
user_id FK
csr_pem TEXT
subject JSONB
san JSONB
status csr_status
approved_by FK
approved_at TIMESTAMP
created_at TIMESTAMP
```

## Ý nghĩa PKI cực quan trọng

### csr_pem

* chứa CSR raw (PEM)
* dùng để:

  * verify signature
  * issue certificate

---

### subject (JSONB)

Ví dụ:

```json
{
  "CN": "example.com",
  "O": "Company",
  "C": "VN"
}
```

👉 parsed từ CSR

---

### san (Subject Alternative Name)

```json
["example.com", "www.example.com"]
```

👉 cực quan trọng với TLS hiện đại

---

### status

| trạng thái | ý nghĩa     |
| ---------- | ----------- |
| pending    | chờ duyệt   |
| approved   | admin duyệt |
| rejected   | từ chối     |
| issued     | đã cấp cert |

---

### approved_by / approved_at

* audit:

  * ai duyệt
  * khi nào

👉 bắt buộc trong CA thật

---

# 5. `certificates`

```sql
id UUID
serial_number TEXT
issuer_id UUID
subject JSONB
san JSONB
public_key TEXT
valid_from TIMESTAMP
valid_to TIMESTAMP
status cert_status
certificate_pem TEXT
csr_id UUID
created_at TIMESTAMP
```

## 🔥 Table quan trọng nhất

---

### serial_number

* unique trong CA
* dùng để:

  * revoke
  * CRL
  * OCSP

👉 PKI chuẩn dựa vào serial

---

### issuer_id

* self-reference
* cho phép:

  * Root CA
  * Intermediate CA

👉 build chain:

```
Root → Intermediate → Leaf
```

---

### subject / san

* giống CSR nhưng là final version

---

### public_key

* public key từ CSR
* dùng verify TLS handshake

---

### valid_from / valid_to

* thời hạn certificate

👉 enforce:

* hết hạn → invalid

---

### status

| status  | nghĩa      |
| ------- | ---------- |
| active  | đang dùng  |
| revoked | bị thu hồi |
| expired | hết hạn    |

---

### certificate_pem

* raw X.509

👉 dùng cho:

* download
* verify chain
* debug

---

### csr_id

* trace back CSR gốc

👉 audit cực quan trọng

---

# 6. `revocations`

```sql
id UUID
certificate_id FK
serial_number TEXT
reason TEXT
revoked_at TIMESTAMP
```

## Ý nghĩa

---

### certificate_id

* liên kết certificate

---

### serial_number

* duplicate để:

  * query nhanh
  * không join vẫn dùng được

👉 design chuẩn production

---

### reason

VD:

* key compromise
* cessation of operation

---

### revoked_at

* timestamp revoke

👉 dùng cho CRL

---

# 7. `crl`

```sql
id UUID
version INT
generated_at TIMESTAMP
next_update TIMESTAMP
crl_pem TEXT
```

## Ý nghĩa

---

### version

* version CRL

---

### generated_at

* thời điểm generate

---

### next_update

* client biết khi nào fetch CRL mới

👉 rất quan trọng theo chuẩn X.509

---

### crl_pem

* raw CRL đã ký

---

# 8. `crl_entries`

```sql
id UUID
crl_id FK
serial_number TEXT
revoked_at TIMESTAMP
reason TEXT
```

## Ý nghĩa

* snapshot của revocation tại thời điểm CRL

👉 KHÁC `revocations`:

| revocations     | crl_entries |
| --------------- | ----------- |
| realtime        | snapshot    |
| mutable (logic) | immutable   |

---

# 9. `key_pairs` (metadata)

```sql
id UUID
owner_id FK
key_type TEXT
key_size INT
fingerprint TEXT
created_at TIMESTAMP
```

## Ý nghĩa

👉 KHÔNG lưu private key

---

### key_type

* RSA / ECDSA

---

### key_size

* 2048 / 4096 / P-256

---

### fingerprint

* hash của public key

👉 dùng detect duplicate

---

# 10. `audit_logs` (cực quan trọng)

```sql
id BIGSERIAL
actor_id UUID
action TEXT
target_type TEXT
target_id TEXT
metadata JSONB
created_at TIMESTAMP
```

---

## Ý nghĩa

### actor_id

* ai thực hiện

---

### action

VD:

* CREATE_CSR
* APPROVE_CSR
* ISSUE_CERT
* REVOKE_CERT

---

### target_type

VD:

* certificate
* csr

---

### target_id

* id object bị tác động

---

### metadata

```json
{
  "ip": "1.2.3.4",
  "reason": "key compromised"
}
```

---

### created_at

* timestamp

---

## 🔥 IMPORTANT

* table này:

  * **append-only**
  * không update/delete

👉 phục vụ:

* compliance
* forensic
* audit

---

# 11. Tổng kết mapping PKI → DB

| PKI concept | Table                |
| ----------- | -------------------- |
| User        | users                |
| CSR         | certificate_requests |
| Certificate | certificates         |
| Revocation  | revocations          |
| CRL         | crl + crl_entries    |
| Key         | key_pairs            |
| Audit       | audit_logs           |

---

# 12. Insight quan trọng (level production)

## 🔐 Vì sao lưu cả serial_number ở nhiều bảng?

* tránh join
* tối ưu CRL/OCSP

---

## 🔐 Vì sao dùng JSONB cho subject?

* X.509 linh hoạt:

  * CN, O, OU, L…
* không nên hardcode column

---

## 🔐 Vì sao tách revocations vs CRL?

* revocation = event
* CRL = snapshot signed

---
# 📦 Fields của `revocation_requests`
```
| Field          | Vai trò             |
| -------------- | ------------------- |
| id             | định danh request   |
| certificate_id | cert bị revoke      |
| requested_by   | ai yêu cầu          |
| reason         | lý do               |
| status         | trạng thái workflow |
| approved_by    | ai duyệt            |
| approved_at    | khi nào duyệt       |
| created_at     | khi tạo request     |

```
## 🔹 `id`

* **Kiểu:** UUID (PK)
* **Ý nghĩa:**

  * định danh duy nhất cho mỗi yêu cầu thu hồi
* **Dùng để:**

  * tracking request
  * liên kết audit / API

---

## 🔹 `certificate_id`

* **Kiểu:** UUID (FK → certificates.id)
* **Ý nghĩa:**

  * certificate nào đang bị yêu cầu thu hồi
* **Dùng để:**

  * xác định target của revoke

---

## 🔹 `requested_by`

* **Kiểu:** UUID (FK → users.id)
* **Ý nghĩa:**

  * ai gửi yêu cầu thu hồi
* **Dùng để:**

  * audit
  * kiểm tra quyền (user có được revoke không)

---

## 🔹 `reason`

* **Kiểu:** TEXT
* **Ý nghĩa:**

  * lý do thu hồi

### Ví dụ:

```text
key_compromise
cessation_of_operation
superseded
```

👉 quan trọng cho:

* audit
* CRL (reason code)

---

## 🔹 `status`

* **Kiểu:** TEXT / ENUM

### Giá trị:

```text
pending   → chờ duyệt
approved  → đã duyệt
rejected  → bị từ chối
```

👉 đây là field điều khiển workflow

---

## 🔹 `approved_by`

* **Kiểu:** UUID (FK → users.id)
* **Ý nghĩa:**

  * admin nào đã duyệt request
* **Dùng để:**

  * audit
  * accountability

---

## 🔹 `approved_at`

* **Kiểu:** TIMESTAMP
* **Ý nghĩa:**

  * thời điểm request được duyệt
* **Dùng để:**

  * tracking timeline
  * điều tra sự cố

---

## 🔹 `created_at`

* **Kiểu:** TIMESTAMP
* **Ý nghĩa:**

  * thời điểm request được tạo
* **Dùng để:**

  * audit
  * đo thời gian xử lý

---

---

# 📦 Fields của `system_configs`

| Field                 | Vai trò             |
| --------------------- | ------------------- |
| id                    | định danh config    |
| name                  | tên cấu hình        |
| key_algorithm         | loại thuật toán key |
| key_size              | độ dài key          |
| signature_algorithm   | thuật toán ký       |
| hash_algorithm        | hàm băm             |
| default_validity_days | thời hạn cert       |

## 🔹 `id`

* **Kiểu:** UUID (PK)
* **Ý nghĩa:**

  * định danh duy nhất cho mỗi cấu hình hệ thống
* **Dùng để:**

  * tham chiếu từ các bảng khác (ví dụ CSR, certificate)
  * quản lý nhiều cấu hình song song

---

## 🔹 `name`

* **Kiểu:** TEXT (UNIQUE)
* **Ý nghĩa:**

  * tên của cấu hình (config profile)
* **Dùng để:**

  * phân biệt các cấu hình khác nhau
  * hiển thị trong UI / API

### Ví dụ:

```text
default-rsa-2048
high-security-4096
ecdsa-internal
```

---

## 🔹 `key_algorithm`

* **Kiểu:** TEXT
* **Ý nghĩa:**

  * thuật toán bất đối xứng dùng để tạo key pair

### Giá trị phổ biến:

```text
RSA
ECDSA
```

👉 dùng để:

* validate CSR
* enforce loại key được phép sử dụng

---

## 🔹 `key_size`

* **Kiểu:** INT (nullable)
* **Ý nghĩa:**

  * độ dài khóa (áp dụng cho RSA)

### Ví dụ:

```text
2048
4096
```

👉 dùng để:

* đảm bảo mức độ bảo mật tối thiểu

⚠️ nullable vì:

* nếu dùng ECDSA → dùng `curve` thay thế (không cần key_size)

---

## 🔹 `signature_algorithm`

* **Kiểu:** TEXT
* **Ý nghĩa:**

  * thuật toán CA dùng để ký certificate

### Ví dụ:

```text
SHA256WithRSA
ECDSAWithSHA256
```

👉 quyết định:

* cách tạo chữ ký số trong certificate

---

## 🔹 `hash_algorithm`

* **Kiểu:** TEXT
* **Ý nghĩa:**

  * hàm băm mật mã sử dụng trong quá trình ký

### Ví dụ:

```text
SHA-256
SHA-384
```

👉 dùng để:

* hash dữ liệu trước khi ký
* tạo fingerprint

---

## 🔹 `default_validity_days`

* **Kiểu:** INT
* **Ý nghĩa:**

  * thời hạn mặc định của certificate (tính theo ngày)

### Ví dụ:

```text
90
365
```

👉 dùng để:

* tính:

```text
valid_from → valid_to
```
---