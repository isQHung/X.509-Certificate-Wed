"use client";
import { useState, useEffect, useCallback } from "react";
// 1. Import hàm createClient thay vì biến supabase
import { createClient } from "../../../../lib/supabase";

<<<<<<< HEAD
import { useState, useEffect, useCallback, useMemo } from "react";
// Đảm bảo import đúng hàm createClient từ file supabase.ts của bạn
import { createClient } from "@/lib/supabase";
=======
// 2. Khởi tạo client bên ngoài hoặc bên trong component
const supabase = createClient();
>>>>>>> 08ec126 (feat(JIRA-23): update key management logic and supabase client)

interface KeyPair {
  id: string;
  owner_id: string;
  key_type: string;
  key_size: number;
<<<<<<< HEAD
  fingerprint: string; // Cột lưu Public Key PEM hoặc mã định danh khóa
=======
  fingerprint: string; // Đây là nơi lưu Public Key PEM theo logic mới của bạn
>>>>>>> 08ec126 (feat(JIRA-23): update key management logic and supabase client)
  created_at: string;
}

export default function UserKeysPage() {
  // Khởi tạo instance supabase từ hàm được export thực tế trong lib/supabase.ts
  const supabase = useMemo(() => createClient(), []);

  const [alias, setAlias] = useState("");
  const [algorithm, setAlgorithm] = useState("RSA - 2048 bit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedKeys, setSavedKeys] = useState<KeyPair[]>([]);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. LẤY DỮ LIỆU TỪ BẢNG KEY_PAIRS
  const fetchKeys = useCallback(async () => {
    try {
      const { data, error: dbError } = await supabase
=======
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Lấy danh sách khóa từ bảng key_pairs trên Supabase
  const fetchKeys = useCallback(async () => {
    try {
      const { data, error } = await supabase
>>>>>>> 08ec126 (feat(JIRA-23): update key management logic and supabase client)
        .from("key_pairs")
        .select("*")
        .order("created_at", { ascending: false });

<<<<<<< HEAD
      if (dbError) throw dbError;
      if (data) setSavedKeys(data);
    } catch (e: any) {
      console.error("Lỗi khi tải danh sách khóa:", e);
      setError("Không thể tải danh sách khóa từ hệ thống.");
=======
      if (error) throw error;
      if (data) setSavedKeys(data);
    } catch (e) {
      console.error("Lỗi khi fetch:", e);
      setError("Không thể tải danh sách khóa.");
>>>>>>> 08ec126 (feat(JIRA-23): update key management logic and supabase client)
    }
  }, [supabase]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

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
    if (!alias.trim()) return setError("Vui lòng nhập tên gợi nhớ.");
    setIsGenerating(true);
    setError(null);

    try {
      // Gọi API đến Backend (Python/FastAPI) để tạo cặp khóa
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
      if (!response.ok) throw new Error(data.error);

      // Tải Private Key về máy (vì Backend không lưu Private Key vào DB)
      if (data.private_key_pem) {
        // Tải Private Key về vì Database không lưu trữ khóa bí mật để đảm bảo an toàn
        downloadPrivateKey(data.private_key_pem, alias.replace(/\s+/g, "_"));

        setSuccessMsg("Thành công! Private Key đã được tải về máy của bạn.");
        setAlias("");

        // Làm mới danh sách sau khi backend đã insert vào bảng key_pairs
        await fetchKeys();
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối tới hệ thống Backend.");
        setAlias("");
        await fetchKeys(); // Refresh lại danh sách từ table
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Security Keys
        </h1>
        <p className="text-slate-500">
          Quản lý các cặp khóa bảo mật và tải về Private Key để sử dụng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: Form tạo khóa */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="font-semibold flex items-center gap-2 text-slate-800">
              🔑 New Key Pair
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Title / Alias
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="e.g. Web Server RSA Key"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Key type
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-slate-50 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option>RSA - 2048 bit</option>
                  <option>RSA - 4096 bit</option>
                </select>
              </div>
              <button
                onClick={handleGenerateKey}
                disabled={isGenerating}
                className="w-full py-2.5 bg-[#2da44e] hover:bg-[#2c974b] text-white rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
              >
                {isGenerating ? "⏳ Generating..." : "Generate Key Pair"}
              </button>
            </div>
          </div>

          {/* Thông báo lỗi/thành công */}
          {error && (
            <div className="p-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in duration-300">
              <span className="shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="p-4 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-start gap-2 animate-in fade-in duration-300">
              <span className="shrink-0">✅</span>
              <p>{successMsg}</p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Danh sách khóa từ Database */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Your Keys in Database
            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs font-normal">
              {savedKeys.length}
            </span>
          </h3>

          <div className="border border-slate-200 rounded-xl bg-slate-50/30 overflow-hidden shadow-inner">
            <div className="max-h-[700px] overflow-y-auto p-4 space-y-4">
              {savedKeys.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-slate-400 text-sm italic">
                    No keys found. Generate your first key pair to see it here.
                  </p>
                </div>
              ) : (
                savedKeys.map((key) => (
                  <div
                    key={key.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full text-xl group-hover:bg-indigo-50 transition-colors">
                          🔑
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 break-all text-sm sm:text-base">
                            ID: {key.id}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-indigo-100">
                              {key.key_type}
                            </span>
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                              {key.key_size} bit
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              {new Date(key.created_at).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fingerprint / Public Key Area */}
                    <div className="relative mt-4">
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-indigo-300 overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 border-l-4 border-indigo-500 shadow-inner">
                        {key.fingerprint}
                      </div>
                      <button
                        onClick={() => handleCopy(key.fingerprint, key.id)}
                        className="absolute right-3 top-3 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded shadow-sm opacity-0 group-hover:opacity-100 text-[10px] flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        {copiedId === key.id ? "✅ Copied!" : "📋 Copy PEM"}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Active & Verified in Supabase
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <h1 className="text-3xl font-bold">Security Keys</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái: Form tạo */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Generate New RSA Pair</h2>
            <input
              className="w-full p-2 border rounded bg-gray-50"
              placeholder="Key Alias (e.g. My-Web-Server)"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <select
              className="w-full p-2 border rounded bg-gray-50"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option>RSA - 2048 bit</option>
              <option>RSA - 4096 bit</option>
            </select>
            <button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="w-full py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50"
            >
              {isGenerating ? "Processing..." : "Generate & Save to DB"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm italic">{error}</p>}
        </div>

        {/* Cột phải: Danh sách từ Table key_pairs */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-semibold text-slate-700">
            Stored Key Pairs (Public Info)
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
            {savedKeys.map((key) => (
              <div
                key={key.id}
                className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-bold text-indigo-600">
                      Key ID: {key.id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {key.key_type} • {key.key_size} bit •{" "}
                      {new Date(key.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded border">
                    Database Sync
                  </span>
                </div>

                {/* Hiển thị Public Key từ cột fingerprint */}
                <div className="relative group">
                  <pre className="text-[9px] bg-slate-50 p-3 rounded border overflow-x-auto text-gray-600">
                    {key.fingerprint}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(key.fingerprint);
                      setCopiedId(key.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white border rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedId === key.id ? "✅ Copied" : "📋 Copy Public Key"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
