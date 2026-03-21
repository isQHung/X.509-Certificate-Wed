"use client";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "CUSTOMER");
  }, []);

  const adminMenu = [
    { name: "Cấu hình hệ thống", icon: "⚙️" },
    { name: "Quản lý Root CA", icon: "🔑" },
    { name: "Phê duyệt CSR", icon: "📑" },
    { name: "Danh sách Chứng nhận", icon: "📜" },
    { name: "Quản lý Thu hồi (CRL)", icon: "🚫" },
    { name: "Nhật ký hệ thống", icon: "📝" },
  ];

  const userMenu = [
    { name: "Chứng chỉ của tôi", icon: "👤" },
    { name: "Tạo cặp khóa cá nhân", icon: "🔐" },
    { name: "Gửi yêu cầu CSR", icon: "📨" },
    { name: "Tra cứu CRL hệ thống", icon: "🔍" },
    { name: "Upload chứng chỉ khác", icon: "📤" },
  ];

  const menu = role === "ADMIN" ? adminMenu : userMenu;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-black text-indigo-600 uppercase tracking-tighter">X.509 System</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Version 1.0 PoC</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-all">
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={() => window.location.href="/"} className="w-full p-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition">
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}