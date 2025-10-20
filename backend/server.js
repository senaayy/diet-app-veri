// backend/server.js

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Diyet App Backend API Çalışıyor!');
});

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.danisan.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Danışanlar getirilirken bir hata oluştu.' });
  }
});

app.post('/api/clients', async (req, res) => {
  const clientData = req.body;
  const toInt = (value) => parseInt(value) || 0;
  const toFloat = (value) => parseFloat(value) || 0;
  try {
    const newClient = await prisma.danisan.create({
      data: {
        name: clientData.name,
        targetCalories: toInt(clientData.targetCalories), protein: toInt(clientData.protein),
        carbs: toInt(clientData.carbs), fat: toInt(clientData.fat),
        currentWeight: toFloat(clientData.currentWeight), targetWeight: toFloat(clientData.targetWeight),
        startWeight: toFloat(clientData.startWeight),
        adherence: 80, mealsLogged: 0, totalMeals: 49,
        allergens: clientData.allergens ? JSON.stringify(clientData.allergens.split(',').map(s => s.trim())) : JSON.stringify([]),
        weeklyProgress: JSON.stringify([toFloat(clientData.startWeight)])
      }
    });
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Danışan oluşturulurken bir hata oluştu.' });
  }
});

app.put('/api/clients/:clientId/menu', async (req, res) => {
  const { clientId } = req.params;
  const { weeklyMenu } = req.body;
  try {
    const updatedClient = await prisma.danisan.update({
      where: { id: parseInt(clientId) },
      data: { weeklyMenu: JSON.stringify(weeklyMenu) },
    });
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Menü güncellenirken bir hata oluştu.' });
  }
});

// --- EKSİK OLAN VE ŞİMDİ EKLENEN KISIM ---
app.patch('/api/clients/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const updateData = req.body;
  if (updateData.pendingApprovals) {
    updateData.pendingApprovals = JSON.stringify(updateData.pendingApprovals);
  }
  try {
    const updatedClient = await prisma.danisan.update({
      where: { id: parseInt(clientId) },
      data: updateData,
    });
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Danışan güncellenirken bir hata oluştu.' });
  }
});
// --- YENİ KISMIN SONU ---

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde başarıyla başlatıldı.`);
});