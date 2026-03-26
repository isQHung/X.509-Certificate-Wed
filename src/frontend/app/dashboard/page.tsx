"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "CUSTOMER");
  }, []);

  if (role === "ADMIN") {
    return (
      <div className="space-y-8">
        <header>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Quản trị</h2>
          <p className="text-slate-500">Hệ thống giám sát thực thi PKI.</p>
        </header>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng CSR", value: "128", color: "text-blue-600" },
            { label: "Chờ duyệt", value: "05", color: "text-orange-500" },
            { label: "Đã cấp", value: "112", color: "text-green-600" },
            { label: "Bị thu hồi", value: "11", color: "text-red-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Biểu đồ giả lập bằng Tailwind */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Thống kê cấp phát (7 ngày qua)</h3>
            <div className="flex items-end gap-4 h-48">
              {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    style={{ height: `${height}%` }} 
                    className="w-full bg-indigo-500 rounded-t-lg hover:bg-indigo-600 transition-all cursor-pointer relative group"
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {height}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">T{i+2}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Trạng thái hệ thống */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Thông số kỹ thuật hiện tại</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Thuật toán mặc định</span>
                <span className="text-sm font-mono font-bold text-indigo-600">RSA-4096 / SHA-256</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Thời hạn chứng chỉ</span>
                <span className="text-sm font-bold text-slate-800">365 ngày (1 năm)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Root CA Status</span>
                <span className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Hoạt động
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Giao diện Customer giữ nguyên hoặc tùy chỉnh tương tự...
  return (<div>Giao diện Customer...</div>);
}