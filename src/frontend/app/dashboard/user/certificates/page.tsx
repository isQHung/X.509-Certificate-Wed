"use client";

import CertificateUploader from "@/components/certificate/CertificateUploader";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

interface Certificate {
    id: string;
    serial_number: string;
    valid_to: string;
    status: string;
}

export default function UserCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [inspectedCert, setInspectedCert] = useState<any | null>(null);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/v1/certificates/my");
            if (response.data.success) {
                setCertificates(response.data.data);
            } else {
                setError("Không thể tải danh sách chứng chỉ");
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Lỗi không xác định";
            setError(`Lỗi khi tải chứng chỉ: ${errorMessage}`);
            console.error("Error fetching certificates:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (cert: any) => {
        if (!cert.certificate_pem) {
            alert("Không tìm thấy nội dung chứng chỉ PEM.");
            return;
        }
        const blob = new Blob([cert.certificate_pem], {
            type: "application/x-pem-file",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${cert.common_name || cert.serial_number}.crt`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const handleRevoke = async (cert: any) => {
        if (cert.status !== "active") {
            alert(
                `Chứng chỉ đang ở trạng thái "${cert.status}", không thể yêu cầu thu hồi.`,
            );
            return;
        }
        const reason = window.prompt(
            "Vui lòng nhập lý do thu hồi chứng chỉ (bắt buộc):",
        );
        if (!reason || !reason.trim()) return;

        try {
            setLoading(true);
            const resp = await api.post(
                `/api/v1/user/revoke/${cert.serial_number}/request`,
                { reason },
            );
            if (resp.data?.success) {
                alert(resp.data?.message || "Đã gửi yêu cầu thu hồi thành công.");
                fetchCertificates();
            } else {
                setError(resp.data?.message || "Lỗi khi gửi yêu cầu thu hồi");
                setLoading(false);
            }
        } catch (e: any) {
            const msg =
                e.response?.data?.message ||
                e.response?.data?.error ||
                e.message ||
                String(e);
            setError(`Lỗi khi yêu cầu thu hồi: ${msg}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Chứng chỉ của tôi
                    </h1>
                    <p className="text-sm text-slate-500">
                        Danh sách các chứng chỉ số đã được hệ thống cấp phát.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setInspectedCert(null);
                        setError(null);
                        setShowUpload(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                >
                    + Upload chứng chỉ khác
                </button>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-semibold">
                        {error}
                    </p>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Đang tải dữ liệu...</p>
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Không có chứng chỉ nào</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase">
                                    Serial Number
                                </th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase">
                                    Ngày hết hạn
                                </th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase">
                                    Trạng thái
                                </th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {certificates.map((cert) => (
                                <tr
                                    key={cert.id}
                                    className="hover:bg-slate-50/50 transition"
                                >
                                    <td className="p-4 font-mono text-xs text-slate-500">
                                        {cert.serial_number}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {cert.valid_to}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            {cert.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleDownload(cert)}
                                            className="text-indigo-600 font-bold text-xs hover:underline"
                                        >
                                            Tải về
                                        </button>
                                        <button
                                            onClick={() => handleRevoke(cert)}
                                            className="text-red-500 font-bold text-xs hover:underline"
                                        >
                                            Yêu cầu thu hồi
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <CertificateUploader
                isOpen={showUpload}
                onClose={() => setShowUpload(false)}
                onSuccess={() => {
                    fetchCertificates();
                }}
            />
        </div>
    );
}
