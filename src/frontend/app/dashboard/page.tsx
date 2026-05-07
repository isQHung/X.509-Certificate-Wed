"use client";
import CertificateUploader from "@/components/certificate/CertificateUploader";
import { createClient } from "@/lib/supabase";
import api from "@/lib/axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [role, setRole] = useState<string>(() =>
        (localStorage.getItem("userRole") || "CUSTOMER").toUpperCase(),
    );
    const [userId, setUserId] = useState<string>(() => (localStorage.getItem("userId") || ""));
    const [stats, setStats] = useState<any>(null);
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [certCount, setCertCount] = useState<number | null>(null);
    const [showUploader, setShowUploader] = useState(false);

    useEffect(() => {
        if (role === null) return;

        const supabase = createClient();

        const loadData = async () => {
            try {
                // Get current user (may be null for unauthenticated)
                // const { data: userData } = await supabase.auth.getUser();
                // const userId = userData?.user?.id || null;

                if (role === "ADMIN") {
                    // Count total requests (CSRs)
                    const { count: requestsCount } = await supabase
                        .from("certificate_requests")
                        .select("*", { count: "exact", head: true });

                    // Count total issued/imported certificates
                    const { count: certsCount } = await supabase
                        .from("certificates")
                        .select("*", { count: "exact", head: true });

                    const { count: waiting } = await supabase
                        .from("certificate_requests")
                        .select("*", { count: "exact", head: true })
                        .eq("status", "pending");

                    const { count: issued } = await supabase
                        .from("certificate_requests")
                        .select("*", { count: "exact", head: true })
                        .eq("status", "issued");

                    const { count: revoked } = await supabase
                        .from("certificates")
                        .select("*", { count: "exact", head: true })
                        .eq("status", "revoked");

                    setStats({
                        totalCSR: (requestsCount || 0) + (certsCount || 0),
                        waiting: waiting || 0,
                        issued: issued || 0,
                        revoked: revoked || 0,
                    });
                } else {
                    // CUSTOMER view
                    try {
                        const certResp = await api.get("/api/v1/certificates/my");
                        if (certResp.data && certResp.data.success) {
                            setCertCount(certResp.data.data.length);
                        } else {
                            setCertCount(0);
                        }
                    } catch (e) {
                        console.error("Lỗi khi tải số lượng chứng chỉ:", e);
                        setCertCount(0);
                    }

                    if (userId) {

                        const reqs = await api.get("/api/v1/cert_request/list");
                        console.log("hi")
                        setRecentRequests(reqs.data.list_csr || []);
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };

        loadData();
    }, [role]);

    const adminStats = stats
        ? [
              {
                  label: "Tổng CSR",
                  value: String(stats.totalCSR || 0),
                  color: "text-blue-600",
              },
              {
                  label: "Chờ duyệt",
                  value: String(stats.waiting || 0),
                  color: "text-orange-500",
              },
              {
                  label: "Đã cấp",
                  value: String(stats.issued || 0),
                  color: "text-green-600",
              },
              {
                  label: "Bị thu hồi",
                  value: String(stats.revoked || 0),
                  color: "text-red-600",
              },
          ]
        : [
              { label: "Tổng CSR", value: "—", color: "text-blue-600" },
              { label: "Chờ duyệt", value: "—", color: "text-orange-500" },
              { label: "Đã cấp", value: "—", color: "text-green-600" },
              { label: "Bị thu hồi", value: "—", color: "text-red-600" },
          ];

    // --- GIAO DIỆN ADMIN ---
    if (role === "ADMIN") {
        return (
            <div className="space-y-8">
                <header>
                    <h2 className="text-3xl font-bold text-slate-900">
                        Dashboard Quản trị
                    </h2>
                    <p className="text-slate-500">
                        Hệ thống giám sát thực thi PKI toàn cục.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {adminStats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {stat.label}
                            </p>
                            <p
                                className={`text-3xl font-black mt-2 ${stat.color}`}
                            >
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">
                            Thống kê cấp phát (7 ngày qua)
                        </h3>
                        <div className="flex items-end gap-4 h-48">
                            {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-indigo-500 rounded-t-lg"
                                    style={{ height: `${height}%` }}
                                />
                            ))}
                        </div>
                    </section> */}

                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800">
                            Trạng thái kỹ thuật
                        </h3>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Root CA:</span>
                                <span className="font-bold text-green-600">
                                    ONLINE
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Thuật toán:
                                </span>
                                <span className="font-bold font-mono">
                                    RSA-4096
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // --- GIAO DIỆN CUSTOMER ---
    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-900">
                    Trung tâm Chứng chỉ
                </h2>
                <p className="text-slate-500">
                    Quản lý định danh số và yêu cầu cấp phát cá nhân.
                </p>
            </header>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 flex justify-between items-center overflow-hidden relative">
                    <div className="relative z-10 space-y-4">
                        <h3 className="text-2xl font-bold">
                            Bạn cần chứng chỉ mới?
                        </h3>
                        <p className="text-indigo-100 text-sm max-w-sm">
                            Tạo cặp khóa bí mật và gửi yêu cầu CSR ngay để được
                            hệ thống phê duyệt.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                href="/dashboard/user/keys"
                                className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
                            >
                                Tạo khóa
                            </Link>
                            <Link
                                href="/dashboard/user/csr"
                                className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm border border-indigo-400 hover:bg-indigo-400 transition"
                            >
                                Gửi CSR
                            </Link>
                        </div>
                    </div>
                    <span className="text-9xl absolute -right-4 -bottom-4 opacity-20 select-none pointer-events-none">
                        🔐
                    </span>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                            Trạng thái
                        </p>
                        <h3 className="text-xl font-bold text-slate-900">
                            Chứng chỉ đang có
                        </h3>
                    </div>
                    <div className="text-4xl font-black text-indigo-600">
                        {certCount !== null
                            ? String(certCount).padStart(2, "0")
                            : "—"}
                    </div>
                    <Link
                        href="/dashboard/user/certificates"
                        className="text-sm font-bold text-indigo-600 hover:underline"
                    >
                        Xem danh sách →
                    </Link>
                </div>
            </div>

            {/* Recent Requests Table */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">
                        Yêu cầu cấp phát gần đây
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Mã CSR</th>
                                <th className="px-6 py-4">Common Name</th>
                                <th className="px-6 py-4">Ngày gửi</th>
                                <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100 text-slate-600">
                            {recentRequests.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 font-mono font-bold">
                                        —
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        —
                                    </td>
                                    <td className="px-6 py-4 text-xs">—</td>
                                    <td className="px-6 py-4">—</td>
                                </tr>
                            ) : (
                                recentRequests.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4 font-mono font-bold">
                                            {r.id}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">
                                            {r.common_name}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {new Date(
                                                r.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">
                                                {r.status || "UNKNOWN"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Utilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/dashboard/user/crl"
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4 hover:bg-slate-100 transition group"
                >
                    <span className="text-2xl">🔍</span>
                    <div>
                        <p className="text-sm font-bold text-slate-700">
                            Tra cứu CRL
                        </p>
                        <p className="text-xs text-slate-500">
                            Kiểm tra xem chứng chỉ có bị thu hồi không.
                        </p>
                    </div>
                </Link>
                <div
                    role="button"
                    onClick={() => setShowUploader(true)}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4 hover:bg-slate-100 transition cursor-pointer"
                >
                    <span className="text-2xl">📤</span>
                    <div>
                        <p className="text-sm font-bold text-slate-700">
                            Upload chứng chỉ khác
                        </p>
                        <p className="text-xs text-slate-500">
                            Tải lên chứng chỉ để kiểm tra thông tin.
                        </p>
                    </div>
                </div>
            </div>
            <CertificateUploader
                isOpen={showUploader}
                onClose={() => setShowUploader(false)}
            />
        </div>
    );
}
