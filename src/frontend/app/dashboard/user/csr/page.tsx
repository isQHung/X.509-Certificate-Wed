export default function UserCSRPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Gửi yêu cầu CSR</h1>
        <p className="text-sm text-slate-500">Tạo yêu cầu ký chứng chỉ bằng cặp khóa bạn đang sở hữu.</p>
      </header>

      <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Chọn khóa sử dụng</label>
              <select className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm">
                <option>Chưa có khóa nào...</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tên miền (Common Name)</label>
              <input type="text" placeholder="Ví dụ: example.com" className="w-full p-2.5 border rounded-xl text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Thông tin tổ chức (Organization)</label>
            <input type="text" placeholder="Ví dụ: Đại học Bách Khoa" className="w-full p-2.5 border rounded-xl text-sm" />
          </div>

          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition">
            Tạo và gửi yêu cầu CSR
          </button>
        </form>
      </div>
    </div>
  );
}