import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Lấy cookie từ request
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // 1. Nếu chưa đăng nhập mà cố vào /dashboard -> đuổi về /login
  if (!userRole && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Nếu đã đăng nhập mà cố vào lại /login hoặc /register -> đẩy vào /dashboard
  if (userRole && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Cấu hình các đường dẫn mà middleware sẽ quét qua
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};