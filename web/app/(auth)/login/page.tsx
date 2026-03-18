"use client";
import { useState } from "react";
import { MOCK_USERS } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);

    if (user) {
      // Lưu tạm role vào localStorage để Dashboard biết nên hiện giao diện nào
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      window.location.href = "/dashboard";
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Đăng nhập X.509</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full p-3 bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}