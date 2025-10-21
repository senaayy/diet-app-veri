// src/context/ClientContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

const ClientContext = createContext();

export const useClients = () => {
  return useContext(ClientContext);
};

// Güvenli JSON parse fonksiyonu
const parseJsonSafe = (data, defaultValue) => {
  if (!data) return defaultValue;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }
  return data;
};

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Danışanları fetch et
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/clients');
        if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);

        const data = await response.json();

        const formattedData = data.map(client => ({
          ...client,
          allergens: parseJsonSafe(client.allergens, []),
          weeklyProgress: parseJsonSafe(client.weeklyProgress, []),
          weeklyMenu: parseJsonSafe(client.weeklyMenu, { monday: [], tuesday: [], wednesday: [] }),
          pendingApprovals: parseJsonSafe(client.pendingApprovals, []),
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

  // ✅ Yeni danışan ekle
  const addClient = async (newClient) => {
    try {
      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) throw new Error('Yeni danışan eklenemedi');

      const savedClient = await response.json();

      const formattedClient = {
        ...savedClient,
        allergens: parseJsonSafe(savedClient.allergens, []),
        weeklyProgress: parseJsonSafe(savedClient.weeklyProgress, []),
        weeklyMenu: parseJsonSafe(savedClient.weeklyMenu, { monday: [], tuesday: [], wednesday: [] }),
        pendingApprovals: parseJsonSafe(savedClient.pendingApprovals, []),
        notifications: [],
      };

      setClients(prev => [formattedClient, ...prev]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ✅ Onay işlemleri
  const handleApproval = async (clientId, approvalId, action) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const updatedApprovals = client.pendingApprovals.filter(a => a.id !== approvalId);

      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingApprovals: updatedApprovals }),
      });

      if (!response.ok) throw new Error('Onay işlemi başarısız');

      const updatedClient = await response.json();

      setClients(prev => prev.map(c =>
        c.id === clientId
          ? { ...c, pendingApprovals: parseJsonSafe(updatedClient.pendingApprovals, []) }
          : c
      ));

      alert(action === 'approve' ? 'Onaylandı ✓' : 'Reddedildi ✗');
    } catch (error) {
      console.error('Hata:', error);
      alert('İşlem başarısız oldu');
    }
  };

  // ✅ Danışan verilerini güncelle
  const updateClientData = async (clientId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Danışan güncellenemedi');

      const savedClient = await response.json();

      setClients(prevClients => prevClients.map(c =>
        c.id === clientId
          ? {
              ...c,
              ...savedClient,
              allergens: parseJsonSafe(savedClient.allergens, []),
              weeklyProgress: parseJsonSafe(savedClient.weeklyProgress, []),
              weeklyMenu: parseJsonSafe(savedClient.weeklyMenu, { monday: [], tuesday: [], wednesday: [] }),
              pendingApprovals: parseJsonSafe(savedClient.pendingApprovals, []),
            }
          : c
      ));
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert("Hata: " + error.message);
    }
  };

  const value = {
    clients,
    setClients,
    loading,
    error,
    addClient,
    handleApproval,
    updateClientData,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};
