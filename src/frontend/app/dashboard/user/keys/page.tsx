"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { generateKeyPair } from "@/lib/api/user";

interface KeyPair {
  id: string;
  owner_id: string;
  key_type: string;
  key_size: number;
  fingerprint: string;
  created_at: string;
  alias: string;
}

export default function UserKeysPage() {
  const supabase = useMemo(() => createClient(), []);

  const [alias, setAlias] = useState("");
  const [algorithm, setAlgorithm] = useState("RSA - 2048 bit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedKeys, setSavedKeys] = useState<KeyPair[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. LẤY DỮ LIỆU TỪ BẢNG KEY_PAIRS
  const fetchKeys = useCallback(async () => {
    try {
      const storedUserId = localStorage.getItem("userId");
      const { data, error: dbError } = await supabase
        .from("key_pairs")
        .select("*")
        .eq("owner_id", storedUserId)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      if (data) setSavedKeys(data);
    } catch (e: any) {
      console.error("Lỗi khi tải danh sách khóa:", e);
      setError("Không thể tải danh sách khóa từ hệ thống.");
    }
  }, [supabase]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (storedUserId) {
      console.log(
        "Dòng thời gian: Người dùng đã xác thực, bắt đầu tải khóa...",
      );
      fetchKeys();
    } else {
      console.warn("Cảnh báo: Không tìm thấy UserId, vui lòng đăng nhập lại.");
    }
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
    if (!alias.trim()) {
      setError("Vui lòng nhập tên gợi nhớ (Alias)");
      return;
    }
    setIsGenerating(true);

    try {
      const data = await generateKeyPair({
        alias: alias.trim(),
        key_algorithm: "RSA",
        key_size: algorithm.includes("4096") ? 4096 : 2048,
      });

      console.log("Response từ Backend:", data);
      if (data.key_pair_id) {
        console.log("Đã lấy được UserId và lưu DB thành công!");
      }

      if (data.private_key_pem) {
        // Tải Private Key về vì Database không lưu trữ khóa bí mật
        downloadPrivateKey(data.private_key_pem, alias.replace(/\s+/g, "_"));

        setSuccessMsg("Thành công! Private Key đã được tải về.");
        setAlias("");

        // Làm mới danh sách từ bảng key_pairs sau khi backend đã insert thành công
        await fetchKeys();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi hệ thống.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Security Keys</h1>
        <p className="text-slate-500">
          Quản lý các cặp khóa bảo mật được lưu trữ trong hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form tạo khóa */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="font-semibold flex items-center gap-2">
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
                  placeholder="e.g. My Server Key"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-slate-50 focus:bg-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Key type
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-slate-50 outline-none"
                >
                  <option>RSA - 2048 bit</option>
                  <option>RSA - 4096 bit</option>
                </select>
              </div>
              <button
                onClick={handleGenerateKey}
                disabled={isGenerating}
                className="w-full py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white rounded-md font-semibold text-sm disabled:opacity-50"
              >
                {isGenerating ? "⏳ Generating..." : "Generate Key"}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md">
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-sm bg-green-50 text-green-700 border border-green-200 rounded-md">
              ✅ {successMsg}
            </div>
          )}
        </div>

        {/* Danh sách khóa từ Table key_pairs */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Your Database Keys
          </h3>
          <div className="border border-slate-200 rounded-xl bg-slate-50/30 overflow-hidden shadow-inner">
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
              {savedKeys.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">
                  No keys found in database.
                </div>
              ) : (
                savedKeys.map((key) => (
                  <div
                    key={key.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="mt-1 flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full text-lg">
                          🔑
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 break-all">
                            ID: {key.id}
                          </h4>
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                            {key.key_type} • {key.key_size} bit • Created{" "}
                            {new Date(key.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hiển thị fingerprint (Public Key PEM) */}
                    <div className="relative group">
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[10px] text-slate-600 overflow-x-auto whitespace-pre border-l-4 border-indigo-400">
                        {key.fingerprint}
                      </div>
                      <button
                        onClick={() => handleCopy(key.fingerprint, key.id)}
                        className="absolute right-2 top-2 px-2 py-1 bg-white border border-slate-200 rounded shadow-sm opacity-0 group-hover:opacity-100 text-[10px] flex items-center gap-1 transition-opacity"
                      >
                        {copiedId === key.id
                          ? "✅ Copied"
                          : "📋 Copy Fingerprint"}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Verified in DB
                      </span>
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
