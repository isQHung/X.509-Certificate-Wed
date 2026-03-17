"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setName(localStorage.getItem("userName") || "Người dùng");
  }, []);

  if (!role) return <p className="p-10">Đang kiểm tra quyền truy cập...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Chào mừng, {name}!</h1>
      <p className="text-slate-500 mb-8 font-medium">Vai trò: <span className="text-indigo-600">{role}</span></p>

      {role === "ADMIN" ? (
        /* GIAO DIỆN ADMIN */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Quản trị Root CA</h3>
            <p className="text-sm text-slate-600 mb-4">Cấu hình thuật toán, thời hạn và tạo mới Root Certificate cho hệ thống.</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold">Cấu hình hệ thống</button>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Phê duyệt yêu cầu (CSR)</h3>
            <p className="text-sm text-slate-600 mb-4">Hiện có 0 yêu cầu đang chờ phê duyệt từ khách hàng.</p>
            <button className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded text-sm font-bold">Xem danh sách</button>
          </div>
        </div>
      ) : (
        /* GIAO DIỆN KHÁCH HÀNG */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm text-indigo-900">
            <h3 className="font-bold text-lg mb-2">Xin cấp chứng chỉ mới</h3>
            <p className="text-sm mb-4">Tạo yêu cầu CSR để thiết lập kênh truyền an toàn SSL cho Website của bạn.</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold">Tạo CSR</button>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Chứng chỉ của tôi</h3>
            <p className="text-sm text-slate-600 mb-4">Bạn chưa sở hữu chứng chỉ nào. Sau khi được Admin duyệt, chứng chỉ sẽ hiện ở đây.</p>
            <button className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded text-sm font-bold">Lịch sử yêu cầu</button>
          </div>
        </div>
      )}
    </div>
  );
}