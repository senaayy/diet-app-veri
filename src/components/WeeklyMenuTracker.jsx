// src/components/WeeklyMenuTracker.jsx - Renk Paleti Uygulanmış Hali (DÜZELTİLMİŞ)

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../context/ClientContext';
import { PlusCircle, ChefHat, Sparkles, ShoppingBag, Check, X, Trash2, TrendingUp, Activity, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddMealModal from './AddMealModal.jsx';
import QuickIngredientsModal from './QuickIngredientsModal.jsx';
import AIAlternativeModal from './AIAlternativeModal.jsx';
import ShoppingListModal from './ShoppingListModal.jsx';
import WeightTrackingChart from './WeightTrackingChart.jsx';
import { DAY_NAMES, DAYS } from '../data/weeklyMenuTemplate';

// tailwind.config.js dosyanızdaki renkleri burada tekrar tanımlıyoruz
// Recharts gibi kütüphanelerde doğrudan kullanabilmek için
const COLORS = {
  primary: '#cbf078',
  secondary: '#f8f398',
  tertiary: '#f1b963',
  error: '#e46161',
  'text-dark': '#333333',
  'text-medium': '#666666',
  'background-light': '#f8f8f8',
  'background-white': '#ffffff',
  divider: '#e0e0e0',
};

function WeeklyMenuTracker() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, setClients } = useClients();
  const client = clients.find(c => c.id === parseInt(clientId));

  const [selectedDay, setSelectedDay] = useState('monday');
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedMealItem, setSelectedMealItem] = useState(null);

  // ✅ Menüyü veritabanına kaydet
  const saveMenuToDb = async (updatedMenu) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyMenu: updatedMenu }),
      });
      
      if (!response.ok) throw new Error('Menü kaydedilemedi.');
      
      const savedClient = await response.json();
      
      // State'i güncelle
      setClients(prevClients => prevClients.map(c => 
        c.id === client.id 
          ? { 
              ...c, 
              weeklyMenu: typeof savedClient.weeklyMenu === 'string' 
                ? JSON.parse(savedClient.weeklyMenu) 
                : savedClient.weeklyMenu 
            } 
          : c
      ));
      
      return true;
    } catch (error) {
      console.error('Menü kaydetme hatası:', error);
      alert("Hata: " + error.message);
      return false;
    }
  };

  // ✅ Öğün ekle
  const handleSaveMeal = async (newMeal) => {
    const currentMenu = client.weeklyMenu || {};
    const updatedMenu = JSON.parse(JSON.stringify(currentMenu));
    
    if (!updatedMenu[selectedDay]) {
      updatedMenu[selectedDay] = [];
    }
    
    updatedMenu[selectedDay].push(newMeal);
    
    const success = await saveMenuToDb(updatedMenu);
    if (success) {
      setIsMealModalOpen(false);
    }
  };

  // ✅ Öğün durumunu güncelle (Tamamlandı/Atlandı)
  const handleMealStatus = async (mealIndex, status) => {
    const currentMenu = client.weeklyMenu || {};
    const updatedMenu = JSON.parse(JSON.stringify(currentMenu));
    
    if (updatedMenu[selectedDay] && updatedMenu[selectedDay][mealIndex]) {
      updatedMenu[selectedDay][mealIndex].status = status;
      await saveMenuToDb(updatedMenu);
    }
  };

  // ✅ Öğün sil
  const handleDeleteMeal = async (mealIndex) => {
    if (!window.confirm('Bu öğünü silmek istediğinize emin misiniz?')) return;

    const currentMenu = client.weeklyMenu || {};
    const updatedMenu = JSON.parse(JSON.stringify(currentMenu));
    
    if (updatedMenu[selectedDay]) {
      updatedMenu[selectedDay].splice(mealIndex, 1);
      await saveMenuToDb(updatedMenu);
    }
  };

  // ✅ Danışan verilerini güncelle (AI kullanım sayısı vb.)
  const updateClientData = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) throw new Error('Danışan güncellenemedi.');
      
      const savedClient = await response.json();
      
      setClients(prevClients => prevClients.map(c => 
        c.id === parseInt(clientId) 
          ? { 
              ...c, 
              ...savedClient,
              allergens: typeof savedClient.allergens === 'string' 
                ? JSON.parse(savedClient.allergens) 
                : savedClient.allergens || [],
              weeklyProgress: typeof savedClient.weeklyProgress === 'string'
                ? JSON.parse(savedClient.weeklyProgress)
                : savedClient.weeklyProgress || [],
              weeklyMenu: typeof savedClient.weeklyMenu === 'string'
                ? JSON.parse(savedClient.weeklyMenu)
                : savedClient.weeklyMenu || {},
              pendingApprovals: typeof savedClient.pendingApprovals === 'string'
                ? JSON.parse(savedClient.pendingApprovals)
                : savedClient.pendingApprovals || [],
            } 
          : c
      ));
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert("Hata: " + error.message);
    }
  };

  // ✅ AI Alternatif iste
  const handleRequestAlternative = (mealIndex) => {
    const currentDayMeals = client?.weeklyMenu?.[selectedDay] || [];
    setSelectedMealItem({ 
      ...currentDayMeals[mealIndex], 
      index: mealIndex, 
      day: selectedDay 
    });
    setShowAIModal(true);
    updateClientData({ aiUsageCount: (client.aiUsageCount || 0) + 1 });
  };

  // ✅ Elimde bunlar var iste
  const handleRequestIngredients = (mealIndex) => {
    const currentDayMeals = client?.weeklyMenu?.[selectedDay] || [];
    setSelectedMealItem({ 
      ...currentDayMeals[mealIndex], 
      index: mealIndex, 
      day: selectedDay 
    });
    setShowIngredientsModal(true);
    updateClientData({ aiUsageCount: (client.aiUsageCount || 0) + 1 });
  };

  // ✅ Alternatifi kabul et
  const handleAcceptAlternative = (alternative) => {
    const requestId = `req-${client.id}-${Date.now()}`;
    
    const newApproval = {
      id: requestId,
      day: selectedMealItem.day,
      mealIndex: selectedMealItem.index,
      originalMeal: {
        items: selectedMealItem.items,
        calories: selectedMealItem.calories,
        mealType: selectedMealItem.mealType,
        portion: selectedMealItem.portion
      },
      suggestedAlternative: alternative,
      timestamp: new Date().toISOString()
    };

    const updatedApprovals = [...(client.pendingApprovals || []), newApproval];
    
    updateClientData({ pendingApprovals: updatedApprovals });
    
    alert("✅ Alternatif öneri diyetisyeninize onay için iletildi!");
    setShowAIModal(false);
    setShowIngredientsModal(false);
  };

  if (!client) {
    return (
      <div className="text-center p-8 bg-background-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-error">Danışan Bulunamadı</h2>
        <p className="mt-2 text-text-medium">Lütfen danışan listesine geri dönün.</p>
        <button 
          onClick={() => navigate('/dietitian/clients')} 
          className="mt-6 px-6 py-2 bg-tertiary text-text-dark rounded-lg hover:bg-tertiary/90 transition-colors"
        >
          Danışan Listesine Dön
        </button>
      </div>
    );
  }

  const currentDayMeals = client?.weeklyMenu?.[selectedDay] || [];
  const totalCalories = currentDayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  // Haftalık istatistikleri hesapla
  const weeklyStats = useMemo(() => {
    let totalMeals = 0;
    let completedMeals = 0;
    let skippedMeals = 0;
    let aiChanges = 0;

    DAYS.forEach(day => {
      const dayMeals = client?.weeklyMenu?.[day] || [];
      totalMeals += dayMeals.length;
      
      dayMeals.forEach(meal => {
        if (meal.status === 'completed') completedMeals++;
        if (meal.status === 'skipped') skippedMeals++;
        if (meal.aiModified) aiChanges++; 
      });
    });

    return {
      totalMeals,
      completedMeals,
      skippedMeals,
      aiChanges
    };
  }, [client?.weeklyMenu]);

  // Kilo takibi grafik verisi
  const weightChartData = useMemo(() => {
    if (!client?.weightEntries || client.weightEntries.length === 0) {
      return [];
    }

    return client.weightEntries.map(entry => ({
      week: `Hafta ${entry.week}`,
      weight: entry.weight,
      date: new Date(entry.date).toLocaleDateString('tr-TR')
    }));
  }, [client?.weightEntries]);

  return (
    <>
      {/* Modaller */}
      {isMealModalOpen && (
        <AddMealModal 
          day={DAY_NAMES[selectedDay]} 
          onClose={() => setIsMealModalOpen(false)} 
          onSave={handleSaveMeal} 
        />
      )}
      {showAIModal && selectedMealItem && (
        <AIAlternativeModal 
          mealItem={selectedMealItem} 
          client={client} 
          onClose={() => setShowAIModal(false)} 
          onAccept={handleAcceptAlternative} 
        />
      )}
      {showIngredientsModal && selectedMealItem && (
        <QuickIngredientsModal 
          client={client} 
          onClose={() => setShowIngredientsModal(false)} 
          onAccept={handleAcceptAlternative} 
        />
      )}
      {showShoppingListModal && (
        <ShoppingListModal 
          client={client} 
          onClose={() => setShowShoppingListModal(false)} 
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-primary rounded-2xl p-6 text-text-dark shadow-lg"> 
          <button 
            onClick={() => navigate('/dietitian/clients')} 
            className="text-text-dark/80 hover:text-text-dark mb-4 flex items-center gap-2 transition-colors"
          >
            ← Danışan Listesine Dön
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Haftalık Menü Takibi</h2>
              <p className="text-text-dark/80">{client.name} - {DAY_NAMES[selectedDay]}</p> 
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{totalCalories}</div>
              <div className="text-text-dark/80">Günlük Kalori</div>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg"> 
                <ChefHat className="text-tertiary" size={20} /> 
              </div>
              <div>
                <div className="text-xs text-text-medium">Toplam Öğün</div>
                <div className="text-xl font-bold text-text-dark">{weeklyStats.totalMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg"> 
                <Check className="text-primary" size={20} /> 
              </div>
              <div>
                <div className="text-xs text-text-medium">Tamamlanan</div>
                <div className="text-xl font-bold text-text-dark">{weeklyStats.completedMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error/20 rounded-lg"> 
                <X className="text-error" size={20} /> 
              </div>
              <div>
                <div className="text-xs text-text-medium">Atlanan</div>
                <div className="text-xl font-bold text-text-dark">{weeklyStats.skippedMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg"> 
                <Sparkles className="text-tertiary" size={20} /> 
              </div>
              <div>
                <div className="text-xs text-text-medium">AI Değişiklik</div>
                <div className="text-xl font-bold text-text-dark">{weeklyStats.aiChanges}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gün Seçici ve Butonlar */}
        <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DAYS.map(day => (
                <button 
                  key={day} 
                  onClick={() => setSelectedDay(day)} 
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all text-sm ${
                    selectedDay === day 
                      ? 'bg-primary text-text-dark shadow-md' 
                      : 'bg-background-light text-text-dark hover:bg-divider' 
                  }`}
                >
                  {DAY_NAMES[day]}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsMealModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-primary text-text-dark rounded-lg hover:bg-primary/90 font-semibold transition-colors"
            >
              <PlusCircle size={18} />
              Öğün Ekle
            </button>
          </div>
          <button 
            onClick={() => setShowShoppingListModal(true)} 
            className="w-full mt-4 bg-tertiary text-text-dark py-2 rounded-lg font-medium hover:bg-tertiary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Alışveriş Listesi Oluştur
          </button>
        </div>

        {/* Kilo Takibi Grafiği */}
        <div className="bg-background-white rounded-xl p-6 shadow-sm border border-divider">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Kilo Takibi</h3>
          {weightChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                    stroke={COLORS['text-medium']} // X ekseni metin rengi
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
                    stroke={COLORS['text-medium']} // Y ekseni metin rengi
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} kg`, 'Kilo']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${label} - ${payload[0].payload.date}`;
                      }
                      return label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke={COLORS.tertiary} // Kilo çizgi rengi (turuncu)
                    strokeWidth={3}
                    dot={{ fill: COLORS.tertiary, strokeWidth: 2, r: 6 }} // Nokta rengi (turuncu)
                    activeDot={{ r: 8, stroke: COLORS.tertiary, strokeWidth: 2 }} // Aktif nokta rengi (turuncu)
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-background-light rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-text-medium mx-auto mb-2" />
                <p className="text-text-medium">Henüz kilo verisi bulunmuyor</p>
                <p className="text-sm text-text-medium">İlk kilo girişini yaparak takibe başlayın</p>
              </div>
            </div>
          )}
        </div>

        {/* Öğünler */}
        <div className="space-y-4">
          {currentDayMeals.length > 0 ? (
            currentDayMeals.map((mealItem, index) => (
              <div 
                key={mealItem.id || index} 
                className={`bg-background-white rounded-xl p-5 shadow-sm border-2 transition-all ${
                  mealItem.status === 'completed' 
                    ? 'border-primary bg-primary/10' 
                    : mealItem.status === 'skipped' 
                    ? 'border-error bg-error/10' 
                    : 'border-divider' 
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1 bg-secondary text-text-dark rounded-full text-sm font-medium">
                        {mealItem.mealType}
                      </div>
                      {mealItem.status === 'completed' && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                          ✓ Tamamlandı
                        </span>
                      )}
                      {mealItem.status === 'skipped' && (
                        <span className="text-xs bg-error/20 text-error px-2 py-1 rounded-full font-medium">
                          ✗ Atlandı
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-text-dark mb-2">
                      {mealItem.items}
                    </h4>
                    <p className="text-text-medium mb-3">📏 Porsiyon: {mealItem.portion}</p>
                    <div className="font-bold text-tertiary"> 
                      🔥 Kalori: {mealItem.calories}
                    </div>
                  </div>
                  
                  {/* Sil Butonu */}
                  <button
                    onClick={() => handleDeleteMeal(index)}
                    className="text-error hover:text-error/80 hover:bg-error/10 p-2 rounded-lg transition-all"
                    title="Öğünü Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {/* Butonlar */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleMealStatus(index, 'completed')} 
                      className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        mealItem.status === 'completed' 
                          ? 'bg-primary text-text-dark' 
                          : 'bg-primary/20 text-primary hover:bg-primary/30'
                      }`}
                    >
                      <Check size={18} />
                      Tamamlandı
                    </button>
                    <button 
                      onClick={() => handleMealStatus(index, 'skipped')} 
                      className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        mealItem.status === 'skipped' 
                          ? 'bg-error text-background-white' 
                          : 'bg-error/20 text-error hover:bg-error/30'
                      }`}
                    >
                      <X size={18} />
                      Atladım
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequestAlternative(index)} 
                      className="flex-1 bg-gradient-to-r from-secondary to-tertiary text-text-dark py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:from-secondary/90 hover:to-tertiary/90"
                    >
                      <Sparkles size={18} />
                      Alternatif İste
                    </button>
                    <button 
                      onClick={() => handleRequestIngredients(index)} 
                      className="flex-1 bg-gradient-to-r from-tertiary to-error text-background-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:from-tertiary/90 hover:to-error/90"
                    >
                      <ChefHat size={18} />
                      Elimde Bunlar Var
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-text-medium bg-background-white rounded-xl border-2 border-dashed border-divider">
              <p className="font-semibold">Bu gün için henüz öğün eklenmemiş.</p>
              <p className="text-sm mt-1">Başlamak için "Öğün Ekle" butonuna tıklayın.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default WeeklyMenuTracker;