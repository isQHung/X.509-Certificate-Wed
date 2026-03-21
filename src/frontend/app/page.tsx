import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-4 text-blue-600">
        X.509 Certificate
      </h1>
      <p className="max-w-[600px] text-slate-500 mb-8 text-lg">
        Hệ thống cho phép quản lý, cấp phát và thu hồi chứng nhận số theo tiêu chuẩn X.509 cho các dịch vụ bảo mật SSL.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
          Đăng nhập ngay
        </Link>
        <Link href="/register" className="px-6 py-3 border border-slate-300 rounded-lg font-bold hover:bg-slate-100 transition">
          Tạo tài khoản mới
        </Link>
      </div>
    </main>
  );
}