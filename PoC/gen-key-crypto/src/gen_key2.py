from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from fastapi import FastAPI
import time

start = time.perf_counter()

key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)
pem = key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

end = time.perf_counter()
print(f"Key generation time: {end - start} seconds")

private_key = pem.decode()

app = FastAPI()
@app.get("/generate-key")
def generate_key():
    return {"message": "Key generation completed", "key": private_key}
