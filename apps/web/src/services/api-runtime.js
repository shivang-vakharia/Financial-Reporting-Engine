let token = '';

// Resolve API base URL in priority order:
// 1. Vite build-time env: import.meta.env.VITE_API_URL
// 2. Runtime-injected window.__ENV__.VITE_API_URL or window.__API_URL__
// 3. Fallback to relative "/api" (Vercel rewrites can proxy this to backend)
const apiBaseUrl = (() => {
  try {
    if (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      const v = import.meta.env.VITE_API_URL;
      if (v && v !== 'VITE_API_URL') return v;
    }
  } catch (e) {
    // ignore
  }
  if (typeof window !== 'undefined') {
    if (window.__ENV__ && window.__ENV__.VITE_API_URL) return window.__ENV__.VITE_API_URL;
    if (window.__API_URL__) return window.__API_URL__;
  }
  // default to relative path which works if vercel.json rewrites /api/* to backend
  return '/api';
})();

export function setToken(value) {
  token = value || '';
}

export async function api(path, options = {}) {
  const headers = options.isForm ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed.');
  }
  return payload;
}

export async function downloadFile(path, fallbackFileName) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBaseUrl}${path}`, { headers });
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    throw new Error(payload?.error || 'Download failed.');
  }
  const blob = await response.blob();
  const fileName = getFileName(response.headers.get('content-disposition')) || fallbackFileName || 'financial-report.xlsx';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getFileName(contentDisposition) {
  if (!contentDisposition) return '';
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || '';
}
