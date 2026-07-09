import { api } from "./api";

export async function getUploads(periodId) {
    return api(`/periods/${periodId}/uploads`);
}