"use client";
import { useState } from "react";

export default function RootCAManagementPage() {
  // Giả lập trạng thái: true là đã có Root CA, false là hệ thống trắng
  const [hasRootCA, setHasRootCA] = useState(true);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Root CA</h1>
          <p className="text-sm text-slate-500">Cấu hình và vận hành chứng chỉ gốc của hệ thống.</p>
        </div>
        {hasRootCA && (
          <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition">
            ⚠️ Thu hồi Root CA
          </button>
        )}
      </header>

      {!hasRootCA ? (
        /* TRẠNG THÁI 1: CHƯA KHỞI TẠO */
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            🔑
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Chưa có Root Certificate</h3>
            <p className="text-sm text-slate-500">
              Hệ thống chưa thể ký CSR nếu chưa có Root CA. Vui lòng khởi tạo cặp khóa gốc để bắt đầu vận hành PKI.
            </p>
          </div>
          <button 
            onClick={() => setHasRootCA(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            Khởi tạo Root CA ngay
          </button>
        </div>
      ) : (
        /* TRẠNG THÁI 2: ĐÃ CÓ ROOT CA */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Thông tin chi tiết */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6">Thông tin chứng chỉ (Subject)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Common Name (CN)", value: "X509 System Root Authority" },
                  { label: "Organization (O)", value: "Hệ thống Quản lý Chứng chỉ số" },
                  { label: "Country (C)", value: "VN" },
                  { label: "Algorithm", value: "RSA 4096-bit" },
                  { label: "Serial Number", value: "55:01:A2:BC:99:FF:E0" },
                  { label: "Signature Hash", value: "SHA-256" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Thời gian hiệu lực</h3>
              <div className="flex items-center gap-8">
                <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ngày phát hành</p>
                  <p className="text-sm font-mono font-bold">2026-01-01 00:00:00</p>
                </div>
                <div className="text-slate-300">➔</div>
                <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ngày hết hạn</p>
                  <p className="text-sm font-mono font-bold text-red-600">2036-01-01 00:00:00</p>
                </div>
              </div>
            </section>
          </div>

          {/* Cột phải: Trạng thái & Download */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Đang hoạt động
              </div>
              <p className="text-xs text-slate-500 mb-6">Root CA đang ở trạng thái sẵn sàng để ký các yêu cầu CSR.</p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition">
                  📥 Tải xuống (.CRT)
                </button>
                <button className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition">
                  🔍 Xem mã PEM
                </button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-orange-800 mb-2">Bảo mật Private Key</h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                Khóa bí mật của Root CA được lưu trữ trong môi trường bảo mật. Tuyệt đối không chia sẻ hoặc để lộ file .key của Root.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}