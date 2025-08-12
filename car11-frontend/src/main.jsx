// --- API fetch rewrite (nahoru souboru) ---
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

if (!API_BASE) {
  console.warn('API adresa není nastavená (VITE_API_URL).');
}

// uložíme původní fetch
const __origFetch = window.fetch.bind(window);

// přepíšeme fetch: když URL začíná na /api, přilepíme doménu backendu
window.fetch = (input, init = {}) => {
  let url = typeof input === 'string' ? input : input?.url || '';

  if (url.startsWith('/api')) {
    const joined = `${API_BASE.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    if (typeof input === 'string') {
      input = joined;
    } else {
      input = new Request(joined, input);
    }
  }

  // vždy posílej cookies, pokud je používáš
  init = { credentials: 'include', ...init };

  return __origFetch(input, init);
};
// --- /API fetch rewrite ---


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
const __API_BASE__ = import.meta.env.VITE_API_URL || '';
const __origFetch__ = window.fetch;
window.fetch = (input, init) => {
  try {
    if (typeof input === 'string' && input.startsWith('/api')) {
      input = __API_BASE__ + input;
    }
  } catch (e) {}
  return __origFetch__(input, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
