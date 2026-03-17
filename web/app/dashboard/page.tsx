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
          <p className="text-slate-500">Theo dõi và cấp phát chứng nhận số toàn hệ thống.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Cấu hình & Root (Mục A.3, A.4, A.5) */}
          <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-indigo-600 uppercase text-xs tracking-widest">Thiết lập gốc</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium">Thuật toán: <span className="text-slate-900">RSA-2048</span></p>
              <p className="text-sm font-medium">Root CA: <span className="text-green-600 font-bold">Đã phát hành</span></p>
            </div>
            <button className="w-full py-2 text-xs font-bold bg-slate-900 text-white rounded uppercase">Cấu hình thông số</button>
          </section>

          {/* Card 2: Phê duyệt (Mục A.6, A.7, A.9) */}
          <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-orange-600 uppercase text-xs tracking-widest">Yêu cầu chờ xử lý</h3>
            <div className="text-3xl font-black text-slate-900">05</div>
            <p className="text-xs text-slate-500 font-medium">Gồm yêu cầu cấp mới và yêu cầu thu hồi.</p>
            <button className="w-full py-2 text-xs font-bold bg-indigo-600 text-white rounded uppercase">Vào trang phê duyệt</button>
          </section>

          {/* Card 3: Danh sách thu hồi (Mục A.10) */}
          <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest">Trạng thái CRL</h3>
            <p className="text-sm font-medium">Bản cập nhật cuối: <span className="text-slate-900 font-bold text-xs font-mono">2026-03-17 20:00</span></p>
            <button className="w-full py-2 text-xs font-bold border border-slate-300 text-slate-600 rounded uppercase">Cập nhật CRL</button>
          </section>
        </div>

        {/* Nhật ký (Mục A.11) */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Nhật ký hoạt động gần đây</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 text-xs border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-mono">20:15:0{i}</span>
                <span className="font-bold text-slate-700 underline">Admin</span>
                <span className="text-slate-600">đã thay đổi độ dài khóa từ 1024 lên 2048.</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // GIAO DIỆN CUSTOMER
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Trung tâm Chứng chỉ</h2>
        <p className="text-slate-500">Quản lý các cặp khóa và yêu cầu ký chứng nhận số cá nhân.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mục B.4, B.5 */}
        <div className="p-8 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <h3 className="text-xl font-bold mb-2">Đăng ký chứng chỉ mới</h3>
          <p className="text-indigo-100 text-sm mb-6">Bắt đầu bằng cách tạo cặp khóa và gửi tệp CSR cho hệ thống.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-indigo-600 rounded font-bold text-sm">Tạo Key</button>
            <button className="px-4 py-2 bg-indigo-500 text-white rounded font-bold text-sm border border-indigo-400">Gửi CSR</button>
          </div>
        </div>

        {/* Mục B.6, B.7 */}
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chứng chỉ của bạn</h3>
          <div className="py-4 border-y border-slate-50 my-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Trạng thái:</span>
              <span className="text-orange-500 font-bold">Đang chờ duyệt (1)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đã cấp:</span>
              <span className="text-slate-900 font-bold">0</span>
            </div>
          </div>
          <button className="text-indigo-600 font-bold text-sm hover:underline italic">Xem chi tiết & Tải về →</button>
        </div>
      </div>
      
      {/* Mục B.8, B.9 */}
      <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <h4 className="text-sm font-bold text-slate-600 uppercase mb-4 tracking-widest">Tiện ích tra cứu</h4>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700">Tra cứu CRL Toàn hệ thống</button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700">Kiểm tra thông tin chứng chỉ lạ</button>
        </div>
      </div>
    </div>
  );
}