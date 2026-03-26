export default function ConfigTechnicalPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Cấu hình kỹ thuật</h1>
        <p className="text-sm text-slate-500">Thiết lập thuật toán và thông số bảo mật cho toàn hệ thống PKI.</p>
      </header>

      <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Tiêu chuẩn mã hóa</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Thuật toán ký</label>
              <select className="w-full p-2 border rounded-lg text-sm bg-slate-50">
                <option>RSA (Recommended)</option>
                <option>ECDSA</option>
                <option>EdDSA</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Độ dài khóa (bits)</label>
              <select className="w-full p-2 border rounded-lg text-sm bg-slate-50">
                <option>2048</option>
                <option>3072</option>
                <option>4096</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Hiệu lực chứng chỉ</h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Thời gian hết hạn mặc định (Ngày)</label>
            <input type="number" defaultValue={365} className="w-full p-2 border rounded-lg text-sm bg-slate-50" />
          </div>
        </section>

        <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
          Lưu cấu hình & Áp dụng
        </button>
      </div>
    </div>
  );
}