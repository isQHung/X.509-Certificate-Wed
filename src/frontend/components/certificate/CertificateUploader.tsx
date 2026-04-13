"use client";

import api from "@/lib/axios";
import { useState } from "react";
import CertificateDisplay from "./CertificateDisplay";
import CertificateUploadForm from "./CertificateUploadForm";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CertificateUploader({ isOpen, onClose }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [inspectedCert, setInspectedCert] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative w-full max-w-4xl mx-4">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            Upload chứng chỉ
                        </h2>
                        <button
                            className="text-sm text-slate-500 hover:text-slate-700"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>

                    {!inspectedCert && (
                        <CertificateUploadForm
                            isLoading={isUploading}
                            onFileUpload={async (file: File) => {
                                try {
                                    setIsUploading(true);
                                    setError(null);
                                    setInspectedCert(null);

                                    const form = new FormData();
                                    form.append("certificate", file, file.name);

                                    const resp = await api.post(
                                        "/api/v1/certificate/inspect",
                                        form,
                                        {
                                            headers: {
                                                "Content-Type":
                                                    "multipart/form-data",
                                            },
                                        },
                                    );

                                    if (resp.data) {
                                        setInspectedCert(resp.data);
                                    } else {
                                        setError(
                                            "Không nhận được phản hồi hợp lệ từ máy chủ",
                                        );
                                    }
                                } catch (e: unknown) {
                                    const msg =
                                        e instanceof Error
                                            ? e.message
                                            : String(e);
                                    setError(`Lỗi khi upload: ${msg}`);
                                    console.error("Upload error:", e);
                                } finally {
                                    setIsUploading(false);
                                }
                            }}
                        />
                    )}

                    {inspectedCert && (
                        <div className="space-y-4">
                            <CertificateDisplay certificate={inspectedCert} />

                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 rounded bg-slate-100 text-slate-800"
                                    onClick={() => setInspectedCert(null)}
                                >
                                    Tải lên khác
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-indigo-600 text-white"
                                    onClick={onClose}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
