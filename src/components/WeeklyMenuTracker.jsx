// src/components/WeeklyMenuTracker.jsx - TAMAMEN DÜZELTILMIŞ

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
      <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-red-600">Danışan Bulunamadı</h2>
        <p className="mt-2 text-gray-600">Lütfen danışan listesine geri dönün.</p>
        <button 
          onClick={() => navigate('/dietitian/clients')} 
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <button 
            onClick={() => navigate('/dietitian/clients')} 
            className="text-white/80 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Danışan Listesine Dön
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Haftalık Menü Takibi</h2>
              <p className="text-green-100">{client.name} - {DAY_NAMES[selectedDay]}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{totalCalories}</div>
              <div className="text-green-100">Günlük Kalori</div>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChefHat className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600">Toplam Öğün</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.totalMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600">Tamamlanan</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.completedMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="text-red-600" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600">Atlanan</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.skippedMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="text-purple-600" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600">AI Değişiklik</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.aiChanges}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gün Seçici ve Butonlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DAYS.map(day => (
                <button 
                  key={day} 
                  onClick={() => setSelectedDay(day)} 
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all text-sm ${
                    selectedDay === day 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {DAY_NAMES[day]}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsMealModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
            >
              <PlusCircle size={18} />
              Öğün Ekle
            </button>
          </div>
          <button 
            onClick={() => setShowShoppingListModal(true)} 
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Alışveriş Listesi Oluştur
          </button>
        </div>

        {/* Kilo Takibi Grafiği */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kilo Takibi</h3>
          {weightChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
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
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Henüz kilo verisi bulunmuyor</p>
                <p className="text-sm text-gray-400">İlk kilo girişini yaparak takibe başlayın</p>
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
                className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-all ${
                  mealItem.status === 'completed' 
                    ? 'border-green-300 bg-green-50' 
                    : mealItem.status === 'skipped' 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {mealItem.mealType}
                      </div>
                      {mealItem.status === 'completed' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ✓ Tamamlandı
                        </span>
                      )}
                      {mealItem.status === 'skipped' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          ✗ Atlandı
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {mealItem.items}
                    </h4>
                    <p className="text-gray-600 mb-3">📏 Porsiyon: {mealItem.portion}</p>
                    <div className="font-bold text-blue-600">
                      🔥 Kalori: {mealItem.calories}
                    </div>
                  </div>
                  
                  {/* Sil Butonu */}
                  <button
                    onClick={() => handleDeleteMeal(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
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
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <Check size={18} />
                      Tamamlandı
                    </button>
                    <button 
                      onClick={() => handleMealStatus(index, 'skipped')} 
                      className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        mealItem.status === 'skipped' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <X size={18} />
                      Atladım
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequestAlternative(index)} 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Sparkles size={18} />
                      Alternatif İste
                    </button>
                    <button 
                      onClick={() => handleRequestIngredients(index)} 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600"
                    >
                      <ChefHat size={18} />
                      Elimde Bunlar Var
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border-2 border-dashed">
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