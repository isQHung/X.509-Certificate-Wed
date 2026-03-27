export default function IssuedCertificatesPage() {
  const certs = [
    { serial: "00:E1:22:...", user: "minh.nguyen@example.com", validUntil: "2027-03-25", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Danh sách Chứng nhận</h1>
        <p className="text-sm text-slate-500">Quản lý và thu hồi các chứng chỉ đã phát hành.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Serial Number</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Chủ sở hữu</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Hết hạn</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert) => (
              <tr key={cert.serial} className="border-b last:border-0">
                <td className="p-4 text-sm font-mono">{cert.serial}</td>
                <td className="p-4 text-sm">{cert.user}</td>
                <td className="p-4 text-sm">{cert.validUntil}</td>
                <td className="p-4 text-right">
                  <button className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50">Thu hồi (Revoke)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}