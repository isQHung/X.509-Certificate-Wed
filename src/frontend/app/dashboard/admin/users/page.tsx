"use client";
import { createClient } from "@/lib/supabase";
import { UserAccount } from "@/schema/user.schema";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserAccount[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            const supabase = createClient();
            try {
                const { data: usersData, error: usersErr } = await supabase
                    .from("users")
                    .select("id,email,created_at")
                    .order("created_at", { ascending: false });

                if (usersErr || !usersData) {
                    throw usersErr || new Error("Failed to fetch users");
                }

                const { data: urData } = await supabase
                    .from("user_roles")
                    .select("user_id,role_id");

                const { data: rolesData } = await supabase
                    .from("roles")
                    .select("id,name");

                const items: UserAccount[] = usersData.map((u: any) => {
                    const userRoleRow = urData?.find(
                        (r: any) => r.user_id === u.id,
                    );
                    const roleName = userRoleRow
                        ? rolesData?.find(
                              (r: any) => r.id === userRoleRow.role_id,
                          )?.name
                        : null;

                    const createdAtStr = u.created_at
                        ? new Date(u.created_at).toISOString().slice(0, 10)
                        : "";

                    return {
                        uid: u.id,
                        email: u.email || "",
                        displayName: u.email ? u.email.split("@")[0] : "",
                        role:
                            roleName?.toUpperCase() === "ADMIN"
                                ? "ADMIN"
                                : "CUSTOMER",
                        createdAt: createdAtStr,
                    };
                });

                setUsers(items);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Hàm thay đổi Role
    const toggleRole = async (uid: string, currentRole: string) => {
        const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
        const supabase = createClient();
        try {
            // find role id
            const { data: rolesData } = await supabase
                .from("roles")
                .select("id,name");

            const adminRole = rolesData?.find(
                (r: any) => r.name?.toUpperCase() === "ADMIN",
            );
            const customerRole = rolesData?.find(
                (r: any) => r.name?.toUpperCase() === "CUSTOMER",
            );
            const newRoleId =
                newRole === "ADMIN" ? adminRole?.id : customerRole?.id;

            if (!newRoleId) throw new Error("Role not found");

            await supabase.from("user_roles").delete().eq("user_id", uid);
            await supabase
                .from("user_roles")
                .insert([{ user_id: uid, role_id: newRoleId }]);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.uid === uid ? { ...user, role: newRole } : user,
                ),
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
        }
    };

    if (!mounted) return null;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Quản lý người dùng
                </h1>
                <p className="text-slate-500 text-sm">
                    Cấp quyền (Role) và quản lý tài khoản hệ thống.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                                Người dùng
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                                Ngày tạo
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                                Vai trò
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.uid}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                            >
                                <td className="p-4">
                                    <div className="font-bold text-slate-900">
                                        {user.displayName}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {user.email}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {user.createdAt}
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            user.role === "ADMIN"
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() =>
                                            toggleRole(user.uid, user.role)
                                        }
                                        className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition"
                                    >
                                        Đổi thành{" "}
                                        {user.role === "ADMIN"
                                            ? "Customer"
                                            : "Admin"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
