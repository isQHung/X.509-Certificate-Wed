"use client";
import { downloadCertificate, requestRevocation } from "@/lib/api/client";
// import { listCertificates } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";

export default function UserCertificatesPage() {
    const [myCerts, setMyCerts] = useState<any[]>([]);

    // useEffect(() => {
    //     let mounted = true;
    //     (async () => {
    //         try {
    //             const data = await listCertificates();
    //             if (!mounted) return;
    //             // normalize to expected shape
    //             const mapped = (data || []).map((c: any) => ({
    //                 id: c.id,
    //                 cn: c.subject || c.issuer || "-",
    //                 serial: c.serial || c.serial_number || c.serial_number,
    //                 expiry: c.validUntil || c.valid_to || c.valid_to,
    //                 status: c.status,
    //             }));
    //             setMyCerts(mapped);
    //         } catch (e) {
    //             setMyCerts([]);
    //         }
    //     })();
    //     return () => {
    //         mounted = false;
    //     };
    // }, []);

    const { call } = useApi();

    const handleDownload = async (serial: string) => {
        try {
            const blob = await call(downloadCertificate, serial);
            // axios returns blob directly in wrapper
            saveAs(blob, `cert-${serial}.pem`);
        } catch (err) {}
    };

    const handleRequestRevocation = async (serial: string) => {
        const reason = prompt("Lý do thu hồi (ví dụ: Lộ khóa riêng):");
        if (!reason) return;
        try {
            await call(requestRevocation, serial, reason);
        } catch (err) {}
    };

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
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                    + Upload chứng chỉ khác
                </button>
            </header>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">
                                Common Name
                            </th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">
                                Serial Number
                            </th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">
                                Ngày hết hạn
                            </th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {myCerts.map((cert) => (
                            <tr
                                key={cert.id}
                                className="hover:bg-slate-50/50 transition"
                            >
                                <td className="p-4 font-bold text-slate-700">
                                    {cert.cn}
                                </td>
                                <td className="p-4 font-mono text-xs text-slate-500">
                                    {cert.serial}
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {cert.expiry}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() =>
                                            void handleDownload(cert.serial)
                                        }
                                        className="text-indigo-600 font-bold text-xs hover:underline"
                                    >
                                        Tải về
                                    </button>
                                    <button
                                        onClick={() =>
                                            void handleRequestRevocation(
                                                cert.serial,
                                            )
                                        }
                                        className="text-red-500 font-bold text-xs hover:underline"
                                    >
                                        Yêu cầu thu hồi
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
