import { api } from "./api";

export async function getReports(companyId) {

    if (companyId) {
        return api(`/companies/${companyId}/report-runs`);
    }

    return api("/report-runs");
}