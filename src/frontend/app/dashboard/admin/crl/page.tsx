"use client";
import { generateCRL, getLatestCRL } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

export default function CRLManagementPage() {
    const [crl, setCrl] = useState<any | null>(null);
    const [revocations, setRevocations] = useState<any[]>([]);
    const { call } = useApi();

    const fetchLatest = async () => {
        try {
            const data = await call(getLatestCRL);
            setCrl(data);
        } catch (err) {
            setCrl(null);
        }
    };

    useEffect(() => {
        void fetchLatest();
    }, []);

    const handleGenerate = async () => {
        try {
            const data = await call(generateCRL);
            await fetchLatest();
            // if CRL returned, show moved count
            if (data?.revocations_moved) {
                // optionally update revocations list or toast handled by useApi
            }
        } catch (err) {}
    };

    const handleDownload = () => {
        if (!crl?.crl_pem) return;
        const blob = new Blob([crl.crl_pem], { type: "application/pkix-crl" });
        saveAs(blob, `crl-${crl.id || "latest"}.crl`);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý CRL
                    </h1>
                    <p className="text-sm text-slate-500">
                        Danh sách chứng chỉ đã bị thu hồi và tệp CRL hệ thống.
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800"
                >
                    🔄 Tạo bản cập nhật CRL mới
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="font-bold mb-4">
                        Chứng chỉ bị thu hồi gần đây
                    </h3>
                    <div className="space-y-4">
                        {revocations.length === 0 ? (
                            <p className="text-sm text-slate-400 italic text-center py-10">
                                Không có bản ghi thu hồi hiển thị.
                            </p>
                        ) : (
                            revocations.map((r) => (
                                <div
                                    key={r.serial_number}
                                    className="p-3 border rounded-lg"
                                >
                                    <div className="font-mono text-sm text-indigo-600">
                                        {r.serial_number}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {r.reason}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-xl p-6 text-white h-fit">
                    <h3 className="font-bold mb-2">Thông tin CRL hiện tại</h3>
                    <div className="space-y-3 text-sm opacity-90">
                        <p>
                            Phiên bản:{" "}
                            <span className="font-bold">
                                {crl?.version ?? "-"}
                            </span>
                        </p>
                        <p>
                            Ngày tạo:{" "}
                            <span className="font-bold">
                                {crl?.generated_at ?? "-"}
                            </span>
                        </p>
                        <p>
                            Hết hạn:{" "}
                            <span className="font-bold">
                                {crl?.next_update ?? "-"}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="w-full mt-6 bg-white/20 hover:bg-white/30 py-2 rounded font-bold text-xs uppercase transition"
                    >
                        Tải về .crl file
                    </button>
                </div>
            </div>
        </div>
    );
}
