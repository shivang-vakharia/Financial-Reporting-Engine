import { setToken } from "./api";

export function setAuthSession(session) {
    setToken(session.token);
}

export function clearAuthSession() {
    setToken(null);
}