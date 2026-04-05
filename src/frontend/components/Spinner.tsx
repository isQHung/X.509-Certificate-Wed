"use client";
import { useLoading } from "@/context/LoadingContext";

export default function Spinner() {
    const { loading } = useLoading();
    if (!loading) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="p-4 bg-white rounded-lg shadow-lg flex items-center gap-3">
                <svg
                    className="animate-spin h-6 w-6 text-indigo-600"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>
                <span className="font-medium text-slate-700">Đang tải...</span>
            </div>
        </div>
    );
}
