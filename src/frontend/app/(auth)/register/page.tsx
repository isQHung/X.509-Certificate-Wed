"use client";
import { createClient } from "@/lib/supabase";
import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
    });

    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();

        try {
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                    },
                });

            if (authError) throw authError;
            const user = authData?.user;

            if (user) {
                const { error: userError } = await supabase
                    .from("users")
                    .insert([
                        {
                            id: user.id,
                            email: user.email,
                            password_hash: "",
                            status: "active",
                            created_at: new Date().toISOString(),
                        },
                    ]);

                if (userError) {
                    console.error("Lỗi insert bảng users:", userError);
                    throw new Error(
                        "Không thể tạo thông tin người dùng trong cơ sở dữ liệu.",
                    );
                }

                const { data: role, error: roleFetchError } = await supabase
                    .from("roles")
                    .select("id")
                    .ilike("name", "customer")
                    .single();

                if (roleFetchError || !role) {
                    console.error("Lỗi lấy Role:", roleFetchError);
                    throw new Error(
                        "Không tìm thấy vai trò người dùng mặc định.",
                    );
                }

                const { error: userRoleError } = await supabase
                    .from("user_roles")
                    .insert([{ user_id: user.id, role_id: role.id }]);

                if (userRoleError) {
                    console.error("Lỗi insert bảng user_roles:", userRoleError);
                    throw new Error("Không thể cấp quyền cho người dùng.");
                }

                Cookies.set("userRole", "CUSTOMER", { expires: 1 });
                Cookies.set("userName", formData.fullName, { expires: 1 });
                localStorage.setItem("userRole", "CUSTOMER");
                localStorage.setItem("userName", formData.fullName);

                window.location.href = "/dashboard";
            }
        } catch (error: any) {
            const errorMsg = error.message || String(error);
            if (errorMsg.toLowerCase().includes("already used")) {
                alert("Email đã được sử dụng. Vui lòng chọn email khác.");
            } else {
                alert("Đăng ký thất bại: " + errorMsg);
            }
        }
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
