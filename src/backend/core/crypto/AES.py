import os
import base64
from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes

load_dotenv()  

class CryptoService:
    def __init__(self):
        #lấy master key từ env
        self.master_key_str = os.getenv("MASTER_KEY")
        if not self.master_key_str:
            raise ValueError("MASTER_KEY không được tìm thấy trong biến môi trường!")
        
        #chuẩn hóa master key thành 32 bytes
        digest = hashes.Hash(hashes.SHA256())
        digest.update(self.master_key_str.encode())
        self.key = digest.finalize()
        
        self.aesgcm = AESGCM(self.key)

    def encrypt(self, plain_text: str) -> str:
        nonce = os.urandom(12)  
        data = plain_text.encode()
        
        ciphertext = self.aesgcm.encrypt(nonce, data, None)
        
        #Lưu nonce và ciphertext, chuyển từ bytes Base64 thành string
        return base64.b64encode(nonce + ciphertext).decode('utf-8')

    def decrypt(self, encrypted_text: str) -> str:
        #giải mã Base64, chuyển lại thành bytes
        decoded_data = base64.b64decode(encrypted_text)
        
        #tách nonce và ciphertext
        nonce = decoded_data[:12]
        ciphertext = decoded_data[12:]
        
        decrypted_data = self.aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted_data.decode('utf-8')
    
    