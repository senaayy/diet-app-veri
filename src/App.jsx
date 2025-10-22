// src/App.jsx - Import Yolu Düzeltilmiş Hali

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DietitianLayout from './layouts/DietitianLayout.jsx';

// Diyetisyen Sayfaları
import DietitianDashboard from './pages/dietitian/DietitianDashboard.jsx';
import ClientsList from './pages/dietitian/ClientsList.jsx';
import OnayListesi from './pages/dietitian/OnayListesi.jsx';

// Danışan Sayfaları ve Ortak Bileşenler
import Login from './pages/Login.jsx';
// BURADAKİ İMPORT YOLU SİZİN DOSYA YAPINIZA GÖRE DÜZELTİLDİ:
import ClientMenuView from "./pages/dietitian/client/ClientMenuView.jsx"; // <-- DÜZELTİLDİ!
import WeeklyMenuTracker from './components/WeeklyMenuTracker.jsx'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background-light text-text-dark">
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-text-dark">
      <Routes>
        <Route path="/" element={
          currentUser.role === 'dietitian'
            ? <Navigate to="/dietitian/dashboard" />
            : <Navigate to={`/client/${currentUser.clientId}/menu`} />
        } />

        {currentUser.role === 'dietitian' && (
          <Route path="/dietitian" element={<DietitianLayout onLogout={handleLogout} />}>
            <Route path="dashboard" element={<DietitianDashboard />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:clientId/menu" element={<WeeklyMenuTracker />} /> 
            <Route path="approvals" element={<OnayListesi />} />
          </Route>
        )}

        {currentUser.role === 'client' && (
          <Route 
            path="/client/:clientId/menu" 
            element={<ClientMenuView currentUser={currentUser} onLogout={handleLogout} />} 
          />
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;