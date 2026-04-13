import api from "@/lib/apiClient";

export async function createCSR(payload: {
    user_id: string;
    csr_pem: string;
    subject: any;
}) {
    const res = await api.post("/cert_request", payload);
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