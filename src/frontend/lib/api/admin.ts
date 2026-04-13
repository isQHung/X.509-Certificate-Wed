import api from "@/lib/apiClient";

export async function listPendingCSRs() {
    const res = await api.get(`/approve/list`);
    return res.data;
}

export async function approveCSR(id: string) {
    const res = await api.post(`/approve/${id}/approve`);
    return res.data;
}

export async function rejectCSR(id: string) {
    const res = await api.post(`/approve/${id}/reject`);
    return res.data;
}

export async function generateCRL() {
    const res = await api.get(`/crl`);
    return res.data;
}

export async function getLatestCRL() {
    const res = await api.get(`/crl/latest`);
    return res.data;
}

export async function getRootCertificate() {
    const res = await api.get(`/root_ca/certificate`);
    return res.data;
}

export async function revokeRootCA() {
    const res = await api.post(`/admin/root/revoke`);
    return res.data;
}

export async function getAuditLogs(params: Record<string, any> = {}) {
    const res = await api.get(`/audit_logs/`, { params });
    return res.data;
}

export async function listPendingRevocations() {
    const res = await api.get(`/admin/revoke/list`);
    return res.data;
}

export async function approveRevocation(serial: string) {
    const res = await api.post(`/admin/revoke/${serial}/approve`);
    return res.data;
}

export async function rejectRevocation(serial: string) {
    const res = await api.post(`/admin/revoke/${serial}/reject`);
    return res.data;
}

// System config endpoints
export async function getAllSystemConfigs() {
    const res = await api.get(`/system_config/`);
    return res.data;
}

export async function updateSystemConfig(id: string, payload: any) {
    const res = await api.put(`/system_config/${id}`, payload);
    return res.data;
}