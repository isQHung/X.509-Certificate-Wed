// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Đã đăng xuất thành công" },
    { status: 200 },
  );

  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", 
    path: "/",
    maxAge: 0,
  });

  return response;
}