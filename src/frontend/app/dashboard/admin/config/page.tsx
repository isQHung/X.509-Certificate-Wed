"use client";
import { getAllSystemConfigs, updateSystemConfig } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { useEffect, useState } from "react";

export default function ConfigTechnicalPage() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const { call } = useApi();

    const fetch = async () => {
        try {
            const data = await call(getAllSystemConfigs);
            setConfigs(Array.isArray(data) ? data : []);
            setSelected(Array.isArray(data) && data.length ? data[0] : null);
        } catch (err) {
            setConfigs([]);
            setSelected(null);
        }
    };

    useEffect(() => {
        void fetch();
    }, []);

    const handleSave = async () => {
        if (!selected || !selected.id) return;
        const payload = {
            name: selected.name,
            key_algorithm: selected.key_algorithm,
            key_size: Number(selected.key_size) || 2048,
            signature_algorithm: selected.signature_algorithm,
            hash_algorithm: selected.hash_algorithm,
            default_validity_days:
                Number(selected.default_validity_days) || 365,
        };
        try {
            await call(updateSystemConfig, selected.id, payload);
            await fetch();
        } catch (err) {}
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">
                    Cấu hình kỹ thuật
                </h1>
                <p className="text-sm text-slate-500">
                    Thiết lập thuật toán và thông số bảo mật cho toàn hệ thống
                    PKI.
                </p>
            </header>

            <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-8">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                        Chọn cấu hình
                    </label>
                    <select
                        value={selected?.id ?? ""}
                        onChange={(e) =>
                            setSelected(
                                configs.find((c) => c.id === e.target.value) ??
                                    null,
                            )
                        }
                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                    >
                        <option value="">-- Chọn cấu hình --</option>
                        {configs.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selected ? (
                    <>
                        <section className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">
                                Tiêu chuẩn mã hóa
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">
                                        Thuật toán ký
                                    </label>
                                    <select
                                        value={selected.key_algorithm ?? "RSA"}
                                        onChange={(e) =>
                                            setSelected({
                                                ...selected,
                                                key_algorithm: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                                    >
                                        <option value="RSA">
                                            RSA (Recommended)
                                        </option>
                                        <option value="ECDSA">ECDSA</option>
                                        <option value="EdDSA">EdDSA</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">
                                        Độ dài khóa (bits)
                                    </label>
                                    <select
                                        value={selected.key_size ?? 2048}
                                        onChange={(e) =>
                                            setSelected({
                                                ...selected,
                                                key_size: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                                    >
                                        <option value={2048}>2048</option>
                                        <option value={3072}>3072</option>
                                        <option value={4096}>4096</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">
                                Hiệu lực chứng chỉ
                            </h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">
                                    Thời gian hết hạn mặc định (Ngày)
                                </label>
                                <input
                                    type="number"
                                    value={
                                        selected.default_validity_days ?? 365
                                    }
                                    onChange={(e) =>
                                        setSelected({
                                            ...selected,
                                            default_validity_days: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                                />
                            </div>
                        </section>

                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                        >
                            Lưu cấu hình & Áp dụng
                        </button>
                    </>
                ) : (
                    <div className="text-sm text-slate-500 italic">
                        Chưa có cấu hình nào được chọn.
                    </div>
                )}
            </div>
        </div>
    );
}