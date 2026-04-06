import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { jwtVerify } from "jose";


const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "default_secret_key_for_local_dev",
);

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("session_token")?.value;

    // Lấy cookie từ request
    // const userRole = request.cookies.get("userRole")?.value;
    const { pathname } = request.nextUrl;

    let userRole: string | null = null;

    // 2. Nếu có token, tiến hành giải mã để lấy Role một cách an toàn
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        // Ép kiểu hoặc lấy trực tiếp role từ payload đã lưu lúc đăng nhập
        userRole = payload.role as string;
      } catch (error) {
        // Nếu token bị sửa đổi hoặc hết hạn, jwtVerify sẽ throw error
        // Lúc này coi như token không hợp lệ, userRole vẫn là null
        console.log("Token không hợp lệ hoặc đã hết hạn");
      }
    }

    // 1. Nếu chưa đăng nhập mà cố vào /dashboard -> đuổi về /login
    if (!userRole && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Nếu đã đăng nhập mà cố vào lại /login hoặc /register -> đẩy vào /dashboard
    if (userRole && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. Nếu role là CUSTOMER nhưng cố gắng vào trang admin -> chuyển về /dashboard
    if (userRole === "CUSTOMER" && pathname.startsWith("/dashboard/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// Cấu hình các đường dẫn mà middleware sẽ quét qua
export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
