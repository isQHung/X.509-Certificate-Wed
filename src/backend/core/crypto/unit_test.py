from AES import CryptoService

crypto = CryptoService()
ctext = crypto.encrypt("Hello World")
print("Ciphertext:", ctext)
ptext = crypto.decrypt(ctext)
print("Plaintext:", ptext)
