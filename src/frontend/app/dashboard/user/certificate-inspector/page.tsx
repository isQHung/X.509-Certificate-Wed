"use client";

import { useState } from "react";
import CertificateUploadForm from "@/components/certificate/CertificateUploadForm";
import CertificateDisplay from "@/components/certificate/CertificateDisplay";

interface CertificateInfo {
  serial: string;
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validity: {
    not_before: string;
    not_after: string;
    is_valid: boolean;
  };
  extensions: Array<{
    name: string;
    critical: boolean;
    value: unknown;
  }>;
  public_key_type: string;
}

export default function CertificateInspectorPage() {
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const certificateInspectUrl = `${backendBaseUrl.replace(/\/+$/, "")}/api/v1/certificate/inspect`;

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("certificate", file);

      const response = await fetch(certificateInspectUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to inspect certificate");
      }

      const data = await response.json();
      setCertificateInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setCertificateInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Kiểm tra chứng chỉ
        </h1>
        <p className="text-sm text-slate-500">
          Tải lên và kiểm tra thông tin chi tiết của chứng chỉ X.509 (.crt,
          .pem, .cer, .der)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <CertificateUploadForm
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
          />
        </div>

        {/* Certificate Display */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-600 font-medium">Lỗi: {error}</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
              <p className="text-slate-500">Đang xử lý chứng chỉ...</p>
            </div>
          )}

          {certificateInfo && !isLoading && (
            <CertificateDisplay certificate={certificateInfo} />
          )}

          {!certificateInfo && !isLoading && !error && (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm">
                Tải lên một chứng chỉ để xem chi tiết
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
