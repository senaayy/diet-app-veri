// src/layouts/DietitianLayout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, List, ClipboardCheck, LogOut } from 'lucide-react';
import { useClients } from '../context/ClientContext';

function DietitianLayout() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const pendingApprovalCount = clients.reduce((sum, c) => sum + (c.pendingApprovals?.length || 0), 0);

  // NOT: activeLinkStyle objesini kaldırıp, NavLink'in className prop'u içinde Tailwind sınıflarıyla yöneteceğiz.

  // Basit bir çıkış fonksiyonu simülasyonu
  const handleLogout = () => {
    // Gerçek bir uygulamada burada token silme, state temizleme vb. olur.
    navigate('/'); 
  };

  return (
    <div className="max-w-7xl mx-auto p-4"> {/* Genel layout padding'i eklendi */}
      <div className="text-center mb-8">
        {/* Başlık ve alt başlık renklerini güncelledik */}
        <h1 className="text-4xl font-bold text-text-dark mb-2">Diyetisyen Portalı</h1>
        <p className="text-text-medium">Danışan Takip ve Analiz Merkezi</p>
      </div>

      <nav className="flex justify-center gap-4 mb-8 flex-wrap">
        {/* NavLink'leri güncelledik */}
        <NavLink
          to="/dietitian/dashboard"
          className={({ isActive }) =>
            `px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm ${
              isActive
                ? 'bg-primary text-text-dark scale-105 shadow-md' // Aktif durum: Yeşil arka plan, koyu metin
                : 'bg-background-white text-text-dark hover:bg-background-light' // Pasif durum: Beyaz arka plan, koyu metin, açık gri hover
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
                ? 'bg-primary text-text-dark scale-105 shadow-md'
                : 'bg-background-white text-text-dark hover:bg-background-light'
            }`
          }
        >
          <List size={20} /> Danışanlar
        </NavLink>
        <NavLink
          to="/dietitian/approvals"
          className={({ isActive }) =>
            `relative px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm ${
              isActive
                ? 'bg-primary text-text-dark scale-105 shadow-md'
                : 'bg-background-white text-text-dark hover:bg-background-light'
            }`
          }
        >
          <ClipboardCheck size={20} /> Onay Bekleyenler
          {pendingApprovalCount > 0 && (
            // Onay bekleyenler sayacı için hata rengimizi kullandık
            <span className="absolute -top-2 -right-2 bg-error text-background-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              {pendingApprovalCount}
            </span>
          )}
        </NavLink>

        {/* Çıkış Yap butonu için nötr renklerimizi kullandık */}
        <button 
            onClick={handleLogout}
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