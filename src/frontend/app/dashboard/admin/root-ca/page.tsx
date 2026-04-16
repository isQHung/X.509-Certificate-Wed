"use client";
import { getLatestCRL, getRootCertificate, revokeRootCA, generateRootCA } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

function PemModal({ pem, onClose }: { pem: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[90%] max-w-3xl bg-white rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Mã PEM của Root Certificate</h3>
                    <button onClick={onClose} className="text-sm text-slate-500">Đóng</button>
                </div>
                <pre className="overflow-auto p-4 bg-slate-50 rounded text-xs font-mono max-h-96">
                    {pem}
                </pre>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => {
                            const blob = new Blob([pem], { type: "application/x-pem-file" });
                            saveAs(blob, "root_certificate.pem");
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded"
                    >
                        Tải xuống PEM
                    </button>
                    <button
                        onClick={() => {
                            try {
                                navigator.clipboard.writeText(pem);
                            } catch (e) {}
                        }}
                        className="px-4 py-2 border rounded"
                    >
                        Sao chép
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RootCAManagementPage() {
    const [hasRootCA, setHasRootCA] = useState<boolean | null>(null);
    const { call } = useApi();
    const [rootCert, setRootCert] = useState<any>(null);
    const [pem, setPem] = useState<string | null>(null);
    const [showPem, setShowPem] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const fetchRoot = async () => {
        try {
            const res = await call(getRootCertificate);
            if (res?.success && res?.pem) {
                setRootCert(res);
                setPem(res.pem);
                setHasRootCA(true);
            } else {
                setHasRootCA(false);
            }
        } catch (e) {
            setHasRootCA(false);
        }
    };

    useEffect(() => {
        void fetchRoot();
    }, []);

    if (hasRootCA === null) {
        return <div className="text-center py-10 font-bold text-slate-500">Đang tải cấu hình Root CA...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý Root CA
                    </h1>
                    <p className="text-sm text-slate-500">
                        Cấu hình và vận hành chứng chỉ gốc của hệ thống.
                    </p>
                </div>
                {hasRootCA && (
                    <button
                        onClick={async () => {
                            const ok = confirm("Bạn chắc chắn muốn thu hồi Root CA? Hành động này có thể làm hệ thống không thể ký chứng chỉ mới.");
                            if (!ok) return;
                            try {
                                setRevoking(true);
                                await call(revokeRootCA);
                                setHasRootCA(false);
                                alert("Đã thu hồi Root CA và xóa tệp tin thành công!");
                            } catch (e: any) {
                                alert("Có lỗi xảy ra khi thu hồi Root CA: " + (e.response?.data?.message || e.message || "Unknown error"));
                            } finally {
                                setRevoking(false);
                            }
                        }}
                        disabled={revoking}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                    >
                        {revoking ? "Đang thu hồi..." : "⚠️ Thu hồi Root CA"}
                    </button>
                )}
            </header>

            {showPem && pem !== null && (
                <PemModal pem={pem} onClose={() => setShowPem(false)} />
            )}

            {!hasRootCA ? (
                /* TRẠNG THÁI 1: CHƯA KHỞI TẠO */
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                        🔑
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">
                            Chưa có Root Certificate
                        </h3>
                        <p className="text-sm text-slate-500">
                            Hệ thống chưa thể ký CSR nếu chưa có Root CA. Vui
                            lòng khởi tạo cặp khóa gốc để bắt đầu vận hành PKI.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                const resp = await call(generateRootCA);
                                if (resp?.success) {
                                    alert("Khởi tạo Root CA từ thông tin ENV thành công!");
                                    await fetchRoot();
                                } else {
                                    alert("Lỗi: " + resp?.message);
                                }
                            } catch (e: any) {
                                alert("Đã xảy ra lỗi khi tạo Root CA: " + (e.response?.data?.message || e.message));
                            }
                        }}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                    >
                        Tự động khởi tạo từ ENV
                    </button>
                </div>
            ) : (
                /* TRẠNG THÁI 2: ĐÃ CÓ ROOT CA */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái: Thông tin chi tiết */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6">
                                Thông tin chứng chỉ (Subject)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        label: "Common Name (CN)",
                                        value: rootCert?.subject?.commonName || "UNKNOWN",
                                    },
                                    {
                                        label: "Organization (O)",
                                        value: rootCert?.subject?.organizationName || "N/A",
                                    },
                                    { 
                                        label: "Country (C)", 
                                        value: rootCert?.subject?.countryName || "N/A" 
                                    },
                                    {
                                        label: "Algorithm",
                                        value: `RSA ${rootCert?.key_size || 2048}-bit`,
                                    },
                                    {
                                        label: "Serial Number",
                                        value: rootCert?.serial_number || "N/A",
                                    },
                                    {
                                        label: "Signature Hash",
                                        value: rootCert?.hash_algorithm || "UNKNOWN",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                                            {item.label}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">
                                Thời gian hiệu lực
                            </h3>
                            <div className="flex items-center gap-8">
                                <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Ngày phát hành
                                    </p>
                                    <p className="text-sm font-mono font-bold">
                                        {rootCert?.valid_from 
                                            ? new Date(rootCert.valid_from).toLocaleString() 
                                            : "N/A"}
                                    </p>
                                </div>
                                <div className="text-slate-300">➔</div>
                                <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Ngày hết hạn
                                    </p>
                                    <p className="text-sm font-mono font-bold text-red-600">
                                        {rootCert?.valid_to 
                                            ? new Date(rootCert.valid_to).toLocaleString() 
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Cột phải: Trạng thái & Download */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase mb-4">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                                Đang hoạt động
                            </div>
                            <p className="text-xs text-slate-500 mb-6">
                                Root CA đang ở trạng thái sẵn sàng để ký các yêu
                                cầu CSR.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={async () => {
                                        try {
                                            const res =
                                                await call(getLatestCRL);
                                            const pem =
                                                res?.crl_pem ??
                                                res?.data?.crl_pem ??
                                                res;
                                            if (pem) {
                                                const blob = new Blob([pem], {
                                                    type: "application/octet-stream",
                                                });
                                                saveAs(blob, "crl_latest.pem");
                                            }
                                        } catch (e) {
                                        }
                                    }}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                                >
                                    📥 Tải xuống CRL mới nhất
                                </button>
                                <button
                                    onClick={() => {
                                        if (rootCert?.pem) {
                                            setPem(rootCert.pem);
                                            setShowPem(true);
                                        } else {
                                            alert("Lỗi: Không tìm thấy nội dung mã PEM! Dữ liệu có thể đã bị rỗng hoặc lỗi máy chủ.");
                                        }
                                    }}
                                    className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
                                >
                                    🔍 Xem mã PEM
                                </button>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-orange-800 mb-2">
                                Bảo mật Private Key
                            </h4>
                            <p className="text-xs text-orange-700 leading-relaxed">
                                Khóa bí mật của Root CA được lưu trữ trong môi
                                trường bảo mật. Tuyệt đối không chia sẻ hoặc để
                                lộ file .key của Root.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}