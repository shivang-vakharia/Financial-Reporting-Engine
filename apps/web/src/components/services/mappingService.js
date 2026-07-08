import { api } from "./api";

export async function getMapping(periodId) {
    return api(`/periods/${periodId}/mapping-results`);
}

export async function updateMapping(mappingId, periodId, scheduleLineId) {
    return api(`/periods/${periodId}/mapping-results/${mappingId}`, {
        method: "PATCH",
        body: JSON.stringify({
            scheduleLineId,
        }),
    });
}