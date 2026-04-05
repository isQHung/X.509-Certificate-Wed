"use client";
import { useApi } from "@/lib/useApi";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

type StoredKey = {
    id: string;
    alias: string;
    privatePem: string;
    publicPem: string;
};

export default function UserKeysPage() {
    const [alg, setAlg] = useState("rsa-4096");
    const [alias, setAlias] = useState("");
    const [keys, setKeys] = useState<StoredKey[]>([]);
    const { call } = useApi();

    useEffect(() => {
        const raw = localStorage.getItem("x509:keys");
        if (raw) setKeys(JSON.parse(raw));
    }, []);

    const persist = (list: StoredKey[]) => {
        setKeys(list);
        localStorage.setItem("x509:keys", JSON.stringify(list));
    };

    function arrayBufferToPem(buffer: ArrayBuffer, label = "PRIVATE KEY") {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++)
            binary += String.fromCharCode(bytes[i]);
        const b64 = btoa(binary);
        const lines = b64.match(/.{1,64}/g) || [];
        return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
    }

    async function generateRSA(bits = 4096) {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: bits,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256",
            },
            true,
            ["sign", "verify"],
        );

        const pkcs8 = await window.crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey,
        );
        const spki = await window.crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey,
        );
        const privatePem = arrayBufferToPem(pkcs8, "PRIVATE KEY");
        const publicPem = arrayBufferToPem(spki, "PUBLIC KEY");
        return { privatePem, publicPem };
    }

    const handleGenerate = async () => {
        await call(async () => {
            const bits = alg === "rsa-2048" ? 2048 : 4096;
            const { privatePem, publicPem } = await generateRSA(bits);
            const id = String(Date.now());
            const entry: StoredKey = {
                id,
                alias: alias || `key-${id}`,
                privatePem,
                publicPem,
            };
            const next = [entry, ...keys];
            persist(next);
            const blob = new Blob([privatePem], {
                type: "application/octet-stream",
            });
            saveAs(blob, `${entry.alias}.key`);
            return { message: "Đã tạo và tải xuống khóa riêng" };
        });
    };

    const handleDownload = (k: StoredKey) => {
        const blob = new Blob([k.privatePem], {
            type: "application/octet-stream",
        });
        saveAs(blob, `${k.alias}.key`);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý cặp khóa
                    </h1>
                    <p className="text-sm text-slate-500">
                        Tạo và lưu trữ các khóa bí mật để ký yêu cầu chứng chỉ.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form tạo khóa */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
                    <h3 className="font-bold text-slate-800">Tạo khóa mới</h3>
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">
                            Thuật toán
                        </label>
                        <select
                            value={alg}
                            onChange={(e) => setAlg(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                        >
                            <option value="rsa-2048">RSA - 2048 bit</option>
                            <option value="rsa-4096">RSA - 4096 bit</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">
                            Tên gợi nhớ (Alias)
                        </label>
                        <input
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            type="text"
                            placeholder="Ví dụ: My Laptop Key"
                            className="w-full p-2 border rounded-lg text-sm"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                        Phát sinh cặp khóa
                    </button>
                    <p className="text-[10px] text-slate-400 italic text-center">
                        Lưu ý: Private Key sẽ được lưu an toàn trong trình duyệt
                        (chỉ minh họa).
                    </p>
                </div>

                {/* Danh sách khóa hiện có */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-sm text-slate-700">
                            Khóa đã lưu
                        </h3>
                    </div>
                    <div className="p-4">
                        {keys.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <span className="text-3xl opacity-20">🗝️</span>
                                <p className="text-sm text-slate-400">
                                    Bạn chưa có cặp khóa nào. Hãy tạo một cái để
                                    bắt đầu.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 p-4">
                                {keys.map((k) => (
                                    <div
                                        key={k.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <div className="font-mono text-sm font-bold">
                                                {k.alias}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                ID: {k.id}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleDownload(k)
                                                }
                                                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
