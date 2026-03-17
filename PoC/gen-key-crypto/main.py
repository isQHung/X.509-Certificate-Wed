import httpx
import asyncio

async def call_service():
    async with httpx.AsyncClient() as client:
        res = await client.get("http://localhost:8000/generate-key")
        print(res.json())

asyncio.run(call_service())