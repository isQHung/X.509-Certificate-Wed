export default function UserKeysPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý cặp khóa</h1>
          <p className="text-sm text-slate-500">Tạo và lưu trữ các khóa bí mật để ký yêu cầu chứng chỉ.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form tạo khóa */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800">Tạo khóa mới</h3>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase">Thuật toán</label>
            <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm">
              <option>RSA - 2048 bit</option>
              <option>RSA - 4096 bit</option>
              <option>ECC - secp256k1</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase">Tên gợi nhớ (Alias)</label>
            <input type="text" placeholder="Ví dụ: My Laptop Key" className="w-full p-2 border rounded-lg text-sm" />
          </div>
          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100">
            Phát sinh cặp khóa
          </button>
          <p className="text-[10px] text-slate-400 italic text-center">Lưu ý: Private Key sẽ được lưu an toàn trong trình duyệt/database của bạn.</p>
        </div>

        {/* Danh sách khóa hiện có */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-700">Khóa đã lưu</h3>
          </div>
          <div className="p-8 text-center space-y-2">
            <span className="text-3xl opacity-20">🗝️</span>
            <p className="text-sm text-slate-400">Bạn chưa có cặp khóa nào. Hãy tạo một cái để bắt đầu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}