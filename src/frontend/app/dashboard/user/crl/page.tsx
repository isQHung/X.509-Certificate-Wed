"use client";
import { getLatestCRL } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { useState } from "react";

export default function UserCRLPage() {
    const [serial, setSerial] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const { call } = useApi();

    const handleCheck = async () => {
        setResult(null);
        try {
            const res = await call(getLatestCRL);
            const pem = res?.crl_pem ?? res?.data?.crl_pem ?? res;
            const hay = String(pem ?? "").toLowerCase();
            const needle = serial.trim().toLowerCase();
            if (!needle) {
                setResult("Vui lòng nhập serial number.");
                return;
            }
            const found = hay.includes(needle);
            setResult(
                found
                    ? "Đã bị thu hồi (found in CRL)"
                    : "Không tìm thấy trong CRL",
            );
        } catch (e) {
            setResult("Không thể lấy CRL hiện tại.");
        }
    };

    return (
        <div className="space-y-12 py-10">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <span className="text-5xl">🔍</span>
                <h1 className="text-3xl font-black text-slate-900">
                    Tra cứu trạng thái thu hồi
                </h1>
                <p className="text-slate-500 text-sm">
                    Nhập mã Serial Number của chứng chỉ để kiểm tra xem nó có
                    nằm trong danh sách thu hồi (CRL) của hệ thống hay không.
                </p>
            </div>

            <div className="max-w-xl mx-auto">
                <div className="relative group">
                    <input
                        value={serial}
                        onChange={(e) => setSerial(e.target.value)}
                        type="text"
                        placeholder="Ví dụ: 55:01:A2:BC:..."
                        className="w-full p-5 pr-32 border-2 border-slate-200 rounded-3xl text-lg font-mono focus:border-indigo-500 outline-none transition-all shadow-xl shadow-slate-100"
                    />
                    <button
                        onClick={handleCheck}
                        className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-6 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition"
                    >
                        Kiểm tra
                    </button>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400">
                {result ?? "Kết quả tra cứu sẽ hiển thị tại đây."}
            </div>
        </div>
    );
}