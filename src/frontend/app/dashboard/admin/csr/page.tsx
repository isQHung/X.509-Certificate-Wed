"use client";
import { useLoading } from "@/context/LoadingContext";
import { approveCSR, listPendingCSRs, rejectCSR } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { useEffect, useState } from "react";

export default function CSRApprovalPage() {
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const { call } = useApi();
    const { loading } = useLoading();

    const fetchList = async () => {
        try {
            const data = await call(listPendingCSRs);
            setPendingRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            // handled by useApi
        }
    };

    useEffect(() => {
        void fetchList();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await call(approveCSR, id);
            setPendingRequests((s) => s.filter((r) => r.id !== id));
        } catch (err) {}
    };

    const handleReject = async (id: string) => {
        try {
            await call(rejectCSR, id);
            setPendingRequests((s) => s.filter((r) => r.id !== id));
        } catch (err) {}
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">
                    Phê duyệt CSR
                </h1>
                <p className="text-sm text-slate-500">
                    Xem xét và ký duyệt các yêu cầu cấp chứng chỉ mới.
                </p>
            </header>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                                Mã yêu cầu
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                                Người gửi
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                                Thông tin (Subject)
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingRequests.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-6 text-center text-sm text-slate-500"
                                >
                                    Không có yêu cầu nào.
                                </td>
                            </tr>
                        )}
                        {pendingRequests.map((req) => (
                            <tr
                                key={req.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="p-4 text-sm font-mono text-indigo-600">
                                    {req.id}
                                </td>
                                <td className="p-4 text-sm text-slate-700">
                                    {req.user_id || req.user || "-"}
                                </td>
                                <td className="p-4 text-sm text-slate-500">
                                    {req.subject?.commonName ||
                                        req.subject?.CN ||
                                        JSON.stringify(req.subject)}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        disabled={loading}
                                        onClick={() =>
                                            void handleApprove(req.id)
                                        }
                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 disabled:opacity-60"
                                    >
                                        Duyệt & Ký
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={() =>
                                            void handleReject(req.id)
                                        }
                                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 disabled:opacity-60"
                                    >
                                        Từ chối
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
