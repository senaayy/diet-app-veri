// src/pages/dietitian/ClientsList.jsx - Cinsiyete Göre Avatar Renkleri Uygulanmış Hali (KESİN)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../context/ClientContext';
import { ChefHat, Activity, PlusCircle, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import AddClientModal from '../../components/AddClientModal.jsx';

// tailwind.config.js dosyanızdaki renkleri burada tekrar tanımlıyoruz
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

// BMI Hesaplama ve Kategori Belirleme
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return { label: 'Bilinmiyor', color: 'gray' };
  
  if (bmi < 18.5) return { label: 'Zayıf', color: 'secondary' }; 
  if (bmi < 25) return { label: 'Normal', color: 'primary' }; 
  if (bmi < 30) return { label: 'Fazla Kilolu', color: 'tertiary' }; 
  if (bmi < 35) return { label: 'Obez (1. Derece)', color: 'error' }; 
  if (bmi < 40) return { label: 'Obez (2. Derece)', color: 'error' }; 
  return { label: 'Morbid Obez', color: 'error' }; 
};

// Renk paletimize göre badge renklerini döndür
const getBadgeColor = (colorName) => {
  switch (colorName) {
    case 'primary': return 'bg-primary/20 text-primary border-primary/30';
    case 'secondary': return 'bg-secondary/20 text-secondary border-secondary/30';
    case 'tertiary': return 'bg-tertiary/20 text-tertiary border-tertiary/30';
    case 'error': return 'bg-error/20 text-error border-error/30';
    case 'gray': return 'bg-background-light text-text-medium border-divider';
    default: return 'bg-background-light text-text-medium border-divider';
  }
};

// Cinsiyete göre avatar renk sınıfını döndüren yeni fonksiyon
const getAvatarColorClasses = (gender) => {
  switch (gender) {
    case 'Kadın': return 'bg-gradient-to-br from-pink-400 to-pink-600'; // Pembemsi gradyan
    case 'Erkek': return 'bg-gradient-to-br from-blue-400 to-blue-600'; // Maviye yakın gradyan
    case 'Diğer': return 'bg-gradient-to-br from-purple-400 to-purple-600'; // Morumsu gradyan
    default: return 'bg-gradient-to-br from-tertiary to-secondary'; // Varsayılan (turuncu-sarı gradyan)
  }
};

// Kilo değişimi hesaplama
const getWeightChange = (client) => {
  if (!client.startWeight || !client.currentWeight) return null;
  return (client.currentWeight - client.startWeight).toFixed(1);
};

function ClientsList() {
  const navigate = useNavigate();
  const { clients, loading, error } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBMI, setFilterBMI] = useState('all');
  const [filterAdherence, setFilterAdherence] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleClientAdded = () => {
    setIsModalOpen(false);
  };

  // Filtreleme fonksiyonu
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesBMI = true;
    if (filterBMI !== 'all') {
      const bmi = calculateBMI(client.currentWeight, client.height);
      const category = getBMICategory(bmi);
      matchesBMI = category.label === filterBMI;
    }
    
    let matchesAdherence = true;
    if (filterAdherence === 'high') matchesAdherence = client.adherence >= 80;
    else if (filterAdherence === 'medium') matchesAdherence = client.adherence >= 50 && client.adherence < 80;
    else if (filterAdherence === 'low') matchesAdherence = client.adherence < 50;
    
    return matchesSearch && matchesBMI && matchesAdherence;
  });

  if (loading) {
    return (
      <div className="bg-background-white rounded-xl shadow-sm border border-divider p-12 text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-tertiary/50 border-t-tertiary rounded-full animate-spin mb-4"></div> 
          <p className="text-text-medium font-medium">Danışanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 rounded-xl shadow-sm border-2 border-error/50 p-6">
        <h3 className="text-lg font-bold text-error mb-2">⚠️ Hata</h3>
        <p className="text-error/90">{error}</p>
        <p className="text-sm text-error/80 mt-3">Backend sunucusunun (port 3001) çalıştığından emin olun.</p>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && (
        <AddClientModal 
          onClose={() => setIsModalOpen(false)} 
          onClientAdded={handleClientAdded} 
        />
      )}
      
      <div className="bg-background-white rounded-xl shadow-sm border border-divider p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-text-dark">Danışan Listesi</h3>
              <p className="text-sm text-text-medium mt-1">
                Toplam: <span className="font-semibold text-primary">{clients.length}</span> danışan
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-text-dark rounded-lg hover:bg-primary/90 font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle size={20} />
              Yeni Danışan Ekle
            </button>
          </div>

          {/* Arama ve Filtre */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-medium/70" size={20} />
              <input
                type="text"
                placeholder="Danışan ara (ad, soyad)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark bg-background-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                showFilters 
                  ? 'bg-secondary/10 border-secondary/50 text-secondary' 
                  : 'border-divider hover:bg-background-light'
              }`}
            >
              <Filter size={18} />
              Filtrele
            </button>
          </div>

          {/* Filtre Seçenekleri */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary/5 rounded-lg border-2 border-divider"> 
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">📊 BMI Kategorisi</label>
                <select
                  value={filterBMI}
                  onChange={(e) => setFilterBMI(e.target.value)}
                  className="w-full p-2 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-white text-text-dark"
                >
                  <option value="all">Tümü</option>
                  <option value="Zayıf">Zayıf</option>
                  <option value="Normal Ağırlık">Normal Ağırlık</option>
                  <option value="Fazla Kilolu">Fazla Kilolu</option>
                  <option value="Obez (1. Derece)">Obez (1. Derece)</option>
                  <option value="Obez (2. Derece)">Obez (2. Derece)</option>
                  <option value="Morbid Obez">Morbid Obez</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">📈 Uyum Durumu</label>
                <select
                  value={filterAdherence}
                  onChange={(e) => setFilterAdherence(e.target.value)}
                  className="w-full p-2 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-white text-text-dark"
                >
                  <option value="all">Tümü</option>
                  <option value="high">Yüksek (≥80%)</option>
                  <option value="medium">Orta (50-79%)</option>
                  <option value="low">Düşük (&lt;50%)</option>
                </select>
              </div>
            </div>
          )}

          {/* Aktif Filtreler */}
          {(searchTerm || filterBMI !== 'all' || filterAdherence !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="text-text-medium">Aktif Filtreler:</span>
              {searchTerm && (
                <span className="bg-tertiary/20 text-tertiary px-2 py-1 rounded-full text-xs font-medium"> 
                  Arama: {searchTerm}
                </span>
              )}
              {filterBMI !== 'all' && (
                <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs font-medium"> 
                  BMI: {filterBMI}
                </span>
              )}
              {filterAdherence !== 'all' && (
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium"> 
                  Uyum: {filterAdherence === 'high' ? 'Yüksek' : filterAdherence === 'medium' ? 'Orta' : 'Düşük'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Danışan Listesi */}
        <div className="space-y-3">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16 text-text-medium border-2 border-dashed border-divider rounded-lg">
              {clients.length === 0 ? (
                <>
                  <div className="text-5xl mb-4 text-text-medium">👥</div>
                  <p className="font-semibold text-lg text-text-dark">Henüz kayıtlı bir danışanınız yok.</p>
                  <p className="mt-2 text-text-medium">Başlamak için yukarıdaki "Yeni Danışan Ekle" butonuna tıklayın.</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4 text-text-medium">🔍</div>
                  <p className="font-semibold text-lg text-text-dark">Filtrelere uygun danışan bulunamadı.</p>
                  <p className="mt-2 text-text-medium">Filtreleri değiştirerek tekrar deneyin.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map(clientItem => {
                const bmi = calculateBMI(clientItem.currentWeight, clientItem.height);
                const bmiCategory = getBMICategory(bmi);
                const weightChange = getWeightChange(clientItem);
                const pendingCount = clientItem.pendingApprovals?.length || 0;

                return (
                  <div
                    key={clientItem.id}
                    onClick={() => navigate(`/dietitian/clients/${clientItem.id}/menu`)}
                    className="border border-divider rounded-xl p-5 hover:border-primary hover:shadow-lg hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md ${getAvatarColorClasses(clientItem.gender)}`}>
                          {clientItem.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          {/* Ad ve Badge'ler */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-lg text-text-dark">{clientItem.name}</h4>
                            
                            {/* BMI Badge */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(bmiCategory.color)}`}>
                              {bmiCategory.label}
                            </span>
                            
                            {/* BMI Değeri */}
                            {bmi && (
                              <span className="text-xs text-text-medium bg-background-light px-2 py-1 rounded">
                                BMI: {bmi}
                              </span>
                            )}

                            {/* Onay Bekleyen Badge */}
                            {pendingCount > 0 && (
                              <span className="px-2 py-1 bg-error/20 text-error rounded-full text-xs font-bold animate-pulse">
                                ⏳ {pendingCount} Onay Bekliyor
                              </span>
                            )}
                          </div>

                          {/* İstatistikler */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            {/* Uyum Oranı */}
                            <div className="flex items-center gap-1">
                              <Activity size={14} className="text-primary" /> 
                              <span className="text-text-dark">
                                <span className="font-bold text-primary">{clientItem.adherence}%</span> uyum
                              </span>
                            </div>

                            {/* Öğün Kaydı */}
                            <div className="flex items-center gap-1">
                              <ChefHat size={14} className="text-tertiary" /> 
                              <span className="text-text-dark">
                                <span className="font-bold">{clientItem.mealsLogged}</span>/{clientItem.totalMeals} öğün
                              </span>
                            </div>

                            {/* Mevcut Kilo */}
                            {clientItem.currentWeight && (
                              <div className="flex items-center gap-1">
                                <span className="text-text-medium">⚖️</span>
                                <span className="text-text-dark">
                                  <span className="font-bold">{clientItem.currentWeight}</span> kg
                                </span>
                              </div>
                            )}

                            {/* Kilo Değişimi */}
                            {weightChange && (
                              <div className={`flex items-center gap-1 font-medium ${
                                parseFloat(weightChange) < 0 ? 'text-primary' : 'text-error' 
                              }`}>
                                {parseFloat(weightChange) < 0 ? (
                                  <>
                                    <TrendingDown size={14} />
                                    <span>{Math.abs(weightChange)} kg</span>
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp size={14} />
                                    <span>+{weightChange} kg</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Ek Bilgi */}
                          <div className="flex items-center gap-2 mt-2 text-xs text-text-medium">
                            {clientItem.height && (
                              <>
                                <span>📏 {clientItem.height} cm</span>
                                <span>•</span>
                              </>
                            )}
                            <span> Hedef: {clientItem.targetWeight} kg</span>
                            <span>•</span>
                            <span> {clientItem.targetCalories} kcal</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detaylar Butonu */}
                      <button className="hidden sm:inline-block bg-primary text-text-dark px-5 py-2 rounded-lg font-medium shadow-sm group-hover:shadow-md transition-all whitespace-nowrap hover:bg-primary/90">
                        Detaylar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sayfa Altı İstatistikleri */}
        {clients.length > 0 && (
          <div className="mt-8 pt-6 border-t border-divider grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-tertiary/10 rounded-lg p-4 text-center border border-tertiary/30">
              <div className="text-2xl font-bold text-tertiary">{clients.length}</div>
              <div className="text-xs text-text-medium mt-1">Toplam Danışan</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/30">
              <div className="text-2xl font-bold text-primary">
                {Math.round(clients.reduce((sum, c) => sum + c.adherence, 0) / clients.length)}%
              </div>
              <div className="text-xs text-text-medium mt-1">Ort. Uyum Oranı</div>
            </div>
            <div className="bg-secondary/10 rounded-lg p-4 text-center border border-secondary/30">
              <div className="text-2xl font-bold text-secondary">
                {clients.reduce((sum, c) => sum + (c.aiUsageCount || 0), 0)}
              </div>
              <div className="text-xs text-text-medium mt-1">AI Kullanımı</div>
            </div>
            <div className="bg-error/10 rounded-lg p-4 text-center border border-error/30">
              <div className="text-2xl font-bold text-error">
                {clients.reduce((sum, c) => sum + (c.pendingApprovals?.length || 0), 0)}
              </div>
              <div className="text-xs text-text-medium mt-1">Onay Bekleyen</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ClientsList;