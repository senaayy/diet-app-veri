// src/layouts/DietitianLayout.jsx - Hata Düzeltilmiş Hali

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, List, ClipboardCheck, LogOut } from 'lucide-react';
import { useClients } from '../context/ClientContext';

// ... (COLORS objesi aynı kalacak) ...

function DietitianLayout({ onLogout }) { 
  const { clients } = useClients();
  const pendingApprovalCount = clients.reduce((sum, c) => sum + (c.pendingApprovals?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-4"> 
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-text-dark mb-2">Diyetisyen Portalı</h1>
        <p className="text-text-medium">Danışan Takip ve Analiz Merkezi</p>
      </div>

      <nav className="flex justify-center gap-4 mb-8 flex-wrap">
        <NavLink
          to="/dietitian/dashboard"
          className={({ isActive }) =>
            `px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm ${
              isActive
                ? 'bg-primary text-text-dark scale-105 shadow-md' 
                : 'bg-background-white text-text-dark hover:bg-background-light' 
            }`
          }
        >
          <Users size={20} /> Dashboard
        </NavLink>
        <NavLink
          to="/dietitian/clients"
          className={({ isActive }) =>
            `px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm ${
              isActive
                ? 'bg-primary border-primary text-text-dark scale-105 shadow-md'
                : 'bg-background-white text-text-dark hover:bg-background-light'
            }`
          }
        >
          <List size={20} /> Danışanlar
        </NavLink>
        {/* HATA BURADAYDI, ŞİMDİ DÜZELTİLDİ */}
        <NavLink
          to="/dietitian/approvals"
          className={({ isActive }) =>
            `relative px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm ${
              isActive
                ? 'bg-primary border-primary text-text-dark scale-105 shadow-md'
                : 'bg-background-white text-text-dark hover:bg-background-light'
            }` // className prop'u burada kapanıyor
          }
        >
          <ClipboardCheck size={20} /> Onay Bekleyenler
          {pendingApprovalCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-error text-background-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              {pendingApprovalCount}
            </span>
          )}
        </NavLink>

        {/* ... (Çıkış Yap butonu aynı kalacak) ... */}
        <button 
            onClick={onLogout} 
            className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 bg-background-light text-text-dark hover:bg-divider shadow-sm"
        >
            <LogOut size={18} /> Çıkış Yap
        </button>
      </nav>

      <main>
        <Outlet /> 
      </main>
    </div>
  );
}

export default DietitianLayout;