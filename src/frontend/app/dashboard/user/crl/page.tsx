"use client";
import { getRecentRevocations } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { useEffect, useState } from "react";

type RevocationEntry = {
    id?: string;
    serial_number?: string;
    revoked_at?: string;
    reason?: string;
    [key: string]: any;
};

export default function UserCRLPage() {
    const [searchSerial, setSearchSerial] = useState("");
    const [revocations, setRevocations] = useState<RevocationEntry[]>([]);
    const [filteredRevocations, setFilteredRevocations] = useState<RevocationEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResult, setSearchResult] = useState<string | null>(null);
    const { call } = useApi();

    // Fetch revocations on mount
    useEffect(() => {
        const fetchRevocations = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await call(getRecentRevocations);
                const revList = Array.isArray(data) ? data : [];
                setRevocations(revList);
                setFilteredRevocations(revList);
            } catch (err: any) {
                setError(err?.message || "Không thể tải danh sách CRL.");
                setRevocations([]);
                setFilteredRevocations([]);
            } finally {
                setLoading(false);
            }
        };
        void fetchRevocations();
    }, [call]);

    // Handle search
    const handleSearch = () => {
        setSearchResult(null);
        const query = searchSerial.trim().toLowerCase();
        
        if (!query) {
            setFilteredRevocations(revocations);
            setSearchResult("Vui lòng nhập serial number.");
            return;
        }

        const filtered = revocations.filter((item) => {
            const serial = String(item.serial_number ?? "").toLowerCase();
            return serial.includes(query);
        });

        setFilteredRevocations(filtered);
        setSearchResult(
            filtered.length > 0
                ? `Tìm thấy ${filtered.length} chứng chỉ bị thu hồi`
                : "Không tìm thấy chứng chỉ nào với serial number này.",
        );
    };

    // Handle reset
    const handleReset = () => {
        setSearchSerial("");
        setFilteredRevocations(revocations);
        setSearchResult(null);
    };

    const formatDateTime = (value?: string | null) => {
        if (!value) return "-";
        try {
            return new Date(value).toLocaleString("vi-VN");
        } catch {
            return value;
        }
    };

    return (
        <div className="space-y-8 py-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <span className="text-5xl">🔍</span>
                <h1 className="text-3xl font-black text-slate-900">
                    Tra cứu danh sách thu hồi chứng chỉ (CRL)
                </h1>
                <p className="text-slate-500 text-sm">
                    Xem danh sách các chứng chỉ bị thu hồi hoặc tìm kiếm theo mã Serial Number
                    để kiểm tra trạng thái của chứng chỉ của bạn.
                </p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            value={searchSerial}
                            onChange={(e) => setSearchSerial(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            type="text"
                            placeholder="Ví dụ: 55:01:A2:BC:... hoặc chỉ cần 55:01"
                            className="w-full p-4 pr-28 border-2 border-slate-200 rounded-2xl text-base focus:border-indigo-500 outline-none transition-all shadow-md"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition"
                        >
                            Tìm
                        </button>
                    </div>
                    {searchResult && (
                        <p
                            className={`text-sm font-medium ${
                                searchResult.includes("Không tìm thấy")
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                            }`}
                        >
                            {searchResult}
                        </p>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-4xl mx-auto w-full bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="max-w-4xl mx-auto w-full text-center py-12 text-slate-500">
                    <div className="inline-block animate-spin">⏳</div>
                    <p className="mt-2">Đang tải danh sách CRL...</p>
                </div>
            )}

            {/* Stats Bar */}
            {!loading && (
                <div className="max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                            Tổng cộng
                        </p>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                            {revocations.length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                            Hiển thị
                        </p>
                        <p className="text-2xl font-black text-indigo-600 mt-1">
                            {filteredRevocations.length}
                        </p>
                    </div>
                    {searchSerial && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center md:col-span-1">
                            <button
                                onClick={handleReset}
                                className="w-full text-xs font-semibold uppercase text-slate-500 hover:text-slate-700 tracking-wide transition"
                            >
                                Xóa bộ lọc ✕
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Revocation List Table */}
            {!loading && (
                <div className="max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {filteredRevocations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide text-slate-600">
                                            Serial Number
                                        </th>
                                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide text-slate-600">
                                            Ngày thu hồi
                                        </th>
                                        <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide text-slate-600">
                                            Lý do
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRevocations.map((item, idx) => (
                                        <tr
                                            key={item.id || idx}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <code className="bg-slate-100 text-slate-900 px-3 py-1 rounded-lg text-xs font-mono break-all">
                                                    {item.serial_number || "-"}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-xs">
                                                {formatDateTime(item.revoked_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                                    {item.reason || "Không rõ"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <p className="text-slate-500 font-medium">
                                {searchSerial
                                    ? "Không tìm thấy chứng chỉ nào phù hợp."
                                    : "Chưa có chứng chỉ nào bị thu hồi."}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="max-w-4xl mx-auto w-full bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-900">
                <p className="font-semibold mb-2">💡 Cách sử dụng:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>Xem danh sách các chứng chỉ bị thu hồi trong hệ thống</li>
                    <li>Nhập serial number hoặc một phần của nó để tìm kiếm</li>
                    <li>Kiểm tra ngày thu hồi và lý do thu hồi</li>
                </ul>
            </div>
        </div>
    );
}