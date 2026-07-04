let token = '';
const apiBaseUrl = 'http://localhost:4000';

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
