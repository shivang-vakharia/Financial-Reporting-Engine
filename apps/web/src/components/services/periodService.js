import { api } from "./api";

export async function getPeriods(companyId) {
    return api(`/companies/${companyId}/periods`);
}

export async function createPeriod(companyId, payload) {
    return api(`/companies/${companyId}/periods`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updatePeriod(periodId, payload) {
    return api(`/periods/${periodId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deletePeriod(periodId) {
    return api(`/periods/${periodId}`, {
        method: "DELETE",
    });
}