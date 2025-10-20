import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext.jsx'; // YENİ

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClientProvider> {/* YENİ: Tüm uygulama artık client verilerine erişebilir */}
        <App />
      </ClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);