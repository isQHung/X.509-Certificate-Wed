import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# 1. Khởi tạo kết nối với file JSON vừa tải
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Hàm thêm dữ liệu (Tự động tạo Collection nếu chưa có)
def seed_initial_data():
    # Tự động tạo collection 'users'
    users_ref = db.collection('users').document('admin_uid_123')
    users_ref.set({
        'email': 'admin@system.local',
        'role': 'Admin',
        'profile': {
            'common_name': 'PKI Root Admin',
            'organization': 'My Organization'
        }
    })
    
    # Tự động tạo collection 'certificates' (dữ liệu mẫu)
    cert_ref = db.collection('certificates').document('0001') # Serial Number làm ID
    cert_ref.set({
        'userId': 'admin_uid_123',
        'status': 'Active',
        'not_before': datetime.now(),
        'thumbprint': 'A1B2C3D4E5...',
        'raw_certificate': '-----BEGIN CERTIFICATE-----\nMIID... (Dữ liệu PEM giả)\n-----END CERTIFICATE-----'
    })
    
    print("Đã tạo xong dữ liệu mẫu và khởi tạo các Collections!")

# Chạy thử
if __name__ == '__main__':
    seed_initial_data()