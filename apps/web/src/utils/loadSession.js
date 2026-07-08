export default function loadSession() {
    try {
      return JSON.parse(localStorage.getItem('fre-session') || 'null');
    } catch {
      return null;
    }
  }