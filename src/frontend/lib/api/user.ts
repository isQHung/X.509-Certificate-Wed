import api from "@/lib/apiClient";

type SubjectPayload = Partial<{
    CN: string;
    O: string;
    OU: string;
    C: string;
    ST: string;
    L: string;
}>;

export type CreateCsrByUploadPayload = {
    csr_pem: string;
};

export type CreateCsrByGeneratePayload = {
    alias: string;
    subject: SubjectPayload;
    san?: string[];
    key_algorithm?: "RSA" | "EC";
    key_size?: number;
    validity_days?: number;
};

export async function createCSR(
    payload: CreateCsrByUploadPayload | CreateCsrByGeneratePayload,
) {
    const res = await api.post("/cert_request", payload);
    return res.data;
}

export async function generateKeyPair(payload: {
    alias: string;
    key_algorithm?: "RSA" | "EC";
    key_size?: number;
}) {
    const res = await api.post("/keys/generate", payload);
    return res.data;
}

export async function cancelCSR(reqId: string) {
    const res = await api.post(`/cert_request/${reqId}/cancel`);
    return res.data;
}

export async function requestRevocation(serial: string, reason?: string) {
    const res = await api.post(`/user/revoke/${serial}/request`, { reason });
    return res.data;
}

export async function cancelRevocation(serial: string) {
    const res = await api.post(`/user/revoke/${serial}/cancel`);
    return res.data;
}

export async function downloadCertificate(serial: string) {
    const res = await api.get(`/certificates/${serial}`, {
        responseType: "blob",
    });
    return res.data;
}