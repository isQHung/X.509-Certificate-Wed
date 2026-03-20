import os

master_key = os.urandom(32)
print(master_key.hex())
