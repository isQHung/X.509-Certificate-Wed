import axios from "axios";
import Cookies from "js-cookie";

const rawBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

function normalizeBase(b?: string) {
    if (!b) return "/api/v1";
    // if already points to api or api/v1, use as-is
    if (b.endsWith("/api") || b.endsWith("/api/v1") || b.includes("/api/"))
        return b.replace(/\/$/, "");
    // otherwise append /api/v1
    return b.replace(/\/$/, "") + "/api/v1";
}

const BASE = normalizeBase(rawBase);

export const api = axios.create({
    baseURL: BASE,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function getErrorMessage(err: unknown) {
    if (!err) return "Unknown error";
    // axios error shape
    const anyErr = err as any;
    if (anyErr?.response?.data?.message) return anyErr.response.data.message;
    if (anyErr?.response?.data?.error) return anyErr.response.data.error;
    if (anyErr?.message) return anyErr.message;
    return String(err);
}

export default api;
