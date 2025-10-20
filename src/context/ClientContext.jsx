// src/context/ClientContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
// Artık sahte veriye ihtiyacımız yok, bu satırı siliyoruz veya yorum satırı yapıyoruz.
// import CLIENTS_DATA from '../data/clients'; 

const ClientContext = createContext();

export const useClients = () => {
  return useContext(ClientContext);
};

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]); // Başlangıçta danışanlar boş bir dizi
  const [loading, setLoading] = useState(true); // Veri yüklenirken true olacak
  const [error, setError] = useState(null);   // Bir hata olursa burada saklanacak

  // Bu useEffect, bileşen ilk yüklendiğinde SADECE BİR KEZ çalışır.
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true); // Veri çekme işlemi başlıyor

        // Backend'imize GET isteği atıyoruz
        const response = await fetch('http://localhost:3001/api/clients');

        if (!response.ok) {
          throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();

        // Veritabanından gelen veriyi frontend'in anlayacağı formata dönüştürüyoruz.
        // (Prisma'dan gelen Json alanları string'dir, bunları parse etmeliyiz)
        const formattedData = data.map(client => ({
          ...client,
          // Bu alanlar şimdilik mock verideki gibi görünecek, daha sonra bunları da dinamik yapacağız.
          pendingApprovals: [], 
          notifications: [],
          weeklyMenu: { monday: [], tuesday: [], wednesday: [] },
          // Prisma, Json alanlarını string olarak döndürür. Objeye çeviriyoruz.
          allergens: client.allergens ? JSON.parse(client.allergens) : [],
          weeklyProgress: client.weeklyProgress ? JSON.parse(client.weeklyProgress) : []
        }));

        setClients(formattedData); // Gelen veriyi state'e kaydediyoruz
        setError(null); // Başarılı olduğu için eski hataları temizliyoruz

      } catch (err) {
        console.error("API'dan veri çekerken hata oluştu:", err);
        setError("Danışan verileri yüklenemedi. Lütfen backend sunucunuzun çalıştığından emin olun.");

      } finally {
        setLoading(false); // İşlem bitti, yüklenme durumunu kapatıyoruz
      }
    };

    fetchClients();
  }, []); // Boş dizi `[]` sayesinde bu fonksiyon sadece ilk render'da çalışır.

  // Diğer fonksiyonlar (handleApproval vb.) gelecekte buraya eklenecek
  // ve fetch ile PUT/POST istekleri yapacaklar.
  const value = {
    clients,
    setClients,
    loading,
    error
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};