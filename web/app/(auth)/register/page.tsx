"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic PoC: Đăng ký xong tự động lưu role CUSTOMER và vào Dashboard
    localStorage.setItem("userRole", "CUSTOMER");
    localStorage.setItem("userName", formData.fullName);
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Đăng ký tài khoản</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label>
            <input 
              type="text" required
              className="w-full p-3 bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nguyễn Văn A"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email" required
              className="w-full p-3 bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="name@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
            <input 
              type="text" required
              className="w-full p-3 bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Username..."
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <input 
              type="password" required
              className="w-full p-3 bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition">
            Tạo tài khoản
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Đã có tài khoản? <Link href="/login" className="text-indigo-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}