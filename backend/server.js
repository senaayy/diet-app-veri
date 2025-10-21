// backend/server.js - TAMAMEN DÜZELTILMIŞ

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

// Tüm danışanları getir
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.danisan.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(clients);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Danışanlar getirilirken bir hata oluştu.' });
  }
});

// Yeni danışan ekle
app.post('/api/clients', async (req, res) => {
  const clientData = req.body;
  
  const toInt = (value) => parseInt(value) || 0;
  const toFloat = (value) => parseFloat(value) || 0;
  
  try {
    const newClient = await prisma.danisan.create({
      data: {
        name: clientData.name,
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
    const updatedClient = await prisma.danisan.update({
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
  
  try {
    const updatedClient = await prisma.danisan.update({
      where: { id: parseInt(clientId) },
      data: updateData,
    });
    
    res.json(updatedClient);
  } catch (error) {
    console.error('Danışan güncelleme hatası:', error);
    res.status(500).json({ error: 'Danışan güncellenirken bir hata oluştu.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend sunucusu http://localhost:${PORT} adresinde başarıyla başlatıldı.`);
});