"use client";

import { getAuditLogs } from "@/lib/api/admin";
import { useEffect, useState } from "react";

type AuditLogItem = {
    id: number;
    actor_id?: string | null;
    actor_name?: string | null;
    action: string;
    target_type?: string | null;
    target_id?: string | null;
    target_name?: string | null;
    metadata?: unknown;
    created_at: string;
};

type AuditLogResponse = {
    data?: AuditLogItem[];
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
};

const defaultFilters = {
    action: "",
    target_type: "",
    target_id: "",
    actor_id: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
};

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function formatMetadata(value: unknown) {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function getMetadataPreview(value: unknown): string {
    const formatted = formatMetadata(value);
    if (formatted === "-") return "-";
    
    const lines = formatted.split("\n");
    if (lines.length <= 1) {
        return formatted;
    }
    
    // Chỉ lấy dòng đầu tiên
    const firstLine = lines[0];
    if (firstLine.length > 50) {
        return firstLine.substring(0, 50) + "...";
    }
    return firstLine + (lines.length > 1 ? " ..." : "");
}

function getActionTone(action: string) {
    const upper = action.toUpperCase();
    if (
        upper.includes("DELETE") ||
        upper.includes("REVOKE") ||
        upper.includes("REJECT")
    ) {
        return "bg-red-50 text-red-700 border-red-100";
    }
    if (
        upper.includes("CREATE") ||
        upper.includes("APPROVE") ||
        upper.includes("ISSUE")
    ) {
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (upper.includes("UPDATE") || upper.includes("EDIT")) {
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function AdminAuditLogsPage() {
    const [items, setItems] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState(defaultFilters);
    const [draft, setDraft] = useState(defaultFilters);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const fetchLogs = async (
        nextPage = page,
        nextLimit = limit,
        nextFilters = filters,
    ) => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, string | number> = {
                page: nextPage,
                limit: nextLimit,
                sort_by: nextFilters.sort_by,
                sort_order: nextFilters.sort_order,
            };

            if (nextFilters.action.trim()) {
                params.action = nextFilters.action.trim();
            }
            if (nextFilters.target_type.trim()) {
                params.target_type = nextFilters.target_type.trim();
            }
            if (nextFilters.target_id.trim()) {
                params.target_id = nextFilters.target_id.trim();
            }
            if (nextFilters.actor_id.trim()) {
                params.actor_id = nextFilters.actor_id.trim();
            }
            if (nextFilters.date_from.trim()) {
                params.date_from = nextFilters.date_from.trim();
            }
            if (nextFilters.date_to.trim()) {
                params.date_to = nextFilters.date_to.trim();
            }

            const response = (await getAuditLogs(params)) as
                | AuditLogResponse
                | AuditLogItem[];
            const payload = Array.isArray(response) ? { data: response } : response;

            setItems(Array.isArray(payload?.data) ? payload.data : []);
            setTotal(Number(payload?.total || 0));
            setPage(Number(payload?.page || nextPage));
            setLimit(Number(payload?.limit || nextLimit));
            setTotalPages(Number(payload?.total_pages || 0));
            setExpandedRows(new Set()); // Reset expanded rows when fetching new data
        } catch (err: any) {
            setItems([]);
            setTotal(0);
            setTotalPages(0);
            setError(
                err?.response?.data?.error ||
                    err?.message ||
                    "Không thể tải audit log.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchLogs(1, limit, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFilters(draft);
        await fetchLogs(1, limit, draft);
    };

    const handleReset = async () => {
        setDraft(defaultFilters);
        setFilters(defaultFilters);
        await fetchLogs(1, 10, defaultFilters);
    };

    const goToPage = async (nextPage: number) => {
        if (nextPage < 1) return;
        if (totalPages > 0 && nextPage > totalPages) return;
        await fetchLogs(nextPage, limit, filters);
    };

    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = total === 0 ? 0 : Math.min(page * limit, total);

    const toggleExpandRow = (logId: number) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            } else {
                newSet.add(logId);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <header className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Nhật ký hệ thống
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Theo dõi mọi hành động quan trọng trong hệ thống PKI, bao gồm thao tác người dùng, phê duyệt, thu hồi và thay đổi cấu hình.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => void fetchLogs(page, limit, filters)}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            ↻ Làm mới
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Tổng bản ghi
                        </p>
                        <p className="text-3xl font-black text-slate-900 mt-2">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Trang hiện tại
                        </p>
                        <p className="text-3xl font-black text-indigo-600 mt-2">
                            {page}/{totalPages || 1}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Hiển thị
                        </p>
                        <p className="text-3xl font-black text-emerald-600 mt-2">
                            {startItem}-{endItem}
                        </p>
                    </div>
                </div>
            </header>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Bộ lọc
                    </h2>
                    <p className="text-sm text-slate-500">
                        Lọc theo hành động, đối tượng, actor, hoặc khoảng thời gian.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Action
                        </span>
                        <input
                            value={draft.action}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    action: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                            placeholder="CREATE_CERTIFICATE"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Target type
                        </span>
                        <input
                            value={draft.target_type}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    target_type: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                            placeholder="certificate_requests"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Target ID
                        </span>
                        <input
                            value={draft.target_id}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    target_id: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                            placeholder="UUID hoặc serial"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Actor ID
                        </span>
                        <input
                            value={draft.actor_id}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    actor_id: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                            placeholder="UUID người thực hiện"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Từ ngày
                        </span>
                        <input
                            type="datetime-local"
                            value={draft.date_from}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    date_from: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Đến ngày
                        </span>
                        <input
                            type="datetime-local"
                            value={draft.date_to}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    date_to: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Sắp xếp theo
                        </span>
                        <select
                            value={draft.sort_by}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    sort_by: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                        >
                            <option value="created_at">created_at</option>
                            <option value="action">action</option>
                            <option value="target_type">target_type</option>
                            <option value="target_id">target_id</option>
                            <option value="actor_id">actor_id</option>
                        </select>
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Thứ tự
                        </span>
                        <select
                            value={draft.sort_order}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    sort_order: e.target.value as "asc" | "desc",
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                        >
                            <option value="desc">Mới nhất trước</option>
                            <option value="asc">Cũ nhất trước</option>
                        </select>
                    </label>

                    <div className="flex items-end gap-3 md:col-span-2 xl:col-span-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {loading ? "Đang tải..." : "Áp dụng bộ lọc"}
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleReset()}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Xóa
                        </button>
                    </div>
                </form>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Danh sách audit log
                        </h2>
                        <p className="text-sm text-slate-500">
                            Mỗi dòng là một sự kiện đã được ghi nhận trong hệ thống.
                        </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-semibold">Số dòng</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                const nextLimit = Number(e.target.value);
                                setLimit(nextLimit);
                                void fetchLogs(1, nextLimit, filters);
                            }}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </label>
                </div>

                {error ? (
                    <div className="m-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Actor</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading && items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-14 text-center text-slate-500"
                                    >
                                        Đang tải audit log...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-14 text-center text-slate-500"
                                    >
                                        Không có bản ghi nào phù hợp với bộ lọc hiện tại.
                                    </td>
                                </tr>
                            ) : (
                                items.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-slate-50/80 transition-colors align-top"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                            {formatDateTime(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${getActionTone(
                                                    log.action,
                                                )}`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {log.actor_name || "Unknown User"}
                                                    </div>
                                                    <div className="font-mono text-xs text-slate-500 break-all">
                                                        {log.actor_id && log.actor_id.length > 0 ? `${log.actor_id.substring(0, 8)}...` : "-"}
                                                    </div>
                                                </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {log.target_name || log.target_type || "-"}
                                                    </div>
                                                    <div className="font-mono text-xs text-slate-500 break-all">
                                                        {log.target_id && log.target_id.length > 0 ? (log.target_id.length > 8 ? `${log.target_id.substring(0, 8)}...` : log.target_id) : "-"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[28rem]">
                                            {formatMetadata(log.metadata) === "-" ? (
                                                <span className="text-slate-400">-</span>
                                            ) : (
                                                <div className="space-y-2">
                                                    {expandedRows.has(log.id) ? (
                                                        <pre className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] leading-5 text-slate-600 font-mono overflow-y-auto max-h-96">
                                                            {formatMetadata(log.metadata)}
                                                        </pre>
                                                    ) : (
                                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 font-mono cursor-pointer hover:bg-slate-100 transition max-h-8 overflow-hidden">
                                                            {getMetadataPreview(log.metadata)}
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => toggleExpandRow(log.id)}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                                                    >
                                                        {expandedRows.has(log.id) ? "▼ Thu gọn" : "▶ Xem thêm"}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-500">
                        {total === 0
                            ? "Không có dữ liệu để hiển thị."
                            : `Đang hiển thị ${startItem}-${endItem} trong tổng số ${total.toLocaleString(
                                  "vi-VN",
                              )} bản ghi.`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => void goToPage(page - 1)}
                            disabled={loading || page <= 1}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trang trước
                        </button>
                        <span className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                            {page}/{totalPages || 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => void goToPage(page + 1)}
                            disabled={
                                loading || (totalPages > 0 && page >= totalPages)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}