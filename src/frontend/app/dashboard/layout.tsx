"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "CUSTOMER");
  }, []);

  const adminMenu = [
    { name: "Tổng quan", icon: "📊", path: "/dashboard" },
    { name: "Cấu hình hệ thống", icon: "⚙️", path: "/dashboard/admin/config" },
    { name: "Quản lý Root CA", icon: "🔑", path: "/dashboard/admin/root-ca" },
    { name: "Phê duyệt CSR", icon: "📑", path: "/dashboard/admin/csr" },
    { name: "Danh sách Chứng nhận", icon: "📜", path: "/dashboard/admin/certificates" },
    { name: "Quản lý Thu hồi (CRL)", icon: "🚫", path: "/dashboard/admin/crl" },
    { name: "Nhật ký hệ thống", icon: "📝", path: "/dashboard/admin/logs" },
  ];

  const userMenu = [
    { name: "Tổng quan", icon: "🏠", path: "/dashboard" },
    { name: "Chứng chỉ của tôi", icon: "👤", path: "/dashboard/user/certificates" },
    { name: "Tạo cặp khóa cá nhân", icon: "🔐", path: "/dashboard/user/keys" },
    { name: "Gửi yêu cầu CSR", icon: "📨", path: "/dashboard/user/csr" },
    { name: "Tra cứu CRL", icon: "🔍", path: "/dashboard/user/crl" },
  ];

  if (role === null) return <div className="min-h-screen bg-slate-50" />;

  const menu = role === "ADMIN" ? adminMenu : userMenu;

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userRole");
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200">
          <Link href="/dashboard" className="text-xl font-black text-indigo-600 uppercase tracking-tighter block">
            X.509 System
          </Link>
          {/* Subtitle thay đổi theo Role */}
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
            {role === "ADMIN" ? "Hệ thống Quản trị" : "Trung tâm người dùng"}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={idx} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  isActive 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="w-full p-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition text-left flex items-center gap-3">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}