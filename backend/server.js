// backend/server.js - Cinsiyet Alanı Desteklenmiş Hali

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Diyet App Backend API Çalışıyor!');
});

// BMI hesaplama fonksiyonu
const calculateBMI = (weight, height) => {
  if (!height || height <= 0) return null;
  return weight / Math.pow(height / 100, 2);
};

// BMI kategorisi belirleme
const getBMICategory = (bmi) => {
  if (!bmi) return 'Bilinmiyor';
  if (bmi < 18.5) return 'Zayıf';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Fazla kilolu';
  if (bmi < 35) return 'Obez';
  return 'Morbid obez';
};

// Tüm danışanları getir (BMI bilgileri ile)
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.danisan.findMany({ // 'Client' yerine 'Danisan' kullanıldı
      include: {
        weightEntries: {
          orderBy: { week: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' } 
    });
    
    // BMI bilgilerini ekle
    const clientsWithBMI = clients.map(client => {
      const bmi = calculateBMI(client.currentWeight, client.height);
      return {
        ...client,
        bmi: bmi ? Math.round(bmi * 10) / 10 : null,
        bmiCategory: getBMICategory(bmi)
      };
    });
    
    res.json(clientsWithBMI);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Danışanlar getirilirken bir hata oluştu.' });
  }
});

// BMI kategorisine göre filtreleme
app.get('/api/clients/filter', async (req, res) => {
  try {
    const { category } = req.query;
    
    const clients = await prisma.danisan.findMany({ // 'Client' yerine 'Danisan' kullanıldı
      include: {
        weightEntries: {
          orderBy: { week: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' } 
    });
    
    // BMI bilgilerini ekle ve filtrele
    const clientsWithBMI = clients.map(client => {
      const bmi = calculateBMI(client.currentWeight, client.height);
      return {
        ...client,
        bmi: bmi ? Math.round(bmi * 10) / 10 : null,
        bmiCategory: getBMICategory(bmi)
      };
    });
    
    let filteredClients = clientsWithBMI;
    
    if (category && category !== 'Tümü') {
      filteredClients = clientsWithBMI.filter(client => client.bmiCategory === category);
    }
    
    res.json(filteredClients);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Danışanlar filtrelenirken bir hata oluştu.' });
  }
});

// Yeni danışan ekle
app.post('/api/clients', async (req, res) => {
  const clientData = req.body;
  
  const toInt = (value) => parseInt(value) || 0;
  const toFloat = (value) => parseFloat(value) || 0;
  
  try {
    const newClient = await prisma.danisan.create({ // 'Client' yerine 'Danisan' kullanıldı
      data: {
        name: clientData.name,
        gender: clientData.gender || 'Belirtilmedi', // <-- YENİ EKLENEN gender ALANI
        height: clientData.height ? toFloat(clientData.height) : null,
        targetCalories: toInt(clientData.targetCalories),
        protein: toInt(clientData.protein),
        carbs: toInt(clientData.carbs),
        fat: toInt(clientData.fat),
        currentWeight: toFloat(clientData.currentWeight),
        targetWeight: toFloat(clientData.targetWeight),
        startWeight: toFloat(clientData.startWeight),
        adherence: toInt(clientData.adherence) || 80,
        mealsLogged: toInt(clientData.mealsLogged) || 0,
        totalMeals: toInt(clientData.totalMeals) || 49,
        aiUsageCount: toInt(clientData.aiUsageCount) || 0,
        
        // JSON alanları - Array/Object ise stringify et
        allergens: Array.isArray(clientData.allergens) 
          ? JSON.stringify(clientData.allergens) 
          : (clientData.allergens || JSON.stringify([])),
        
        weeklyProgress: Array.isArray(clientData.weeklyProgress)
          ? JSON.stringify(clientData.weeklyProgress)
          : (clientData.weeklyProgress || JSON.stringify([])),
        
        weeklyMenu: typeof clientData.weeklyMenu === 'object'
          ? JSON.stringify(clientData.weeklyMenu)
          : (clientData.weeklyMenu || JSON.stringify({ monday: [], tuesday: [], wednesday: [] })),
        
        pendingApprovals: Array.isArray(clientData.pendingApprovals)
          ? JSON.stringify(clientData.pendingApprovals)
          : (clientData.pendingApprovals || JSON.stringify([]))
      }
    });
    
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Danışan oluşturma hatası:', error);
    res.status(500).json({ error: 'Danışan oluşturulurken bir hata oluştu.' });
  }
});

// ✅ Menü güncelle (PUT)
app.put('/api/clients/:clientId/menu', async (req, res) => {
  const { clientId } = req.params;
  const { weeklyMenu } = req.body;
  
  try {
    const updatedClient = await prisma.danisan.update({ // 'Client' yerine 'Danisan' kullanıldı
      where: { id: parseInt(clientId) },
      data: { 
        weeklyMenu: typeof weeklyMenu === 'object' 
          ? JSON.stringify(weeklyMenu) 
          : weeklyMenu 
      },
    });
    
    res.json(updatedClient);
  } catch (error) {
    console.error('Menü güncelleme hatası:', error);
    res.status(500).json({ error: 'Menü güncellenirken bir hata oluştu.' });
  }
});

// ✅ Danışan güncelle (PATCH) - EN ÖNEMLİ KISIM
app.patch('/api/clients/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const updateData = req.body;
  
  // JSON alanlarını kontrol et ve stringify et
  if (updateData.weeklyMenu && typeof updateData.weeklyMenu === 'object') {
    updateData.weeklyMenu = JSON.stringify(updateData.weeklyMenu);
  }
  
  if (updateData.pendingApprovals && typeof updateData.pendingApprovals === 'object') {
    updateData.pendingApprovals = JSON.stringify(updateData.pendingApprovals);
  }
  
  if (updateData.allergens && Array.isArray(updateData.allergens)) {
    updateData.allergens = JSON.stringify(updateData.allergens);
  }
  
  if (updateData.weeklyProgress && Array.isArray(updateData.weeklyProgress)) {
    updateData.weeklyProgress = JSON.stringify(updateData.weeklyProgress);
  }

  // Eğer gender alanı gönderildiyse, doğrudan ekleyelim (String olduğu için stringify'a gerek yok)
  // if (updateData.gender) { /* Zaten updateData içinde String olarak geleceği için ekstra işlem gerekmez */ }
  
  try {
    const updatedClient = await prisma.danisan.update({ // 'Client' yerine 'Danisan' kullanıldı
      where: { id: parseInt(clientId) },
      data: updateData,
    });
    
    res.json(updatedClient);
  } catch (error) {
    console.error('Danışan güncelleme hatası:', error);
    res.status(500).json({ error: 'Danışan güncellenirken bir hata oluştu.' });
  }
});

// Haftalık kilo girişi - Yeni kayıt
app.post('/api/clients/:clientId/weight', async (req, res) => {
  const { clientId } = req.params;
  const { weight, week, notes } = req.body;
  
  try {
    const weightEntry = await prisma.weightEntry.upsert({
      where: {
        danisanId_week: {
          danisanId: parseInt(clientId),
          week: parseInt(week)
        }
      },
      update: {
        weight: parseFloat(weight),
        notes: notes || null,
        updatedAt: new Date()
      },
      create: {
        danisanId: parseInt(clientId),
        weight: parseFloat(weight),
        week: parseInt(week),
        notes: notes || null
      }
    });
    
    // Danışanın currentWeight'ini güncelle
    await prisma.danisan.update({ // 'Client' yerine 'Danisan' kullanıldı
      where: { id: parseInt(clientId) },
      data: { currentWeight: parseFloat(weight) }
    });
    
    res.json(weightEntry);
  } catch (error) {
    console.error('Kilo girişi hatası:', error);
    res.status(500).json({ error: 'Kilo girişi yapılırken bir hata oluştu.' });
  }
});

// Danışanın kilo geçmişini getir
app.get('/api/clients/:clientId/weight-history', async (req, res) => {
  const { clientId } = req.params;
  
  try {
    const weightHistory = await prisma.weightEntry.findMany({
      where: { danisanId: parseInt(clientId) },
      orderBy: { week: 'asc' }
    });
    
    res.json(weightHistory);
  } catch (error) {
    console.error('Kilo geçmişi hatası:', error);
    res.status(500).json({ error: 'Kilo geçmişi getirilirken bir hata oluştu.' });
  }
});

// Tek danışan detayı (kilo geçmişi ile)
app.get('/api/clients/:clientId', async (req, res) => {
  const { clientId } = req.params;
  
  try {
    const client = await prisma.danisan.findUnique({ // 'Client' yerine 'Danisan' kullanıldı
      where: { id: parseInt(clientId) },
      include: {
        weightEntries: {
          orderBy: { week: 'asc' }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Danışan bulunamadı.' });
    }
    
    const bmi = calculateBMI(client.currentWeight, client.height);
    const clientWithBMI = {
      ...client,
      bmi: bmi ? Math.round(bmi * 10) / 10 : null,
      bmiCategory: getBMICategory(bmi)
    };
    
    res.json(clientWithBMI);
  } catch (error) {
    console.error('Danışan detayı hatası:', error);
    res.status(500).json({ error: 'Danışan detayı getirilirken bir hata oluştu.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend sunucusu http://localhost:${PORT} adresinde başarıyla başlatıldı.`);
});