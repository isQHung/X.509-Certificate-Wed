export default function CSRApprovalPage() {
  const pendingRequests = [
    { id: "CSR-9901", user: "minh.nguyen@example.com", subject: "CN=Minh Nguyen, O=FPT", date: "2026-03-25" },
    { id: "CSR-9902", user: "lan.anh@example.com", subject: "CN=Lan Anh, O=Viettel", date: "2026-03-26" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Phê duyệt CSR</h1>
        <p className="text-sm text-slate-500">Xem xét và ký duyệt các yêu cầu cấp chứng chỉ mới.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Mã yêu cầu</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Người gửi</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Thông tin (Subject)</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((req) => (
              <tr key={req.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-4 text-sm font-mono text-indigo-600">{req.id}</td>
                <td className="p-4 text-sm text-slate-700">{req.user}</td>
                <td className="p-4 text-sm text-slate-500">{req.subject}</td>
                <td className="p-4 text-right space-x-2">
                  <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700">Duyệt & Ký</button>
                  <button className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100">Từ chối</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}