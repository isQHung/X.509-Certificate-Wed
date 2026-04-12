"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface Certificate {
  id: string;
  serial_number: string;
  subject: {
    emailAddress?: string;
    email?: string;
    commonName?: string;
    cn?: string;
  } | null;
  valid_to: string | null;
  status: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN");
};

const extractOwner = (subject: Certificate["subject"]) => {
  if (!subject) return "N/A";
  return subject.emailAddress || subject.email || subject.commonName || subject.cn || "N/A";
};

export default function IssuedCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/api/v1/certificates/all");

        if (response.data?.success) {
          setCertificates(response.data.data || []);
          return;
        }

        setError("Không thể tải danh sách chứng chỉ");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
        setError(`Lỗi khi tải chứng chỉ: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Danh sách Chứng nhận</h1>
        <p className="text-sm text-slate-500">Quản lý và thu hồi các chứng chỉ đã phát hành.</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-600">Đang tải dữ liệu...</div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center text-slate-600">Không có chứng chỉ nào</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Serial Number</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Chủ sở hữu</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Hết hạn</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b last:border-0">
                  <td className="p-4 text-sm font-mono">{cert.serial_number}</td>
                  <td className="p-4 text-sm">{extractOwner(cert.subject)}</td>
                  <td className="p-4 text-sm">{formatDate(cert.valid_to)}</td>
                  <td className="p-4 text-sm">{cert.status}</td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50">Thu hồi (Revoke)</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}