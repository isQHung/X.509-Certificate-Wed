"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;

    if (user && user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPassword);
        
        alert("Thành công! Mật khẩu đã được cập nhật bảo mật.");
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error: any) {
        let message = "Có lỗi xảy ra";
        if (error.code === "auth/wrong-password") message = "Mật khẩu hiện tại không chính xác!";
        if (error.code === "auth/weak-password") message = "Mật khẩu mới quá yếu (ít nhất 6 ký tự)!";
        alert("Lỗi: " + message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Bảo mật tài khoản</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">Thay đổi mật khẩu để bảo vệ thông tin cá nhân.</p>
        
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
            <input 
              type="password" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu cũ"
            />
          </div>

          <hr className="border-slate-50" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
            <input 
              type="password" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
            <input 
              type="password" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          
          <button 
            disabled={loading}
            className={`w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}