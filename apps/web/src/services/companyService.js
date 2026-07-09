import { api } from "./api";

export async function getCompanies() {
    return api("/companies");
}

export async function createCompany(payload) {
    return api("/companies", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateCompany(id, payload) {
    return api(`/companies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteCompany(id) {
    return api(`/companies/${id}`, {
        method: "DELETE",
    });
}