import pytest
from core.crypto.AES import CryptoService


# 1. Test encrypt -> decrypt
def test_encrypt_decrypt(monkeypatch):
    monkeypatch.setenv("MASTER_KEY", "my_secret_key")

    crypto = CryptoService()
    plaintext = "hello world"

    encrypted = crypto.encrypt(plaintext)
    decrypted = crypto.decrypt(encrypted)

    assert decrypted == plaintext


# 2. Test text rỗng
def test_empty_string(monkeypatch):
    monkeypatch.setenv("MASTER_KEY", "my_secret_key")

    crypto = CryptoService()
    plaintext = ""

    encrypted = crypto.encrypt(plaintext)
    decrypted = crypto.decrypt(encrypted)

    assert decrypted == plaintext


# 3. Test unicode (tiếng Việt)
def test_unicode(monkeypatch):
    monkeypatch.setenv("MASTER_KEY", "my_secret_key")

    crypto = CryptoService()
    plaintext = "Xin chào"

    encrypted = crypto.encrypt(plaintext)
    decrypted = crypto.decrypt(encrypted)

    assert decrypted == plaintext


# 4. Test encrypt 2 lần khác nhau ra cipher khác nhau
def test_encrypt_randomness(monkeypatch):
    monkeypatch.setenv("MASTER_KEY", "my_secret_key")

    crypto = CryptoService()
    plaintext = "same data"

    encrypted1 = crypto.encrypt(plaintext)
    encrypted2 = crypto.encrypt(plaintext)

    assert encrypted1 != encrypted2


# 5. Test thiếu MASTER_KEY
def test_missing_master_key(monkeypatch):
    monkeypatch.delenv("MASTER_KEY", raising=False)

    with pytest.raises(ValueError):
        CryptoService()