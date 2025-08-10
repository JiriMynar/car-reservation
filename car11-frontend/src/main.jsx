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
