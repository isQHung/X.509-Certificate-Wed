"use client";
import { useLoading } from "@/context/LoadingContext";
import { createCSR } from "@/lib/api/client";
import { useApi } from "@/lib/useApi";
import { useState } from "react";

export default function UserCSRPage() {
    const [keyId, setKeyId] = useState("");
    const [cn, setCn] = useState("");
    const [org, setOrg] = useState("");
    const { call } = useApi();
    const { loading } = useLoading();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            user_id: keyId || "",
            csr_pem:
                "-----BEGIN CERTIFICATE REQUEST-----\n...demo-csr...\n-----END CERTIFICATE REQUEST-----",
            subject: { CN: cn, O: org, C: "VN" },
        };

        try {
            await call(createCSR, payload);
            setCn("");
            setOrg("");
        } catch (err) {
            // handled by useApi
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">
                    Gửi yêu cầu CSR
                </h1>
                <p className="text-sm text-slate-500">
                    Tạo yêu cầu ký chứng chỉ bằng cặp khóa bạn đang sở hữu.
                </p>
            </header>

            <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Chọn khóa sử dụng
                            </label>
                            <select
                                value={keyId}
                                onChange={(e) => setKeyId(e.target.value)}
                                className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                            >
                                <option value="">-- Chọn khóa --</option>
                                <option value="11111111-2222-3333-4444-555555555555">
                                    Demo Key 1
                                </option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Tên miền (Common Name)
                            </label>
                            <input
                                value={cn}
                                onChange={(e) => setCn(e.target.value)}
                                type="text"
                                placeholder="Ví dụ: example.com"
                                className="w-full p-2.5 border rounded-xl text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                            Thông tin tổ chức (Organization)
                        </label>
                        <input
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            type="text"
                            placeholder="Ví dụ: Đại học Bách Khoa"
                            className="w-full p-2.5 border rounded-xl text-sm"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition disabled:opacity-60"
                    >
                        {loading ? "Đang gửi..." : "Tạo và gửi yêu cầu CSR"}
                    </button>
                </form>
            </div>
        </div>
    );
}
