export default function CRLManagementPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý CRL</h1>
          <p className="text-sm text-slate-500">Danh sách chứng chỉ đã bị thu hồi và tệp CRL hệ thống.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800">
          🔄 Tạo bản cập nhật CRL mới
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-bold mb-4">Chứng chỉ bị thu hồi gần đây</h3>
          <div className="space-y-4">
             {/* Hiển thị list certificate bị revoke */}
             <p className="text-sm text-slate-400 italic text-center py-10">Đang tải danh sách thu hồi...</p>
          </div>
        </div>
        
        <div className="bg-indigo-600 rounded-xl p-6 text-white h-fit">
          <h3 className="font-bold mb-2">Thông tin CRL hiện tại</h3>
          <div className="space-y-3 text-sm opacity-90">
            <p>Phiên bản: <span className="font-bold">v2</span></p>
            <p>Ngày tạo: <span className="font-bold">2026-03-20</span></p>
            <p>Hết hạn: <span className="font-bold">2026-04-20</span></p>
          </div>
          <button className="w-full mt-6 bg-white/20 hover:bg-white/30 py-2 rounded font-bold text-xs uppercase transition">Tải về .crl file</button>
        </div>
      </div>
    </div>
  );
}