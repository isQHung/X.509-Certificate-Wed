# Tài liệu Tích hợp API (API Documentation)

**Base URL:** `/api/v1`
**Content-Type:** `application/json`

---

## 🔐 Headers

All APIs require:

- `Content-Type: application/json`
- `Authorization: Bearer <token>` _(nếu có authentication)_

---

## 1. Customer APIs (Người dùng / Khách hàng)

Các API xử lý yêu cầu liên quan đến Certificate Signing Request (CSR) và quản lý vòng đời chứng chỉ của người dùng.

---

### 1.1 Tạo yêu cầu cấp chứng thư (Create CSR)

- **Endpoint:** `/cert_request`
- **Method:** `POST`

#### Request Body

```json
{
  "user_id": "11111111-2222-3333-4444-555555555555",
  "csr_pem": "-----BEGIN CERTIFICATE REQUEST-----\nMIICtjCCAZ4C...\n-----END CERTIFICATE REQUEST-----",
  "subject": {
    "CN": "example.com",
    "O": "MyCompany",
    "C": "VN"
  }
}
```

#### Response

**Success (200):**

```json
{
  "message": "CSR created successfully",
  "request_id": "3f9971ed-78f4-4d89-8e0d-d1978d3ab945"
}
```

**Error (400):**

```json
{
  "error": "Invalid input data"
}
```

---

### 1.2 Hủy yêu cầu cấp chứng thư (Cancel CSR)

- **Endpoint:** `/cert_request/{req_id}/cancel`
- **Method:** `POST`

#### Path Parameters

- `req_id` (UUID): ID của yêu cầu CSR

#### Example

```bash
POST /api/v1/cert_request/123e4567-e89b-12d3-a456-426614174000/cancel
```

#### Response

**Success (200):**

```json
{
  "message": "CSR cancelled successfully",
  "request_id": "3f9971ed-78f4-4d89-8e0d-d1978d3ab945"
}
```

**Error (400):**

```json
{
  "error": "CSR not found"
}
```

---

### 1.3 Yêu cầu thu hồi chứng chỉ (Request Revocation)

API cho phép khách hàng chủ động báo mất Private Key hoặc yêu cầu thu hồi chứng chỉ của mình. Yêu cầu sẽ được chuyển sang trạng thái chờ Admin duyệt.

- **Endpoint:** `/user/revoke/{serial_number}/request`
- **Method:** `POST`

#### Path Parameters

- `serial_number` (String): Số Serial của chứng chỉ cần thu hồi.

#### Request Body

```json
{
  "reason": "Bị lộ Private Key"
}
```

#### Response

**Success (201):**

```json
{
  "success": true,
  "message": "Da gui yeu cau thu hoi cho chung chi ABC123456789 thanh cong. Vui long cho Admin duyet."
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "Chứng chỉ này hiện đang 'revoked', không thể gửi yêu cầu thu hồi."
}
```

---

### 1.4 Hủy yêu cầu thu hồi chứng chỉ (Cancel Revocation Request)

API cho phép khách hàng hủy bỏ đơn yêu cầu thu hồi chứng chỉ của mình (chỉ áp dụng khi đơn vẫn đang ở trạng thái chờ duyệt `pending`).

- **Endpoint:** `/user/revoke/{serial_number}/cancel`
- **Method:** `POST`

#### Path Parameters

- `serial_number` (String): Số Serial của chứng chỉ cần hủy đơn yêu cầu.

#### Example

```bash
POST /api/v1/user/revoke/ABC123456789/cancel
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Da huy yeu cau thu hoi cho chung chi ABC123456789 thanh cong."
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "Không tìm thấy yêu cầu thu hồi nào đang chờ duyệt cho Serial: ABC123456789"
}
```

---

## 2. Admin APIs (Quản trị viên)

Các API dành cho admin để quản lý và xử lý CSR cũng như các yêu cầu khác.

---

### 2.1 Danh sách yêu cầu chờ duyệt (List Pending CSRs)

- **Endpoint:** `/approve/list`
- **Method:** `GET`

#### Response

**Success (200):**

```json
[
  {
    "id": "858ef4ad-ada7-44e7-bf37-ca60a4f4d608",
    "user_id": "11111111-2222-3333-4444-555555555555",
    "status": "pending",
    "created_at": "Thu, 26 Mar 2026 07:18:58 GMT",
    "approved_at": null,
    "approved_by": null,
    "csr_pem": "",
    "san": null,
    "subject": {
      "CN": "Test Admin Approval"
    }
  },
  {
    "id": "3f9971ed-78f4-4d89-8e0d-d1978d3ab945",
    "user_id": "11111111-2222-3333-4444-555555555555",
    "status": "pending",
    "created_at": "Tue, 31 Mar 2026 13:51:37 GMT",
    "approved_at": null,
    "approved_by": null,
    "csr_pem": "...pem content...",
    "san": ["example.com", "www.example.com"],
    "subject": {
      "commonName": "example.com",
      "countryName": "VN",
      "organizationName": "MyCompany"
    }
  }
]
```

**Error (400):**

```json
{
  "error": "Something went wrong"
}
```

---

### 2.2 Phê duyệt yêu cầu (Approve CSR)

- **Endpoint:** `/approve/{id}/approve`
- **Method:** `POST`

#### Path Parameters

- `id` (UUID): ID của CSR

#### Example

```bash
POST /api/v1/approve/123e4567-e89b-12d3-a456-426614174000/approve
```

#### Response

**Success (200):**

```json
{
  "message": "CSR approved successfully",
  "serial": "ABC123456789"
}
```

**Error (400):**

```json
{
  "error": "CSR not found"
}
```

---

### 2.3 Từ chối yêu cầu (Reject CSR)

- **Endpoint:** `/approve/{id}/reject`
- **Method:** `POST`

#### Path Parameters

- `id` (UUID): ID của CSR

#### Example

```bash
POST /api/v1/approve/123e4567-e89b-12d3-a456-426614174000/reject
```

#### Response

**Success (200):**

```json
{
  "message": "CSR rejected"
}
```

**Error (400):**

```json
{
  "error": "CSR not found"
}
```

---

### 2.4 Tạo CRL mới (Generate CRL)

- **Endpoint:** `/crl`
- **Method:** `GET`

#### Mô tả luồng xử lý

- Lấy các bản ghi từ bảng `revocations`
- Chuyển các bản ghi này sang bảng `crl_entries` với `crl_id` mới
- Xóa các bản ghi đã chuyển trong `revocations`
- Lấy toàn bộ serial trong `crl_entries` để build CRL
- Ký CRL bằng CA key/cert và lưu vào bảng `crl`

#### Response

**Success (200):**

```json
{
  "crl": {
    "id": "8c3d6903-3eaa-4db9-bfcb-7f9024d14b77",
    "version": 1,
    "generated_at": "2026-04-01T16:25:22.124560+00:00",
    "next_update": "2026-04-02T16:25:22.124560+00:00",
    "crl_pem": "-----BEGIN X509 CRL-----\nMIIB...snip...\n-----END X509 CRL-----\n"
  },
  "revocations_moved": 3
}
```

**Error (400):**

```json
{
  "error": "No pending revocations to process"
}
```

---

## 3. Certificate Inspector APIs (Kiểm tra chứng chỉ)

Các API dành cho việc kiểm tra và phân tích chứng chỉ X.509 được tải lên.

---

### 3.1 Kiểm tra chứng chỉ (Inspect Certificate)

API cho phép người dùng tải lên một file chứng chỉ và nhận về thông tin chi tiết của chứng chỉ đó, bao gồm: số serial, subject, issuer, thời gian hiệu lực, và các extension.

- **Endpoint:** `/certificate/inspect`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

#### Request

**Form Data:**

- `certificate` (file): Tệp chứng chỉ X.509 (.crt, .pem, .cer, .der)
  - **Max size:** 1MB

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/v1/certificate/inspect \
  -F "certificate=@google-cert.crt"
```

#### Response

**Success (200):**

```json
{
  "serial": "372266101174506267343589765652916372903",
  "subject": {
    "commonName": "www.google.com",
    "organizationName": "Google LLC",
    "countryName": "US",
    "localityName": "Mountain View",
    "stateOrProvinceName": "CA"
  },
  "issuer": {
    "commonName": "GTS CA 1C3",
    "organizationName": "Google Trust Services LLC",
    "countryName": "US"
  },
  "validity": {
    "not_before": "2025-10-13T08:02:26+00:00",
    "not_after": "2026-01-11T08:02:25+00:00",
    "is_valid": true
  },
  "extensions": [
    {
      "name": "Basic Constraints",
      "critical": true,
      "value": {
        "ca": false,
        "path_length": null
      }
    },
    {
      "name": "Key Usage",
      "critical": true,
      "value": {
        "digital_signature": true,
        "content_commitment": false,
        "key_encipherment": true,
        "data_encipherment": false,
        "key_agreement": false,
        "key_cert_sign": false,
        "crl_sign": false,
        "encipher_only": false,
        "decipher_only": false
      }
    },
    {
      "name": "Subject Alternative Names",
      "critical": false,
      "value": [
        {
          "type": "DNS",
          "value": "www.google.com"
        },
        {
          "type": "DNS",
          "value": "google.com"
        }
      ]
    },
    {
      "name": "Authority Information Access",
      "critical": false,
      "value": [
        {
          "method": "caIssuers",
          "location": "http://pki.goog/repo/certs/gts1c3.der"
        },
        {
          "method": "OCSP",
          "location": "http://ocsp.pki.goog/gts1c3"
        }
      ]
    }
  ],
  "public_key_type": "RSAPublicKey"
}
```

**Error (400) - Invalid file type:**

```json
{
  "error": "Invalid file type. Accepted types: crt, pem, cer, der"
}
```

**Error (400) - File size exceeded:**

```json
{
  "error": "File size exceeds maximum allowed (1MB)"
}
```

**Error (400) - Invalid certificate:**

```json
{
  "error": "Invalid certificate format: [error details]"
}
```

**Error (500) - Server error:**

```json
{
  "error": "Failed to process certificate: [error details]"
}
```

---

## Field Descriptions

### Certificate Information Fields

- **serial**: Số serial của chứng chỉ (dạng thập phân)
- **subject**: Thông tin chủ thể (DN - Distinguished Name) của chứng chỉ
  - **commonName** (CN): Tên miền / Tên chủ thể
  - **organizationName** (O): Tên công ty / tổ chức
  - **organizationalUnitName** (OU): Tên bộ phận
  - **countryName** (C): Mã quốc gia (2 chữ cái)
  - **stateOrProvinceName** (ST): Tên tỉnh/bang
  - **localityName** (L): Tên thành phố
- **issuer**: Thông tin tổ chức phát hành chứng chỉ (DN format)
- **validity**: Thời gian hiệu lực
  - **not_before**: Thời điểm bắt đầu hiệu lực (ISO 8601)
  - **not_after**: Thời điểm hết hiệu lực (ISO 8601)
  - **is_valid**: Trạng thái hiện tại (true: hợp lệ, false: hết hạn)
- **extensions**: Danh sách các extension của chứng chỉ
  - **name**: Tên extension
  - **critical**: Có phải extension quan trọng (bắt buộc phải hiểu để sử dụng)
  - **value**: Nội dung extension (dạng khác nhau tùy extension)
- **public_key_type**: Loại thuật toán khóa công khai (RSAPublicKey, EllipticCurvePublicKey)

{
"error": "KEY_PATH_CA và CERT_PATH_CA phải được cấu hình"
}

````

**Error (500):**

```json
{
  "error": "Internal server error"
}
````

---

### 2.5 Lấy CRL mới nhất (Get Latest CRL)

- **Endpoint:** `/crl/latest`
- **Method:** `GET`

#### Response

**Success (200):**

```json
{
  "id": "8c3d6903-3eaa-4db9-bfcb-7f9024d14b77",
  "version": 1,
  "generated_at": "2026-04-01T16:25:22.124560+00:00",
  "next_update": "2026-04-02T16:25:22.124560+00:00",
  "crl_pem": "-----BEGIN X509 CRL-----\nMIIB...snip...\n-----END X509 CRL-----\n"
}
```

**Error (404):**

```json
{
  "error": "Chưa có CRL nào được tạo"
}
```

**Error (500):**

```json
{
  "error": "Internal server error"
}
```

---

### 2.6 Nhật ký hệ thống (Audit Logs)

- **Endpoint:** `/audit_logs/`
- **Method:** `GET`

#### Query Parameters (optional)

- `page` (int, default: 1)
- `limit` (int, default: 10, max: 100)
- `sort_by` (string, default: `created_at`) — one of: `id`, `created_at`, `action`, `target_type`, `target_id`, `actor_id`
- `sort_order` (`asc`|`desc`, default: `desc`)
- `actor_id` (uuid)
- `action` (string)
- `target_type` (string)
- `target_id` (string)
- `date_from` (ISO8601 datetime)
- `date_to` (ISO8601 datetime)

#### Response

**Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "actor_id": null,
      "action": "INSERT",
      "target_type": "certificates",
      "target_id": "8c3d6903-3eaa-4db9-bfcb-7f9024d14b77",
      "metadata": null,
      "created_at": "2026-04-01T16:25:22.124560+00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

**Error (400):**

```json
{
  "error": "Invalid UUID"
}
```

**Error (500):**

```json
{
  "error": "Internal server error"
}
```

---

## 📌 Ghi chú

### Trạng thái yêu cầu (Status)

- `pending`: Đang chờ duyệt
- `approved`: Đã được duyệt/cấp chứng thư
- `rejected`: Bị từ chối
- `cancelled`: Đã bị hủy bởi người dùng

---

## 🎯 Tổng kết

- Tất cả API trả về dữ liệu dạng JSON
- Status code chính:
  - `200`: Thành công (OK)
  - `201`: Tạo tài nguyên/yêu cầu thành công (Created)
  - `400`: Lỗi phía client, lỗi logic xử lý (Bad Request)
  - `500`: Lỗi hệ thống máy chủ (Internal Server Error)

---
