'use client';

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
}

interface CertificateDisplayProps {
  certificate: CertificateInfo;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function DNDisplay({ dn }: { dn: Record<string, string> }) {
  const dnKeys = Object.keys(dn);
  if (dnKeys.length === 0) return <p className="text-sm text-slate-500">Không có thông tin</p>;

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
        <h4 className="font-semibold text-slate-900 text-sm">{extension.name}</h4>
        <span
          className={`text-xs px-2 py-1 rounded ${
            extension.critical
              ? 'bg-red-100 text-red-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {extension.critical ? 'Critical' : 'Non-Critical'}
        </span>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 overflow-auto max-h-32">
        <pre>{JSON.stringify(extension.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function CertificateDisplay({ certificate }: CertificateDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`rounded-2xl p-6 ${
          certificate.validity.is_valid
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        <h3
          className={`font-semibold text-lg ${
            certificate.validity.is_valid ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {certificate.validity.is_valid ? '✓ Chứng chỉ hợp lệ' : '✗ Chứng chỉ không hợp lệ'}
        </h3>
        <p className={`text-sm mt-1 ${
          certificate.validity.is_valid ? 'text-green-600' : 'text-red-600'
        }`}>
          {certificate.validity.is_valid
            ? `Chứng chỉ này hợp lệ từ ${formatDate(certificate.validity.not_before)} đến ${formatDate(
                certificate.validity.not_after
              )}.`
            : `Chứng chỉ không hợp lệ. Ngày hiệu lực: ${formatDate(certificate.validity.not_before)} - ${formatDate(certificate.validity.not_after)}`}
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
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Chủ đề (Subject)</h3>
        <DNDisplay dn={certificate.subject} />
      </div>

      {/* Issuer */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Nhà phát hành (Issuer)</h3>
        <DNDisplay dn={certificate.issuer} />
      </div>

      {/* Validity */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Thời gian hiệu lực (Validity)</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-semibold text-slate-600">Có hiệu lực từ:</dt>
            <dd className="text-sm text-slate-900">
              {formatDate(certificate.validity.not_before)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">Hiệu lực đến:</dt>
            <dd className="text-sm text-slate-900">
              {formatDate(certificate.validity.not_after)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Public Key */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Thuật toán khóa công khai</h3>
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
