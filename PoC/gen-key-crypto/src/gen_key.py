from fastapi import FastAPI
import subprocess
import time

start = time.perf_counter()
key = subprocess.run(["openssl", "genrsa", "2048"], capture_output=True, text=True)
end = time.perf_counter()
print(f"Key generation time: {end - start} seconds")

private_key = key.stdout


app = FastAPI()
@app.get("/generate-key")
def generate_key():
    return {"message": "Key generation completed", "key": private_key}
