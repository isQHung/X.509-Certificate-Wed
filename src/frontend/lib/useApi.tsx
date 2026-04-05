"use client";
import { useLoading } from "@/context/LoadingContext";
import { getErrorMessage } from "@/lib/apiClient";
import { useCallback } from "react";
import { toast } from "react-toastify";

export function useApi() {
    const { setLoading } = useLoading();

    const call = useCallback(
        async (fn: (...args: any[]) => Promise<any>, ...args: any[]) => {
            try {
                setLoading(true);
                const res = await fn(...args);
                toast.success((res && res.message) || "Thao tác thành công");
                return res;
            } catch (err) {
                const msg = getErrorMessage(err);
                toast.error(msg || "Có lỗi xảy ra");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setLoading],
    );

    return { call };
}
