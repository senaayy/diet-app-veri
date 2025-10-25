// src/pages/dietitian/client/ClientMenuView.jsx - Alışveriş Listesi ve Motivasyon Eklendi

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, Sparkles, Check, X, TrendingUp, Activity, Flame, LogOut, Calendar, ShoppingBag, Award } from 'lucide-react'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DAY_NAMES, DAYS } from '../../../data/weeklyMenuTemplate'; 
import AIAlternativeModal from '../../../components/AIAlternativeModal'; 
import QuickIngredientsModal from '../../../components/QuickIngredientsModal'; 
import ShoppingListModal from '../../../components/ShoppingListModal';
import { useClients } from '../../../context/ClientContext'; 

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

const formatClientData = (data) => {
  return {
    ...data,
    allergens: parseJsonSafe(data.allergens, []),
    weeklyMenu: parseJsonSafe(data.weeklyMenu, {}),
    pendingApprovals: parseJsonSafe(data.pendingApprovals, []),
    weeklyProgress: parseJsonSafe(data.weeklyProgress, []),
    weightEntries: parseJsonSafe(data.weightEntries, []), 
  };
};

// Motivasyon mesajları
const getMotivationMessage = (adherence) => {
  if (adherence >= 90) return { text: "Mükemmel! 🏆", color: "text-primary", emoji: "🏆" };
  if (adherence >= 75) return { text: "Harika! 🌟", color: "text-secondary", emoji: "🌟" };
  if (adherence >= 50) return { text: "İyi Gidiyorsun! 💪", color: "text-tertiary", emoji: "💪" };
  if (adherence >= 25) return { text: "Başlangıç 🌱", color: "text-text-medium", emoji: "🌱" };
  return { text: "Devam Et! 🚀", color: "text-text-medium", emoji: "🚀" };
};

function ClientMenuView({ currentUser, onLogout }) { 
  const { clientId } = useParams(); 
  const navigate = useNavigate();
  const { clients, updateClientData: globalUpdateClientData } = useClients(); 
  
  const [client, setClient] = useState(null); 
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false); 
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedMealItem, setSelectedMealItem] = useState(null);

  useEffect(() => {
    const foundClient = clients.find(c => c.id === parseInt(clientId));
    if (foundClient) {
      setClient(formatClientData(foundClient));
    } else {
      fetchClientData(); 
    }
  }, [clients, clientId]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`);
      const data = await response.json();
      setClient(formatClientData(data));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  // Dinamik öğün kaydı hesaplama
  const mealStats = useMemo(() => {
    if (!client) return { logged: 0, total: 0 };
    
    let logged = 0;
    let total = 0;
    
    DAYS.forEach(day => {
      const dayMeals = parseJsonSafe(client.weeklyMenu, {})[day] || [];
      total += dayMeals.length;
      logged += dayMeals.filter(meal => meal.status === 'completed' || meal.status === 'skipped').length;
    });
    
    return { logged, total };
  }, [client]);

  const handleMealStatus = async (mealId, status) => {
    if (!mealId) return;

    const currentMenu = parseJsonSafe(client.weeklyMenu, {});
    const updatedMenu = JSON.parse(JSON.stringify(currentMenu));
    
    if (updatedMenu[selectedDay]) {
      const mealIndexToUpdate = updatedMenu[selectedDay].findIndex(meal => meal.id === mealId);

      if (mealIndexToUpdate !== -1) {
        updatedMenu[selectedDay][mealIndexToUpdate].status = status;
        
        try {
          const savedClient = await globalUpdateClientData(clientId, { weeklyMenu: updatedMenu });
          setClient(formatClientData(savedClient));
        } catch (error) {
          console.error('Güncelleme hatası:', error);
          alert("Bir hata oluştu, öğün durumu güncellenemedi.");
        }
      }
    }
  };

  const handleRequestAlternative = async (mealIndex) => {
    const currentDayMeals = parseJsonSafe(client.weeklyMenu, {})[selectedDay] || [];
    setSelectedMealItem({
      ...currentDayMeals[mealIndex],
      index: mealIndex, 
      day: selectedDay
    });
    setShowAIModal(true);
    
    try {
      const savedClient = await globalUpdateClientData(clientId, { aiUsageCount: (client?.aiUsageCount || 0) + 1 });
      setClient(formatClientData(savedClient));
    } catch (error) {
      console.error("AI kullanım sayısı güncellenemedi", error);
    }
  };

  const handleRequestIngredients = async (mealIndex) => {
    const currentDayMeals = parseJsonSafe(client.weeklyMenu, {})[selectedDay] || [];
    setSelectedMealItem({
      ...currentDayMeals[mealIndex],
      index: mealIndex, 
      day: selectedDay
    });
    setShowIngredientsModal(true);
    
    try {
      const savedClient = await globalUpdateClientData(clientId, { aiUsageCount: (client?.aiUsageCount || 0) + 1 });
      setClient(formatClientData(savedClient));
    } catch (error) {
      console.error("AI kullanım sayısı güncellenemedi", error);
    }
  };

  const handleAcceptAlternative = async (alternative) => {
    const requestId = `req-${client.id}-${Date.now()}`;
    const newApproval = {
      id: requestId,
      day: selectedMealItem.day,
      mealIndex: selectedMealItem.index,
      originalMeal: { items: selectedMealItem.items, calories: selectedMealItem.calories, mealType: selectedMealItem.mealType, portion: selectedMealItem.portion },
      suggestedAlternative: alternative,
      timestamp: new Date().toISOString()
    };

    const currentApprovals = parseJsonSafe(client.pendingApprovals, []);
    const updatedApprovals = [...currentApprovals, newApproval];

    try {
      const savedClient = await globalUpdateClientData(clientId, { pendingApprovals: updatedApprovals });
      setClient(formatClientData(savedClient));
      alert("✅ Alternatif öneri diyetisyeninize onay için iletildi!");
    } catch (error) {
      console.error("Alternatif kabul etme hatası:", error);
    } finally {
      setShowAIModal(false);
      setShowIngredientsModal(false); 
    }
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      onLogout();
      navigate('/');
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tertiary/50 border-t-tertiary rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-text-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentDayMeals = parseJsonSafe(client.weeklyMenu, {})[selectedDay] || [];
  const totalCalories = currentDayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const weightChartData = parseJsonSafe(client.weightEntries, []).map(entry => ({
    week: `Hafta ${entry.week}`,
    weight: entry.weight,
  }));

  const motivation = getMotivationMessage(client.adherence);
  
  // Gradient renk hesaplama (yeşilden kırmızıya)
  const getProgressGradient = (adherence) => {
    if (adherence >= 90) return 'from-green-400 to-green-600'; // Mükemmel - Yeşil
    if (adherence >= 75) return 'from-lime-400 to-green-500'; // Harika - Açık Yeşil
    if (adherence >= 50) return 'from-yellow-400 to-orange-400'; // İyi - Sarı-Turuncu
    if (adherence >= 25) return 'from-orange-400 to-orange-600'; // Başlangıç - Turuncu
    return 'from-red-400 to-red-600'; // Düşük - Kırmızı
  };

  return ( 
    <>
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
          mealItem={selectedMealItem} 
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
      
      <div className="min-h-screen bg-background-light p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-text-dark shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Hoş Geldin, {client.name}! 👋</h2>
                <p className="text-text-dark/80">Bugün de harika bir gün olacak!</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-background-white text-text-dark px-4 py-2 rounded-lg hover:bg-background-light transition-colors shadow-sm"
              >
                <LogOut size={18} />
                Çıkış
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background-white/80 rounded-lg p-3 text-center">
                <div className="text-sm text-text-medium">Mevcut Kilo</div>
                <div className="text-2xl font-bold text-tertiary">{client.currentWeight} kg</div>
              </div>
              <div className="bg-background-white/80 rounded-lg p-3 text-center">
                <div className="text-sm text-text-medium">Hedef Kilo</div>
                <div className="text-2xl font-bold text-primary">{client.targetWeight} kg</div>
              </div>
              <div className="bg-background-white/80 rounded-lg p-3 text-center">
                <div className="text-sm text-text-medium">Günlük Kalori</div>
                <div className="text-2xl font-bold text-error">{totalCalories}/{client.targetCalories}</div>
              </div>
            </div>
          </div>

          {/* Motivasyonel İlerleme Çubuğu */}
          <div className="bg-background-white rounded-xl p-6 shadow-sm border border-divider">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className={motivation.color} size={24} />
                <h3 className="font-semibold text-text-dark">Uyum Oranı</h3>
              </div>
              <span className={`text-2xl font-bold ${motivation.color}`}>
                {client.adherence}%
              </span>
            </div>
            
            {/* İlerleme Çubuğu */}
            <div className="relative w-full h-8 bg-background-light rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out flex items-center justify-end pr-3"
                style={{ width: `${client.adherence}%` }}
              >
                {client.adherence > 15 && (
                  <span className="text-text-dark font-bold text-sm">{motivation.emoji}</span>
                )}
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <p className={`font-bold text-lg ${motivation.color}`}>
                {motivation.text}
              </p>
              <p className="text-sm text-text-medium mt-1">
                {client.adherence < 50 && "Her gün bir adım daha ileri! 🚀"}
                {client.adherence >= 50 && client.adherence < 75 && "Harika gidiyorsun, devam et! 💪"}
                {client.adherence >= 75 && client.adherence < 90 && "Neredeyse mükemmelsin! 🌟"}
                {client.adherence >= 90 && "Sen bir şampiyonsun! 🏆"}
              </p>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <ChefHat className="text-secondary" size={24} />
                </div>
                <div>
                  <div className="text-xs text-text-medium">Öğün Kaydı</div>
                  <div className="text-2xl font-bold text-text-dark">{mealStats.logged}/{mealStats.total}</div>
                  <div className="text-xs text-text-medium mt-1">
                    {mealStats.total > 0 && `%${Math.round((mealStats.logged / mealStats.total) * 100)} tamamlandı`}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tertiary/20 rounded-lg">
                  <TrendingUp className="text-tertiary" size={24} />
                </div>
                <div>
                  <div className="text-xs text-text-medium">İlerleme</div>
                  <div className="text-2xl font-bold text-text-dark">
                    {(client.startWeight - client.currentWeight).toFixed(1)} kg
                  </div>
                  <div className="text-xs text-text-medium mt-1">
                    Hedef: {Math.abs(client.targetWeight - client.currentWeight).toFixed(1)} kg kaldı
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Sparkles className="text-primary" size={24} />
                </div>
                <div>
                  <div className="text-xs text-text-medium">AI Kullanımı</div>
                  <div className="text-2xl font-bold text-text-dark">{client.aiUsageCount || 0}</div>
                  <div className="text-xs text-text-medium mt-1">Toplam istek</div>
                </div>
              </div>
            </div>
          </div>

          {/* Kilo Takibi Grafiği */}
          {weightChartData.length > 0 && (
            <div className="bg-background-white rounded-xl p-6 shadow-sm border border-divider">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Kilo Takibi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.divider} />
                  <XAxis dataKey="week" stroke={COLORS['text-medium']} fontSize={12} />
                  <YAxis stroke={COLORS['text-medium']} fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke={COLORS.tertiary} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.tertiary, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gün Seçici ve Alışveriş Listesi */}
          <div className="bg-background-white rounded-xl p-4 shadow-sm border border-divider">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-primary" size={20} />
              <h3 className="font-semibold text-text-dark">Bugün: {DAY_NAMES[selectedDay]}</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
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
              onClick={() => setShowShoppingListModal(true)} 
              className="w-full bg-tertiary text-text-dark py-3 rounded-lg font-medium hover:bg-tertiary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag size={20} />
              Alışveriş Listemi Gör
            </button>
          </div>

          {/* Öğünler */}
          <div className="space-y-4">
            {currentDayMeals.length > 0 ? (
              currentDayMeals.map((mealItem, index) => (
                <div 
                  key={mealItem.id} 
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
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMealStatus(mealItem.id, 'completed')} 
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
                        onClick={() => handleMealStatus(mealItem.id, 'skipped')} 
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
                <p className="font-semibold">Bu gün için henüz öğün planlanmamış.</p>
                <p className="text-sm mt-1">Diyetisyeniniz ile iletişime geçin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </> 
  );
}

export default ClientMenuView;