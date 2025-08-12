// src/api.js
const API_BASE = import.meta.env.VITE_API_URL || '';

if (!API_BASE) console.warn('API adresa není nastavená.');

function join(base, path) {
  return `${String(base).replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

export async function apiGet(path) {
  const r = await fetch(join(API_BASE, path), { credentials: 'include' });
  return r.json();
}
export async function apiPost(path, body) {
  const r = await fetch(join(API_BASE, path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  return r.json();
}
