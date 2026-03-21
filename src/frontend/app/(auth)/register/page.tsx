"use client";
import Link from "next/link";
import { useState } from "react";

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
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-10">
                <div className="hidden md:block md:col-span-5">
                    <img
                        src="/sign_in.jpg"
                        alt="Sign up"
                        className="w-full h-full object-cover block"
                    />
                </div>

                <div className="col-span-1 md:col-span-5 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Đăng ký tài khoản
                        </h2>
                        <p className="text-lg text-slate-500 mt-2 font-medium">
                            Tạo tài khoản để truy cập hệ thống quản lý X.509
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Nguyễn Văn A"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fullName: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="name@example.com"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Tên đăng nhập"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        username: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-[0.98]">
                            Tạo tài khoản
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-slate-400 font-medium">
                                Hoặc
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Đăng ký bằng Google
                    </button>

                    <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                        Đã có tài khoản?{" "}
                        <Link
                            href="/login"
                            className="text-indigo-600 hover:underline font-bold"
                        >
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
