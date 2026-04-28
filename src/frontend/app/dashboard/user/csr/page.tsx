"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { createCSR } from "@/lib/api/user";

type CsrMode = "generate" | "upload";

export default function UserCSRPage() {
  const [csrMode, setCsrMode] = useState<CsrMode>("generate");
  // State quản lý thông tin Subject
  const [commonName, setCommonName] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationalUnit, setOrganizationalUnit] = useState("");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [locality, setLocality] = useState("");
  const [sanValues, setSanValues] = useState("");
  const [alias, setAlias] = useState("");
  const [keyAlgorithm, setKeyAlgorithm] = useState("RSA");
  const [keySize, setKeySize] = useState("2048");
  const [validityDays, setValidityDays] = useState("365");
  const [uploadedCsrPem, setUploadedCsrPem] = useState("");

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

  const readCsrFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setUploadedCsrPem(content);
    } catch {
      setError("Không thể đọc file CSR. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCsrPem(null);
    setRequestId(null);

    setIsSubmitting(true);

    try {
      if (csrMode === "upload") {
        const csrPem = uploadedCsrPem.trim();
        if (!csrPem) {
          setError("CSR PEM là bắt buộc khi chọn upload CSR.");
          return;
        }

        const data = await createCSR({ csr_pem: csrPem });
        setSuccessMessage("CSR đã được gửi lên hệ thống thành công.");
        setCsrPem(csrPem);
        setRequestId(data.request_id ?? null);
        return;
      }

      if (!commonName.trim()) {
        setError("Common Name (CN) là bắt buộc.");
        return;
      }

      if (!alias.trim()) {
        setError("Alias là bắt buộc.");
        return;
      }

      const parsedValidityDays = Number(validityDays);
      if (
        !Number.isInteger(parsedValidityDays) ||
        parsedValidityDays < 1 ||
        parsedValidityDays > 3650
      ) {
        setError("Validity days phải là số nguyên từ 1 đến 3650.");
        return;
      }

      const parsedKeySize = Number(keySize);
      if (!Number.isInteger(parsedKeySize)) {
        setError("Key size không hợp lệ.");
        return;
      }

      const sanitizedSubject = {
        CN: commonName.trim(),
        O: organization.trim() || undefined,
        OU: organizationalUnit.trim() || undefined,
        C: country.trim() || undefined,
        ST: stateRegion.trim() || undefined,
        L: locality.trim() || undefined,
      };

      const sanList = sanValues
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const data = await createCSR({
        alias: alias.trim(),
        subject: sanitizedSubject,
        san: sanList,
        key_algorithm: keyAlgorithm === "EC" ? "EC" : "RSA",
        key_size: parsedKeySize,
        validity_days: parsedValidityDays,
      });

      setSuccessMessage("CSR đã được tạo và gửi lên hệ thống thành công.");
      setCsrPem(data.csr_pem ?? null);
      setRequestId(data.request_id ?? null);

      if (data.private_key_pem) {
        downloadKeyFile(data.private_key_pem, `${commonName.trim() || "private"}.key`);
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
          Chọn upload CSR PEM hoặc để hệ thống tự tạo CSR từ thông tin bạn cung
          cấp.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCsrMode("generate")}
              className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                csrMode === "generate"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Hệ thống tạo CSR
            </button>
            <button
              type="button"
              onClick={() => setCsrMode("upload")}
              className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                csrMode === "upload"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Upload CSR PEM
            </button>
          </div>

          {csrMode === "upload" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  CSR PEM*
                </label>
                <textarea
                  value={uploadedCsrPem}
                  onChange={(e) => setUploadedCsrPem(e.target.value)}
                  placeholder="-----BEGIN CERTIFICATE REQUEST-----"
                  className="w-full h-56 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hoặc chọn file .pem/.csr
                </label>
                <input
                  type="file"
                  accept=".pem,.csr,.txt"
                  onChange={readCsrFile}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          ) : (
            <>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Alias*
              </label>
              <input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                type="text"
                placeholder="Ví dụ: web-server-prod"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Validity Days*
              </label>
              <input
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                type="number"
                min={1}
                max={3650}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Key Algorithm*
              </label>
              <select
                value={keyAlgorithm}
                onChange={(e) => {
                  const nextAlgorithm = e.target.value;
                  setKeyAlgorithm(nextAlgorithm);
                  setKeySize(nextAlgorithm === "EC" ? "256" : "2048");
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              >
                <option value="RSA">RSA</option>
                <option value="EC">EC (ECDSA)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Key Size*
              </label>
              <select
                value={keySize}
                onChange={(e) => setKeySize(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              >
                {keyAlgorithm === "RSA" ? (
                  <>
                    <option value="2048">2048</option>
                    <option value="3072">3072</option>
                    <option value="4096">4096</option>
                  </>
                ) : (
                  <>
                    <option value="256">256 (P-256)</option>
                    <option value="384">384 (P-384)</option>
                  </>
                )}
              </select>
            </div>
          </div>

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
            </>
          )}

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
            {isSubmitting
              ? "Đang xử lý..."
              : csrMode === "upload"
                ? "Upload và gửi yêu cầu CSR"
                : "Tạo và gửi yêu cầu CSR"}
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

            {csrMode === "generate" && (
              <p className="text-[10px] text-center text-slate-400 italic">
                🔒 Lưu ý: Private Key đã được tự động tải về máy. Hệ thống không
                lưu giữ khóa này.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
