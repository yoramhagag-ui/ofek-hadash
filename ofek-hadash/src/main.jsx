import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// keep Railway backend awake – ping every 4 minutes
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';
setInterval(() => fetch(`${BASE}/health`).catch(() => {}), 4 * 60 * 1000);

// force reload when new service worker takes control
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

  // check for updates every 60 seconds while app is open
  navigator.serviceWorker.ready.then(reg => {
    setInterval(() => reg.update(), 60_000);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
