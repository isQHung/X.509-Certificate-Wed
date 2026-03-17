from datetime import datetime, timezone
# Import biến db từ file db.py cùng thư mục
from db import db

def run_database_poc():
    # Kiểm tra xem db có khởi tạo thành công từ file db.py không
    if db is None:
        print("[-] Dừng chạy test vì không kết nối được database.")
        return

    print("[*] Bắt đầu chạy test các collections...\n")

    # Test 1: Tạo tài liệu trong collection 'users'
    print("[*] Đang ghi dữ liệu vào collection 'users'...")
    user_id = 'admin_poc_001'
    db.collection('users').document(user_id).set({
        'email': 'admin@pkisystem.local',
        'role': 'Admin',
        'profile': {
            'common_name': 'Root Administrator',
            'organization': 'SecTeam'
        }
    })

    # Test 2: Tạo tài liệu trong collection 'certificate_requests'
    print("[*] Đang ghi dữ liệu vào collection 'certificate_requests'...")
    csr_ref = db.collection('certificate_requests').document()
    csr_ref.set({
        'userId': user_id,
        'subject': {'common_name': 'test.example.com'},
        'raw_data': '-----BEGIN CERTIFICATE REQUEST-----\nMIIB... (Dummy Data)\n-----END CERTIFICATE REQUEST-----',
        'status': 'Pending',
        'createdAt': datetime.now(timezone.utc)
    })

    # Test 3: Ghi log vào collection 'audit_logs'
    print("[*] Đang ghi dữ liệu vào collection 'audit_logs'...")
    db.collection('audit_logs').document().set({
        'action': 'CREATE_CSR',
        'actorId': user_id,
        'targetResource': csr_ref.id,
        'timestamp': datetime.now(timezone.utc),
        'details': 'Người dùng gửi yêu cầu cấp chứng chỉ mới cho test.example.com'
    })

    # Test 4: Đọc thử dữ liệu vừa ghi để kiểm tra
    print("\n[*] Đang đọc lại dữ liệu User từ database...")
    user_doc = db.collection('users').document(user_id).get()
    if user_doc.exists:
        print(f"    -> Dữ liệu lấy về: {user_doc.to_dict()}")

    print("\n[+] Hoàn tất PoC! Bạn có thể lên Firebase Console để xem dữ liệu.")

if __name__ == '__main__':
    run_database_poc()