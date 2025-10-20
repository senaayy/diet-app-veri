// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DietitianLayout from './layouts/DietitianLayout.jsx';

// Diyetisyen Sayfaları
import DietitianDashboard from './pages/dietitian/DietitianDashboard.jsx';
import ClientsList from './pages/dietitian/ClientsList.jsx';
import OnayListesi from './pages/dietitian/OnayListesi.jsx';
import WeeklyMenuTracker from './components/WeeklyMenuTracker.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <Routes>
        {/* Ana sayfa direkt diyetisyen dashboard'una yönlendirsin */}
        <Route path="/" element={<Navigate to="/dietitian/dashboard" />} />

        {/* Diyetisyen Rotaları (Layout içinde) */}
        <Route path="/dietitian" element={<DietitianLayout />}>
          <Route path="dashboard" element={<DietitianDashboard />} />
          <Route path="clients" element={<ClientsList />} />
          <Route path="clients/:clientId/menu" element={<WeeklyMenuTracker />} />
          <Route path="approvals" element={<OnayListesi />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;