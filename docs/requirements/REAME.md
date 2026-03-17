# MÔ TẢ ĐỒ ÁN

**Đề tài:** Tìm hiểu cấu trúc của chứng nhận số theo tiêu chuẩn X.509. Xây dựng hệ thống (Web / Desktop app) cho phép Quản lý và cấp phát các giấy chứng nhận số theo tiêu chuẩn X.509 cho các dịch vụ Website để thiết lập kênh truyền an toàn SSL.

Hệ thống gồm các nhóm người sử dụng chính:

## A. Nhóm người quản trị hệ thống (Admin)

Nhóm người dùng quản trị có các chức năng sau:

1. Đăng nhập hệ thống bằng tài khoản quản trị (username/password).
    
2. Đổi mật khẩu quản trị hệ thống.
    
3. Thiết lập thông số kỹ thuật chuẩn cho việc cấp phát chứng nhận (VD: Thuật toán Bất đối xứng, hàm băm mật mã, hiệu lực mặc định, độ dài khoá, ...).
    
4. Phát sinh cặp khoá Public key / Private key cho Root Certificate (level 0).
    
5. Phát sinh Root Certificate cho toàn hệ thống.
    
6. Từ chối việc yêu cầu cấp chứng nhận X.509 (cho B.5).
    
7. Phê duyệt và phát sinh chứng nhận X.509 (cho B.5).
    
8. Quản lý các chứng nhận đã cấp phát (revoke, renew).
    
9. Quản lý phê duyệt các yêu cầu thu hồi chứng nhận.
    
10. Cập nhật danh sách thu hồi chứng nhận (CRL).
    
11. Theo dõi nhật ký quá trình hoạt động chính của hệ thống.
    
## B. Nhóm khách hàng

Nhóm người dùng khách hàng là người có nhu cầu xin cấp phát các chứng nhận số theo tiêu chuẩn X.509 từ hệ thống này. Nhóm người dùng này có các chức năng sau:

1. Đăng ký tài khoản (username / password).
    
2. Đăng nhập hệ thống bằng tài khoản (username/password).
    
3. Đổi mật khẩu hệ thống.
    
4. Phát sinh **Các** cặp khoá Public key / Private key cho cá nhân.
    
5. Yêu cầu cấp phát Chứng nhận X.509 cho Website từ 1 cặp khoá của cá nhân đang sở hữu (lưu ý thông tin đăng ký chứng nhận theo tên miền Website) theo chuẩn CSR (Certificate Signing Request).
    
6. Xem danh sách yêu cầu cấp phát chứng nhận (trạng thái) và các chứng nhận đã được cấp phát cho cá nhân (theo dõi trạng thái, tải chứng nhận, ...).
    
7. Yêu cầu Thu hồi X.509 đã được cấp phát cho cá nhân.
    
8. Tra cứu danh sách thu hồi chứng nhận của toàn hệ thống.
    
9. Upload các chứng nhận khác (không thuộc cá nhân) để theo dõi và xem thông tin chứng nhận.
    
## C. Lưu ý

Các thông tin, dữ liệu nhạy cảm trong hệ thống cần phải được bảo vệ trước khi lưu trữ xuống hệ thống.
## D. Nộp đồ án

1. Mã nguồn của hệ thống (zip & Github link) – Nộp Moodle.
    
2. Dữ liệu của hệ thống (script, backup db) – Nộp Moodle.
    
3. Báo cáo kỹ thuật & hướng dẫn sử dụng (File Word nộp Moodle, In A4).
    
4. Video demo (upload youtube – unlisted) – Link để trong báo cáo.
    
5. Deadline nộp & Vấn đáp: Xem trên moodle.