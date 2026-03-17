import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

# 1. Khởi tạo kết nối với Firestore bằng Service Account
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("[+] Kết nối Firebase thành công!")
except Exception as e:
    print(f"[-] Lỗi kết nối Firebase: {e}")
    exit(1)

def run_database_poc():
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

    # Test 2: Tạo tài liệu trong collection 'certificate_requests' (Tự tạo ID)
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

    print("\n[+] Hoàn tất PoC! Bạn có thể lên Firebase Console để xem dữ liệu trực quan.")

if __name__ == '__main__':
    run_database_poc()