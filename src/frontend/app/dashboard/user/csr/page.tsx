"use client";

import { FormEvent, useState } from "react";

export default function UserCSRPage() {
  // State quản lý thông tin Subject
  const [commonName, setCommonName] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationalUnit, setOrganizationalUnit] = useState("");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [locality, setLocality] = useState("");
  const [sanValues, setSanValues] = useState("");

  // State quản lý trạng thái xử lý và kết quả
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [csrPem, setCsrPem] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  /**
   * Hàm hỗ trợ tải file Private Key về máy
   */
  const downloadKeyFile = (keyPem: string, filename: string) => {
    const blob = new Blob([keyPem], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCsrPem(null);
    setRequestId(null);

    // Kiểm tra Common Name bắt buộc
    if (!commonName.trim()) {
      setError("Common Name (CN) là bắt buộc.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị dữ liệu Subject
      const sanitizedSubject = {
        CN: commonName.trim(),
        O: organization.trim() || undefined,
        OU: organizationalUnit.trim() || undefined,
        C: country.trim() || undefined,
        ST: stateRegion.trim() || undefined,
        L: locality.trim() || undefined,
      };

      // Xử lý danh sách SAN
      const sanList = sanValues
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      /**
       * Gửi yêu cầu đến Backend
       * Lưu ý: API này sẽ trả về private_key_pem để người dùng tải về
       */
      const response = await fetch(
        "http://localhost:5000/api/v1/cert_request/generate",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: sanitizedSubject,
            san: sanList,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Chuyển đối tượng lỗi JSON thành chuỗi để hiển thị nếu cần
        const errorMsg =
          typeof data.error === "object"
            ? JSON.stringify(data.error)
            : data.error;
        throw new Error(errorMsg || "Không thể tạo CSR. Vui lòng thử lại.");
      }

      // Xử lý thành công
      setSuccessMessage("CSR đã được tạo và gửi lên hệ thống thành công.");
      setCsrPem(data.csr_pem);
      setRequestId(data.request_id);

      // Tự động tải Private Key về máy ngay lập tức
      if (data.private_key_pem) {
        downloadKeyFile(
          data.private_key_pem,
          `${commonName.trim() || "private"}.key`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Gửi yêu cầu CSR
        </h1>
        <p className="text-slate-500 mt-2">
          Tạo cặp khóa và CSR, sau đó hệ thống sẽ tự động lưu trữ yêu cầu chờ
          duyệt.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {/* Hàng 1: CN & O */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Common Name (CN)*
              </label>
              <input
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                type="text"
                placeholder="ví dụ: example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Organization (O)
              </label>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                type="text"
                placeholder="Tên công ty"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Hàng 2: OU & C */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Organizational Unit (OU)
              </label>
              <input
                value={organizationalUnit}
                onChange={(e) => setOrganizationalUnit(e.target.value)}
                type="text"
                placeholder="Phòng ban"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Country (C)
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                type="text"
                placeholder="Ví dụ: VN"
                maxLength={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Hàng 3: ST & L */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                State / Province (ST)
              </label>
              <input
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                type="text"
                placeholder="Ví dụ: Hanoi"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Locality (L)
              </label>
              <input
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                type="text"
                placeholder="Ví dụ: Hoan Kiem"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* SAN */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Subject Alternative Names (SAN)
            </label>
            <input
              value={sanValues}
              onChange={(e) => setSanValues(e.target.value)}
              type="text"
              placeholder="ví dụ: example.com, www.example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
            />
          </div>

          {/* Hiển thị lỗi */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-sm text-red-600 font-mono break-all leading-relaxed">
                <span className="font-bold uppercase mr-2">Error:</span>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang xử lý..." : "Tạo và gửi yêu cầu CSR"}
          </button>
        </form>

        {/* Hiển thị kết quả thành công */}
        {(successMessage || csrPem) && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-6">
            {successMessage && (
              <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <span className="font-bold text-lg">✓</span>
                <p className="font-medium text-sm">{successMessage}</p>
              </div>
            )}

            {requestId && (
              <div className="flex justify-between items-center text-sm px-4">
                <span className="text-slate-500 font-medium italic">
                  Request ID:
                </span>
                <code className="bg-white px-3 py-1 rounded-lg border text-blue-600 font-bold">
                  {requestId}
                </code>
              </div>
            )}

            {csrPem && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  CSR PEM Content
                </label>
                <textarea
                  readOnly
                  value={csrPem}
                  className="w-full h-48 p-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-mono text-slate-600 outline-none shadow-inner"
                />
              </div>
            )}

            <p className="text-[10px] text-center text-slate-400 italic">
              🔒 Lưu ý: Private Key đã được tự động tải về máy. Hệ thống không
              lưu giữ khóa này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
