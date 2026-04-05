"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// Import hàm createClient từ folder lib theo cấu trúc của bạn
import { createClient } from "@/lib/supabase";

interface KeyPair {
  id: string;
  owner_id: string;
  key_type: string;
  key_size: number;
  fingerprint: string; // Đây là cột chứa Public Key PEM trong DB của bạn
  created_at: string;
}

export default function UserKeysPage() {
  // Khởi tạo supabase client từ hàm export trong lib/supabase.ts
  const supabase = useMemo(() => createClient(), []);

  const [alias, setAlias] = useState("");
  const [algorithm, setAlgorithm] = useState("RSA - 2048 bit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedKeys, setSavedKeys] = useState<KeyPair[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Lấy danh sách khóa từ bảng key_pairs
  const fetchKeys = useCallback(async () => {
    try {
      const { data, error: dbError } = await supabase
        .from("key_pairs")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      if (data) setSavedKeys(data);
    } catch (e: any) {
      console.error("Lỗi fetch:", e);
      setError("Không thể tải danh sách khóa từ Database.");
    }
  }, [supabase]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadPrivateKey = (pem: string, fileName: string) => {
    const blob = new Blob([pem], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.key`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateKey = async () => {
    if (!alias.trim()) return setError("Vui lòng nhập Alias.");
    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Gọi đến API Backend Python để tạo cặp khóa
      const response = await fetch(
        "http://localhost:5000/api/v1/cert_request/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: { CN: alias.trim() },
            key_size: algorithm.includes("4096") ? 4096 : 2048,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi backend");

      if (data.private_key_pem) {
        // Tải Private Key về máy (DB không lưu khóa này)
        downloadPrivateKey(data.private_key_pem, alias.replace(/\s+/g, "_"));
        setSuccessMsg("Đã tạo khóa và tải Private Key về máy.");
        setAlias("");
        // Refresh danh sách từ DB (lúc này backend đã insert xong public info)
        await fetchKeys();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Key Management</h1>
        <p className="text-slate-500">
          Quản lý các cặp khóa RSA được lưu trữ trong hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form tạo khóa */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-semibold flex items-center gap-2">
            🔑 Tạo cặp khóa mới
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên gợi nhớ (Alias)</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ví dụ: My Server"
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kích thước khóa</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm outline-none"
              >
                <option>RSA - 2048 bit</option>
                <option>RSA - 4096 bit</option>
              </select>
            </div>
            <button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold transition-colors disabled:opacity-50"
            >
              {isGenerating ? "⏳ Đang tạo..." : "Tạo và Lưu vào DB"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 italic mt-2">{error}</p>}
          {successMsg && (
            <p className="text-xs text-green-600 font-bold mt-2">
              {successMsg}
            </p>
          )}
        </div>

        {/* Danh sách từ Database */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">
            Khóa đã lưu trong Database
          </h3>
          <div className="border border-slate-200 rounded-xl bg-slate-50/30 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
              {savedKeys.length === 0 ? (
                <p className="text-center py-10 text-slate-400">
                  Chưa có khóa nào được lưu.
                </p>
              ) : (
                savedKeys.map((key) => (
                  <div
                    key={key.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 break-all text-sm">
                          ID: {key.id}
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          {key.key_type} • {key.key_size} bit •{" "}
                          {new Date(key.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">
                        VERIFIED DB
                      </span>
                    </div>

                    {/* Hiển thị Public Key từ cột fingerprint */}
                    <div className="relative group">
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[9px] text-slate-600 overflow-x-auto whitespace-pre">
                        {key.fingerprint}
                      </div>
                      <button
                        onClick={() => handleCopy(key.fingerprint, key.id)}
                        className="absolute right-2 top-2 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedId === key.id
                          ? "✅ Copied"
                          : "📋 Copy Public Key"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
