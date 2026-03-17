import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8 text-blue-400">X.509 Manager</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block p-3 rounded hover:bg-slate-800 transition bg-slate-800">Tổng quan</Link>
          <Link href="#" className="block p-3 rounded hover:bg-slate-800 transition">Cấp chứng chỉ (CSR)</Link>
          <Link href="#" className="block p-3 rounded hover:bg-slate-800 transition">Danh sách thu hồi (CRL)</Link>
          <div className="pt-4 mt-4 border-t border-slate-700">
            <Link href="/" className="block p-3 rounded text-red-400 hover:bg-slate-800 transition">Đăng xuất</Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <span className="font-semibold text-slate-700">Hệ thống quản trị</span>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">AD</div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}