// src/components/WeeklyMenuTracker.jsx - Diyetisyen İçin Düzeltildi

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, Sparkles, Check, X, Trash2, TrendingUp, Activity, Flame, PlusCircle, ShoppingBag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddMealModal from './AddMealModal.jsx';
import QuickIngredientsModal from './QuickIngredientsModal.jsx';
import AIAlternativeModal from './AIAlternativeModal.jsx';
import ShoppingListModal from './ShoppingListModal.jsx';
import WeightTrackingChart from './WeightTrackingChart.jsx';
import { DAY_NAMES, DAYS } from '../data/weeklyMenuTemplate';
import { useClients } from '../context/ClientContext'; 

const COLORS = {
  primary: '#cbf078',
  secondary: '#f8f398',
  tertiary: '#f1b963',
  error: '#e46161',
  'text-dark': '#333333',
  'text-medium': '#666666',
  'background-light': '#DEDED1', 
  'background-white': '#ffffff',
  divider: '#e0e0e0',
};

function WeeklyMenuTracker() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, updateClientData: globalUpdateClientData } = useClients(); 
  
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false); 
  const [selectedMealItem, setSelectedMealItem] = useState(null);

  const client = clients.find(c => c.id === parseInt(clientId));

  const weeklyStats = useMemo(() => { 
    if (!client) return { totalMeals: 0, completedMeals: 0, skippedMeals: 0, aiChanges: 0 };
    
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
  }, [client]);

  const saveMenuToDb = async (updatedMenu) => {
    try {
      await globalUpdateClientData(clientId, { weeklyMenu: updatedMenu });
      return true;
    } catch (error) {
      console.error('Menü kaydetme hatası:', error);
      alert("Hata: " + error.message);
      return false;
    }
  };

  const handleSaveMeal = async (newMeal) => {
    const currentMenu = client?.weeklyMenu || {}; 
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

  const handleDeleteMeal = async (mealIndex) => {
    if (!window.confirm('Bu öğünü silmek istediğinize emin misiniz?')) return;

    const currentMenu = client?.weeklyMenu || {}; 
    const updatedMenu = JSON.parse(JSON.stringify(currentMenu));
    
    if (updatedMenu[selectedDay] && updatedMenu[selectedDay][mealIndex] !== undefined) {
      updatedMenu[selectedDay].splice(mealIndex, 1);
      await saveMenuToDb(updatedMenu); 
    }
  };

  const handleRequestAlternative = (mealIndex) => {
    const currentDayMeals = client?.weeklyMenu?.[selectedDay] || [];
    setSelectedMealItem({ 
      ...currentDayMeals[mealIndex], 
      index: mealIndex, 
      day: selectedDay 
    });
    setShowAIModal(true);
    globalUpdateClientData(clientId, { aiUsageCount: (client?.aiUsageCount || 0) + 1 });
  };

  const handleRequestIngredients = (mealIndex) => {
    const currentDayMeals = client?.weeklyMenu?.[selectedDay] || [];
    setSelectedMealItem({ 
      ...currentDayMeals[mealIndex], 
      index: mealIndex, 
      day: selectedDay 
    });
    setShowIngredientsModal(true);
    globalUpdateClientData(clientId, { aiUsageCount: (client?.aiUsageCount || 0) + 1 });
  };

  const handleAcceptAlternative = async (alternative) => {
    if (!client) return; 

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
    
    await globalUpdateClientData(clientId, { pendingApprovals: updatedApprovals });
    
    alert("✅ Alternatif öneri diyetisyeninize onay için iletildi!");
    setShowAIModal(false);
    setShowIngredientsModal(false);
  };

  // ✅ YENİ: Öğün durumu güncelleme fonksiyonu
  const handleMealStatus = async (mealIndex, status) => {
    const currentMenu = client?.weeklyMenu || {};
    const updatedMenu = JSON.parse(JSON.stringify(currentMenu));
    
    if (updatedMenu[selectedDay] && updatedMenu[selectedDay][mealIndex]) {
      updatedMenu[selectedDay][mealIndex].status = status;
      await saveMenuToDb(updatedMenu);
    }
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
  const weightChartData = client.weightEntries?.map(entry => ({
    week: `Hafta ${entry.week}`,
    weight: entry.weight,
    date: new Date(entry.date).toLocaleDateString('tr-TR')
  })) || [];


  return ( 
    <>
      {isMealModalOpen && (
        <AddMealModal 
          day={DAY_NAMES[selectedDay]} 
          onClose={() => setIsMealModalOpen(false)} 
          onSave={handleSaveMeal} 
          onMealAdded={() => { /* Boş bırakılabilir, çünkü handleSaveMeal zaten global state'i güncelliyor */ }}
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
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-text-dark shadow-lg">
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
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.divider} />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                    stroke={COLORS['text-medium']}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
                    stroke={COLORS['text-medium']}
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
                    stroke={COLORS.tertiary} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.tertiary, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: COLORS.tertiary, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-background-light rounded-lg border border-divider">
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
                  
                  {/* Sil Butonu (Diyetisyen İçin Kalacak) */}
                  <button
                    onClick={() => handleDeleteMeal(index)}
                    className="text-error hover:text-error/80 hover:bg-error/10 p-2 rounded-lg transition-all"
                    title="Öğünü Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-text-medium bg-background-white rounded-xl border-2 border-dashed border-divider">
              <p className="font-semibold">Bu gün için henüz öğün planlanmamış.</p>
              <p className="text-sm mt-1">Diyetisyeniniz ile iletişime geçin.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default WeeklyMenuTracker;