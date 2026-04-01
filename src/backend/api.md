# Tài liệu Tích hợp API (API Documentation)

**Base URL:** `/api/v1`
**Content-Type:** `application/json`

---

## 🔐 Headers

All APIs require:

* `Content-Type: application/json`
* `Authorization: Bearer <token>` *(nếu có authentication)*

---

## 1. Customer APIs (Người dùng / Khách hàng)

Các API xử lý yêu cầu liên quan đến Certificate Signing Request (CSR).

---

### 1.1 Tạo yêu cầu cấp chứng thư (Create CSR)

* **Endpoint:** `/cert_request`
* **Method:** `POST`

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

* **Endpoint:** `/cert_request/{req_id}/cancel`
* **Method:** `POST`

#### Path Parameters

* `req_id` (UUID): ID của yêu cầu CSR

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

## 2. Admin APIs (Quản trị viên)

Các API dành cho admin để quản lý và xử lý CSR.

---

### 2.1 Danh sách yêu cầu chờ duyệt (List Pending CSRs)

* **Endpoint:** `/approve/list`
* **Method:** `GET`

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
    "san": [
      "example.com",
      "www.example.com"
    ],
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

* **Endpoint:** `/approve/{id}/approve`
* **Method:** `POST`

#### Path Parameters

* `id` (UUID): ID của CSR

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

* **Endpoint:** `/approve/{id}/reject`
* **Method:** `POST`

#### Path Parameters

* `id` (UUID): ID của CSR

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

## 📌 Ghi chú

### Trạng thái CSR (CSR Status)

* `pending`: Đang chờ duyệt
* `approved`: Đã được cấp chứng thư
* `rejected`: Bị từ chối
* `cancelled`: Đã bị hủy

---

## 🎯 Tổng kết

* Tất cả API trả về dữ liệu dạng JSON
* Status code chính:

  * `200`: Thành công
  * `400`: Lỗi phía client hoặc xử lý

---
