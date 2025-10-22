// src/context/ClientContext.jsx - Düzeltilmiş Hali

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

  // ✅ Tüm danışanları fetch et
  const fetchAllClients = async () => {
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

  useEffect(() => {
    fetchAllClients();
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
      return formattedClient; 
    } catch (err) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };

  // ✅ Onay işlemleri
  const handleApproval = async (clientId, approvalId, action) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const approval = client.pendingApprovals.find(a => a.id === approvalId);
      if (!approval) return;

      const updatedApprovals = client.pendingApprovals.filter(a => a.id !== approvalId);
      let updatedWeeklyMenu = JSON.parse(JSON.stringify(client.weeklyMenu)); // DEEP COPY

      if (action === 'approve') {
        const { day, mealIndex, suggestedAlternative, originalMeal } = approval; 
        if (updatedWeeklyMenu[day] && updatedWeeklyMenu[day][mealIndex] !== undefined) {
          updatedWeeklyMenu[day][mealIndex] = {
            ...suggestedAlternative, 
            id: `meal-${Date.now()}`, 
            mealType: originalMeal.mealType, 
            items: suggestedAlternative.name || suggestedAlternative.items || 'AI Önerisi', 
            calories: suggestedAlternative.calories || originalMeal.calories || 0, 
            portion: suggestedAlternative.portion || originalMeal.portion || 'AI Tarafından Belirlendi', 
            status: 'pending', 
            aiModified: true, 
          };
        }
      }

      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingApprovals: updatedApprovals,
          weeklyMenu: updatedWeeklyMenu, 
        }),
      });

      if (!response.ok) throw new Error('Onay işlemi başarısız');

      const updatedClientData = await response.json();

      // ✅ YENİ REFERANS OLUŞTUR
      setClients(prev => {
        const newClients = prev.map(c => 
          c.id === clientId
            ? {
                ...c,
                ...updatedClientData,
                allergens: parseJsonSafe(updatedClientData.allergens, []),
                weeklyProgress: parseJsonSafe(updatedClientData.weeklyProgress, []),
                weeklyMenu: parseJsonSafe(updatedClientData.weeklyMenu, { monday: [], tuesday: [], wednesday: [] }),
                pendingApprovals: parseJsonSafe(updatedClientData.pendingApprovals, []),
              }
            : c
        );
        return [...newClients]; // YENİ ARRAY REFERANSI
      });

      alert(action === 'approve' ? 'Onaylandı ✓' : 'Reddedildi ✗');
      return updatedClientData; 
    } catch (error) {
      console.error('Hata:', error);
      alert('İşlem başarısız oldu: ' + error.message);
      throw error;
    }
  };

  // ✅ DÜZELTME: Danışan verilerini güncelle - YENİ REFERANS OLUŞTUR
  const updateClientData = async (clientId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Danışan güncellenemedi');

      const savedClient = await response.json();

      // ✅ YENİ REFERANS OLUŞTUR - Bu sayede React re-render olacak
      setClients(prevClients => {
        const newClients = prevClients.map(c => 
          c.id === parseInt(clientId)
            ? {
                ...c,
                ...savedClient,
                allergens: parseJsonSafe(savedClient.allergens, []),
                weeklyProgress: parseJsonSafe(savedClient.weeklyProgress, []),
                weeklyMenu: parseJsonSafe(savedClient.weeklyMenu, { monday: [], tuesday: [], wednesday: [] }),
                pendingApprovals: parseJsonSafe(savedClient.pendingApprovals, []),
              }
            : c
        );
        return [...newClients]; // YENİ ARRAY REFERANSI - ÇOK ÖNEMLİ!
      });

      return savedClient; 
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert("Hata: " + error.message);
      throw error;
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
    fetchAllClients, 
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};