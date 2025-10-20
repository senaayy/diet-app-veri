// src/layouts/DietitianLayout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, List, ClipboardCheck, LogOut } from 'lucide-react';
import { useClients } from '../context/ClientContext';

function DietitianLayout() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const pendingApprovalCount = clients.reduce((sum, c) => sum + (c.pendingApprovals?.length || 0), 0);

  // Aktif link için stil objesi
  const activeLinkStyle = {
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: 'white',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  // Basit bir çıkış fonksiyonu simülasyonu
  const handleLogout = () => {
    // Gerçek bir uygulamada burada token silme, state temizleme vb. olur.
    // Şimdilik sadece ana sayfaya yönlendiriyoruz.
    navigate('/'); 
    // Veya bir login sayfanız olsaydı: navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Diyetisyen Portalı</h1>
        <p className="text-gray-600">Danışan Takip ve Analiz Merkezi</p>
      </div>

      <nav className="flex justify-center gap-4 mb-8 flex-wrap">
        <NavLink
          to="/dietitian/dashboard"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <Users size={20} /> Dashboard
        </NavLink>
        <NavLink
          to="/dietitian/clients"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <List size={20} /> Danışanlar
        </NavLink>
        <NavLink
          to="/dietitian/approvals" // <-- TIKLANINCA GİDECEĞİ ADRES BURASI
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          className="relative px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <ClipboardCheck size={20} /> Onay Bekleyenler
          {pendingApprovalCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">{pendingApprovalCount}</span>}
        </NavLink>

        {/* Bonus: Profesyonel bir görünüm için Çıkış Yap butonu ekledim */}
        <button 
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
        >
            <LogOut size={18} /> Çıkış Yap
        </button>
      </nav>

      <main>
        {/* Router'daki iç içe route'lar burada render edilecek */}
        <Outlet /> 
      </main>
    </div>
  );
}

export default DietitianLayout;