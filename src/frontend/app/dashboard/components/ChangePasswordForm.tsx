"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageState = {
    type: "error" | "success";
    text: string;
} | null;

export default function ChangePasswordForm() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<MessageState>(null);

    const clearSessionState = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Ignore logout API failures here; local session cleanup still runs.
        }

        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({
                type: "error",
                text: "Mật khẩu mới và xác nhận không khớp.",
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        const email = localStorage.getItem("userEmail");
        if (!email) {
            setLoading(false);
            setMessage({
                type: "error",
                text: "Không tìm thấy email phiên đăng nhập. Vui lòng đăng nhập lại.",
            });
            return;
        }

        const supabase = createClient();

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: currentPassword,
            });

            if (signInError) {
                setMessage({
                    type: "error",
                    text: "Mật khẩu hiện tại không chính xác.",
                });
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                throw new Error(updateError.message || "Không thể cập nhật mật khẩu.");
            }

            await supabase.auth.signOut();
            await clearSessionState();

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage({
                type: "success",
                text: "Đổi mật khẩu thành công. Bạn sẽ được chuyển về trang đăng nhập.",
            });

            await new Promise((resolve) => window.setTimeout(resolve, 900));
            router.replace("/login");
        } catch (error: unknown) {
            const text = error instanceof Error ? error.message : "Đã xảy ra lỗi khi đổi mật khẩu.";
            setMessage({
                type: "error",
                text,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10 px-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Đổi mật khẩu
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
                    </p>
                </div>

                {message ? (
                    <div
                        className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                            message.type === "error"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                        {message.text}
                    </div>
                ) : null}

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Mật khẩu hiện tại
                        </label>
                        <input
                            type="password"
                            required
                            disabled={loading}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nhập mật khẩu cũ"
                            autoComplete="current-password"
                        />
                    </div>

                    <hr className="border-slate-50" />

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            required
                            disabled={loading}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            required
                            disabled={loading}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] ${
                            loading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-indigo-700"
                        }`}
                    >
                        {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}