"use client";

import { FormEvent, useState } from "react";

export default function UserCSRPage() {
  const [commonName, setCommonName] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationalUnit, setOrganizationalUnit] = useState("");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [locality, setLocality] = useState("");
  const [sanValues, setSanValues] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [csrPem, setCsrPem] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

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

    if (!commonName.trim()) {
      setError("Common Name (CN) là bắt buộc.");
      return;
    }

    setIsSubmitting(true);

    try {
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

      const response = await fetch("/api/v1/cert_request/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: sanitizedSubject,
          san: sanList,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo CSR. Vui lòng thử lại.");
      }

      setSuccessMessage("CSR đã được tạo và gửi lên hệ thống thành công.");
      setCsrPem(data.csr_pem);
      setRequestId(data.request_id);
      downloadKeyFile(data.private_key_pem, `${commonName.trim() || "csr"}.key`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Gửi yêu cầu CSR</h1>
        <p className="text-sm text-slate-500">
          Tạo cặp khóa và CSR tương tác, sau đó gửi yêu cầu CSR lên hệ thống.
        </p>
      </header>

      <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Common Name (CN)</label>
              <input
                value={commonName}
                onChange={(event) => setCommonName(event.target.value)}
                type="text"
                placeholder="Ví dụ: example.com"
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Organization (O)</label>
              <input
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                type="text"
                placeholder="Ví dụ: FPT Corporation"
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Organizational Unit (OU)</label>
              <input
                value={organizationalUnit}
                onChange={(event) => setOrganizationalUnit(event.target.value)}
                type="text"
                placeholder="Ví dụ: IT Department"
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Country (C)</label>
              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                type="text"
                placeholder="Ví dụ: VN"
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">State / Province (ST)</label>
              <input
                value={stateRegion}
                onChange={(event) => setStateRegion(event.target.value)}
                type="text"
                placeholder="Ví dụ: Hanoi"
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Locality (L)</label>
              <input
                value={locality}
                onChange={(event) => setLocality(event.target.value)}
                type="text"
                placeholder="Ví dụ: Hoan Kiem"
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Subject Alternative Names (SAN)</label>
            <input
              value={sanValues}
              onChange={(event) => setSanValues(event.target.value)}
              type="text"
              placeholder="Danh sách DNS, phân tách bằng dấu phẩy"
              className="w-full p-2.5 border rounded-xl text-sm"
            />
            <p className="text-xs text-slate-500">Ví dụ: example.com, www.example.com</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang tạo CSR..." : "Tạo và gửi yêu cầu CSR"}
          </button>
        </form>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
            <p>{successMessage}</p>
            {requestId && <p className="mt-2">Mã yêu cầu: <strong>{requestId}</strong></p>}
          </div>
        )}

        {csrPem && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">CSR PEM</h2>
            <textarea
              readOnly
              value={csrPem}
              className="w-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-4 text-xs font-mono text-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
