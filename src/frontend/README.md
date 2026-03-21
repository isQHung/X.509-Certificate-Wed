Để chạy được code: 
    cd src/frontend
    pnpm install
    .env.local tại thư mục src/frontend/ và copy đoạn code 
    pnpm dev

What was done:
    Tích hợp Firebase Client SDK (Auth) và Firebase Admin SDK (Verify JWT).

    Middleware bảo mật: Xây dựng Middleware tại src/frontend/middleware.ts để chặn Route dựa trên ID Token (JWT) và Role từ Cookie.

    RBAC (Role-Based Access Control): Phân quyền rõ rệt giữa ADMIN và CUSTOMER. Lưu trữ bền vững (Persistence) trên Firestore Database.

    Profile Management: Tính năng đổi mật khẩu yêu cầu xác thực lại mật khẩu cũ (Re-authentication) theo chuẩn bảo mật.

    Cấu trúc thư mục: Tổ chức lại code vào /lib (logic Firebase), /schema (định nghĩa interface) và Route Grouping (auth).

Testing:
    Case 1: Đăng ký & Persistence
        Bước 1: Truy cập /register, đăng ký một email mới (VD: test@gmail.com).

        Bước 2: Kiểm tra Firestore Collection users.

        Expected: Tài khoản được tạo thành công trên Auth và có bản ghi tương ứng trong Firestore với role mặc định là CUSTOMER
    
    Case 2: Kiểm tra trùng Email (Error 400)
        Bước 1: Dùng lại email test@gmail.com để đăng ký lần nữa.

        Expected: Hệ thống báo lỗi "400 Email already used" (Bắt lỗi auth/email-already-in-use).

    Case 3: Phân quyền API - Forbidden (403)
        Bước 1: Đăng nhập bằng tài khoản CUSTOMER. (1@1.com / 123456)

        Bước 2: Dùng Postman hoặc gọi trực tiếp API /api/admin/check (mở console trong F12).

        Expected: Trả về 403 Forbidden vì role không phải Admin

    Case 4: Phân quyền API - Success (200)
        Bước 1: Đăng nhập bằng tài khoản ADMIN (Email admin@admin.com). Pass: 123456

        Bước 2: Truy cập /dashboard/admin/users hoặc gọi API /api/admin/check (mở console trong F12).

        Expected: Trả về 200 OK và truy cập được giao diện quản lý.

    Case 5: Đổi mật khẩu (User Profile)
        Mục tiêu: Xác nhận người dùng có thể tự cập nhật mật khẩu an toàn.

        Các bước:

        Truy cập /dashboard/profile/change-password.

        Nhập mật khẩu hiện tại và mật khẩu mới (ít nhất 6 ký tự).

        Nhấn Cập nhật.

        Kết quả mong đợi: Hệ thống báo thành công. Đăng xuất và đăng nhập lại bằng mật khẩu mới thành công.

    Case 6: Cấp quyền người dùng (Admin Management)
        Mục tiêu: Xác nhận Admin có thể thay đổi quyền hạn (RBAC) của người dùng khác.

        Các bước:

        Đăng nhập tài khoản Admin, truy cập /dashboard/admin/users.

        Tìm một User đang là CUSTOMER, nhấn nút "Đổi thành Admin".

        Kiểm tra trực tiếp trên Firebase Firestore Console.

        Kết quả mong đợi: Trường role của User đó trong Firestore chuyển từ "CUSTOMER" sang "ADMIN".