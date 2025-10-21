// src/context/ClientContext.jsx - DÜZELTILMIŞ

import React, { createContext, useState, useEffect, useContext } from 'react';

const ClientContext = createContext();

export const useClients = () => {
  return useContext(ClientContext);
};

// Güvenli JSON parse fonksiyonu
const safeJsonParse = (data, fallback = []) => {
  if (!data) return fallback;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn('JSON parse hatası:', e);
      return fallback;
    }
  }
  return data;
};

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/clients');

        if (!response.ok) {
          throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();

        const formattedData = data.map(client => ({
          ...client,
          allergens: client.allergens ? JSON.parse(client.allergens) : [],
          weeklyProgress: client.weeklyProgress ? JSON.parse(client.weeklyProgress) : [],
          weeklyMenu: client.weeklyMenu ? JSON.parse(client.weeklyMenu) : { 
            monday: [], 
            tuesday: [], 
            wednesday: [] 
          },
          pendingApprovals: client.pendingApprovals ? JSON.parse(client.pendingApprovals) : [],
          notifications: [],
        }));

        setClients(formattedData);
        setError(null);

      } catch (err) {
        console.error("API'dan veri çekerken hata oluştu:", err);
        setError("Danışan verileri yüklenemedi. Lütfen backend sunucunuzun çalıştığından emin olun.");

      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // ✅ Yeni danışan ekle ve state'i güncelleyin
  const addClient = (newClient) => {
    const formattedClient = {
      ...newClient,
      allergens: typeof newClient.allergens === 'string' 
        ? JSON.parse(newClient.allergens) 
        : newClient.allergens || [],
      weeklyProgress: typeof newClient.weeklyProgress === 'string'
        ? JSON.parse(newClient.weeklyProgress)
        : newClient.weeklyProgress || [],
      weeklyMenu: typeof newClient.weeklyMenu === 'string'
        ? JSON.parse(newClient.weeklyMenu)
        : newClient.weeklyMenu || { monday: [], tuesday: [], wednesday: [] },
      pendingApprovals: typeof newClient.pendingApprovals === 'string'
        ? JSON.parse(newClient.pendingApprovals)
        : newClient.pendingApprovals || [],
      notifications: [],
    };
    setClients(prev => [formattedClient, ...prev]);
  };

  // ✅ Onay işle
  const handleApproval = async (clientId, approvalId, action) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const updatedApprovals = client.pendingApprovals.filter(a => a.id !== approvalId);

      // Backend'e gönder
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingApprovals: updatedApprovals }),
      });

      if (!response.ok) throw new Error('Onay işlemi başarısız');

      const updatedClient = await response.json();

      // State güncelle
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? {
              ...c,
              pendingApprovals: typeof updatedClient.pendingApprovals === 'string'
                ? JSON.parse(updatedClient.pendingApprovals)
                : updatedClient.pendingApprovals || [],
            }
          : c
      ));

      alert(action === 'approve' ? 'Onaylandı ✓' : 'Reddedildi ✗');
    } catch (error) {
      console.error('Hata:', error);
      alert('İşlem başarısız oldu');
    }
  };

  const value = {
    clients,
    setClients,
    loading,
    error,
    addClient,
    handleApproval,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};