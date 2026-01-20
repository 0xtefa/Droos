import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { registerServiceWorker } from './utils/serviceWorker.js';

document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA capabilities
if (import.meta.env.PROD) {
  registerServiceWorker();
}
