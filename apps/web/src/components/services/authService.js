import { setToken } from "./api";

const STORAGE_KEY = "fre-session";

export function saveSession(session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setToken(session.token);
}

export function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
}