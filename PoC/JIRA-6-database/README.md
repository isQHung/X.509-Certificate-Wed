# PoC: JIRA-6 Thiết lập Database với Firebase Firestore

## 1. Mục tiêu (Objective)

Kiểm thử tính khả thi của việc sử dụng Firebase Firestore (NoSQL) thay thế cho PostgreSQL trong hệ thống PKI.
PoC này chứng minh việc kết nối database thành công và tự động khởi tạo các Collections cần thiết (`users`, `certificate_requests`, `audit_logs`).

## 2. Cấu trúc file trong PoC

- `db.py`: File cấu hình kết nối chuẩn, đóng vai trò như module database sẽ được tích hợp vào Backend Flask sau này.
- `poc_db_test.py`: Script giả lập các thao tác nghiệp vụ (Tạo user, nhận CSR, ghi log) để test thao tác Đọc/Ghi trên Firestore.
- `README.md`: Tài liệu hướng dẫn (chính là file này).

## 3. Yêu cầu môi trường (Prerequisites)

1. Python 3.8+
2. Cài đặt thư viện Firebase Admin SDK:
   ```bash
   pip install firebase-admin
   ```
