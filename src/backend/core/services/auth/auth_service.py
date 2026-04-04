import requests
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")


class AuthService:
    @staticmethod
    def login(username: str, password: str):
        url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"

        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "email": username,
            "password": password
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            return {
                "success": False,
                "error": response.json()
            }

        data = response.json()

        return {
            "success": True,
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "user": data.get("user")
        }