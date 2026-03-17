import firebase_admin
from firebase_admin import credentials, firestore

# LƯU Ý: Đảm bảo file serviceAccountKey.json nằm ở thư mục ngoài cùng và đã được đưa vào .gitignore
CREDENTIAL_PATH = "../../serviceAccountKey.json" 

def initialize_db():
    """Khởi tạo kết nối với Firebase Firestore"""
    try:
        # Kiểm tra xem app đã được khởi tạo chưa để tránh lỗi khi gọi nhiều lần
        if not firebase_admin._apps:
            cred = credentials.Certificate(CREDENTIAL_PATH)
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print("[+] Kết nối Firestore thành công từ db.py!")
        return db
    except Exception as e:
        print(f"[-] Lỗi kết nối Firestore: {e}")
        return None

# Export biến db để các file khác (như models.py hoặc poc_db_test.py) có thể import vào dùng
db = initialize_db()