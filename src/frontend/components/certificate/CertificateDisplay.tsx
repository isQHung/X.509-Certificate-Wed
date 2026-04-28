"use client";

interface CertificateExtension {
  name: string;
  critical: boolean;
  value: unknown;
}

interface CertificateValidity {
  not_before: string;
  not_after: string;
  is_valid: boolean;
}

interface CertificateInfo {
  serial: string;
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validity: CertificateValidity;
  extensions: CertificateExtension[];
  public_key_type: string;
  ca_validation?: {
    issued_by_system_ca: boolean;
    check_status: "ok" | "unavailable";
    message: string;
  };
}

interface CertificateDisplayProps {
  certificate: CertificateInfo;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DNDisplay({ dn }: { dn: Record<string, string> }) {
  const dnKeys = Object.keys(dn);
  if (dnKeys.length === 0)
    return <p className="text-sm text-slate-500">Không có thông tin</p>;

  return (
    <dl className="space-y-2">
      {dnKeys.map((key) => (
        <div key={key} className="grid grid-cols-2 gap-4">
          <dt className="text-sm font-semibold text-slate-600">{key}:</dt>
          <dd className="text-sm text-slate-900 break-all">{dn[key]}</dd>
        </div>
      ))}
    </dl>
  );
}

function ExtensionDisplay({ extension }: { extension: CertificateExtension }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-slate-900 text-sm">
          {extension.name}
        </h4>
        <span
          className={`text-xs px-2 py-1 rounded ${
            extension.critical
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {extension.critical ? "Critical" : "Non-Critical"}
        </span>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 overflow-auto max-h-32">
        <pre>{JSON.stringify(extension.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function CertificateDisplay({
  certificate,
}: CertificateDisplayProps) {
  const caValidation = certificate.ca_validation;
  const isVerifiedBySystem = caValidation?.issued_by_system_ca === true;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`rounded-2xl p-6 ${
          isVerifiedBySystem
            ? "bg-green-50 border border-green-200"
            : "bg-rose-50 border border-rose-200"
        }`}
      >
        <h3
          className={`font-semibold text-lg ${
            isVerifiedBySystem ? "text-green-700" : "text-rose-700"
          }`}
        >
          {isVerifiedBySystem
            ? "✓ Chứng chỉ đã được xác thực bởi hệ thống"
            : "✗ Chứng chỉ không được xác thực bởi hệ thống"}
        </h3>
        <p
          className={`text-sm mt-1 ${
            isVerifiedBySystem ? "text-green-600" : "text-rose-600"
          }`}
        >
          {isVerifiedBySystem
            ? "Chữ ký chứng chỉ đã được xác minh bằng CA của hệ thống."
            : "Chữ ký chứng chỉ không được xác minh bằng CA của hệ thống."}
        </p>
      </div>

      {/* Serial Number */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Số sê-ri</h3>
        <p className="text-sm font-mono text-slate-700 break-all bg-slate-50 p-3 rounded-lg">
          {certificate.serial}
        </p>
      </div>

      {/* Subject */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Chủ đề (Subject)
        </h3>
        <DNDisplay dn={certificate.subject} />
      </div>

      {/* Issuer */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Nhà phát hành (Issuer)
        </h3>
        <DNDisplay dn={certificate.issuer} />

        <div className="mt-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              isVerifiedBySystem
                ? "bg-green-100 text-green-800"
                : "bg-rose-100 text-rose-800"
            }`}
            title={caValidation?.message || "Khong co thong tin xac thuc"}
          >
            {isVerifiedBySystem
              ? "Da xac thuc boi he thong"
              : "Khong duoc xac thuc boi he thong"}
          </span>
          {caValidation?.message && (
            <p className="mt-2 text-xs text-slate-500">{caValidation.message}</p>
          )}
          </div>
      </div>

      {/* Validity */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Thời gian hiệu lực (Validity)
        </h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-semibold text-slate-600">
              Có hiệu lực từ:
            </dt>
            <dd className="text-sm text-slate-900">
              {formatDate(certificate.validity.not_before)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">
              Hiệu lực đến:
            </dt>
            <dd className="text-sm text-slate-900">
              {formatDate(certificate.validity.not_after)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Public Key */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Thuật toán khóa công khai
        </h3>
        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
          {certificate.public_key_type}
        </p>
      </div>

      {/* Extensions */}
      {certificate.extensions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Mở rộng ({certificate.extensions.length})
          </h3>
          <div className="space-y-6">
            {certificate.extensions.map((ext, idx) => (
              <div key={idx}>
                <ExtensionDisplay extension={ext} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
