import { api } from "./api";

export async function getScheduleLines() {
    return api("/schedule-lines");
}