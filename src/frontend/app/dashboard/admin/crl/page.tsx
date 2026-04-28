"use client";
import { generateCRL, getLatestCRL, getRecentRevocations } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

export default function CRLManagementPage() {
    const [crl, setCrl] = useState<any | null>(null);
    const [revocations, setRevocations] = useState<any[]>([]);
    const { call } = useApi();

    const fetchLatest = async () => {
        try {
            // Fetch separately to avoid one failure blocking the other
            const crlData = await call(getLatestCRL).catch(() => null);
            const revData = await call(getRecentRevocations).catch(() => []);
            
            setCrl(crlData);
            setRevocations(revData || []);
        } catch (err) {
            console.error("Error fetching CRL data:", err);
        }
    };

    useEffect(() => {
        void fetchLatest();
    }, []);

    const handleGenerate = async () => {
        try {
            const data = await call(generateCRL);
            alert(`Đã tạo bản cập nhật CRL thành công! Đã chuyển ${data?.revocations_moved || 0} bản ghi thu hồi vào danh sách.`);
            await fetchLatest();
        } catch (err: any) {
            alert("Lỗi khi tạo CRL: " + (err.response?.data?.error || err.message));
        }
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
                                revocations.map((r, idx) => (
                                    <div
                                        key={r.id || idx}
                                        className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-mono text-xs font-bold text-indigo-600">
                                                SN: {r.serial_number}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">
                                                {r.reason || "Cessation of Operation"}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                                            {r.revoked_at ? new Date(r.revoked_at).toLocaleString() : "-"}
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
                                {crl?.generated_at ? new Date(crl.generated_at).toLocaleString() : "-"}
                            </span>
                        </p>
                        <p>
                            Hết hạn:{" "}
                            <span className="font-bold">
                                {crl?.next_update ? new Date(crl.next_update).toLocaleString() : "-"}
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