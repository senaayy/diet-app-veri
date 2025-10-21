// src/pages/dietitian/ClientsList.jsx - TAMAMEN DÜZELTILMIŞ

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../context/ClientContext';
import { ChefHat, Activity, PlusCircle, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import AddClientModal from '../../components/AddClientModal.jsx';

// BMI Hesaplama ve Kategori Belirleme
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return { label: 'Bilinmiyor', color: 'gray' };
  
  if (bmi < 18.5) return { label: 'Zayıf', color: 'blue' };
  if (bmi < 25) return { label: 'Normal', color: 'green' };
  if (bmi < 30) return { label: 'Fazla Kilolu', color: 'yellow' };
  if (bmi < 35) return { label: 'Obez (1. Derece)', color: 'orange' };
  if (bmi < 40) return { label: 'Obez (2. Derece)', color: 'red' };
  return { label: 'Morbid Obez', color: 'red' };
};

const getBadgeColor = (color) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return colors[color] || colors.gray;
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

  // ✅ DÜZELTILMIŞ: Context zaten state'i güncelliyor, 
  // bu fonksiyon sadece modal'ı kapatıyor
  const handleClientAdded = () => {
    setIsModalOpen(false);
  };

  // Filtreleme fonksiyonu
  const filteredClients = clients.filter(client => {
    // İsim araması
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // BMI filtresi
    let matchesBMI = true;
    if (filterBMI !== 'all') {
      const bmi = calculateBMI(client.currentWeight, client.height);
      const category = getBMICategory(bmi);
      matchesBMI = category.label === filterBMI;
    }
    
    // Uyum filtresi
    let matchesAdherence = true;
    if (filterAdherence === 'high') matchesAdherence = client.adherence >= 80;
    else if (filterAdherence === 'medium') matchesAdherence = client.adherence >= 50 && client.adherence < 80;
    else if (filterAdherence === 'low') matchesAdherence = client.adherence < 50;
    
    return matchesSearch && matchesBMI && matchesAdherence;
  });

  // ✅ Yükleniyor ve hata durumları
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Danışanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl shadow-sm border-2 border-red-200 p-6">
        <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Hata</h3>
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-3">Backend sunucusunun (port 3001) çalıştığından emin olun.</p>
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
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Danışan Listesi</h3>
              <p className="text-sm text-gray-600 mt-1">
                Toplam: <span className="font-semibold text-blue-600">{clients.length}</span> danışan
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle size={20} />
              Yeni Danışan Ekle
            </button>
          </div>

          {/* Arama ve Filtre */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Danışan ara (ad, soyad)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              Filtrele
            </button>
          </div>

          {/* Filtre Seçenekleri */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📊 BMI Kategorisi</label>
                <select
                  value={filterBMI}
                  onChange={(e) => setFilterBMI(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Tümü</option>
                  <option value="Zayıf">Zayıf</option>
                  <option value="Normal">Normal Ağırlık</option>
                  <option value="Fazla Kilolu">Fazla Kilolu</option>
                  <option value="Obez (1. Derece)">Obez (1. Derece)</option>
                  <option value="Obez (2. Derece)">Obez (2. Derece)</option>
                  <option value="Morbid Obez">Morbid Obez</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📈 Uyum Durumu</label>
                <select
                  value={filterAdherence}
                  onChange={(e) => setFilterAdherence(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
              <span className="text-gray-600">Aktif Filtreler:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  Arama: {searchTerm}
                </span>
              )}
              {filterBMI !== 'all' && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  BMI: {filterBMI}
                </span>
              )}
              {filterAdherence !== 'all' && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Uyum: {filterAdherence === 'high' ? 'Yüksek' : filterAdherence === 'medium' ? 'Orta' : 'Düşük'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Danışan Listesi */}
        <div className="space-y-3">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              {clients.length === 0 ? (
                <>
                  <div className="text-5xl mb-4">👥</div>
                  <p className="font-semibold text-lg text-gray-700">Henüz kayıtlı bir danışanınız yok.</p>
                  <p className="mt-2 text-gray-600">Başlamak için yukarıdaki "Yeni Danışan Ekle" butonuna tıklayın.</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="font-semibold text-lg text-gray-700">Filtrelere uygun danışan bulunamadı.</p>
                  <p className="mt-2 text-gray-600">Filtreleri değiştirerek tekrar deneyin.</p>
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
                    className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                          {clientItem.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          {/* Ad ve Badge'ler */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-lg text-gray-800">{clientItem.name}</h4>
                            
                            {/* BMI Badge */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(bmiCategory.color)}`}>
                              {bmiCategory.label}
                            </span>
                            
                            {/* BMI Değeri */}
                            {bmi && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                BMI: {bmi}
                              </span>
                            )}

                            {/* Onay Bekleyen Badge */}
                            {pendingCount > 0 && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold animate-pulse">
                                ⏳ {pendingCount} Onay Bekliyor
                              </span>
                            )}
                          </div>

                          {/* İstatistikler */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            {/* Uyum Oranı */}
                            <div className="flex items-center gap-1">
                              <Activity size={14} className="text-green-500" />
                              <span className="text-gray-700">
                                <span className="font-bold text-green-600">{clientItem.adherence}%</span> uyum
                              </span>
                            </div>

                            {/* Öğün Kaydı */}
                            <div className="flex items-center gap-1">
                              <ChefHat size={14} className="text-blue-500" />
                              <span className="text-gray-700">
                                <span className="font-bold">{clientItem.mealsLogged}</span>/{clientItem.totalMeals} öğün
                              </span>
                            </div>

                            {/* Mevcut Kilo */}
                            {clientItem.currentWeight && (
                              <div className="flex items-center gap-1">
                                <span>⚖️</span>
                                <span className="text-gray-700">
                                  <span className="font-bold">{clientItem.currentWeight}</span> kg
                                </span>
                              </div>
                            )}

                            {/* Kilo Değişimi */}
                            {weightChange && (
                              <div className={`flex items-center gap-1 font-medium ${
                                parseFloat(weightChange) < 0 ? 'text-green-600' : 'text-orange-600'
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
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
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
                      <button className="hidden sm:inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm group-hover:shadow-md transition-all whitespace-nowrap">
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
          <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
              <div className="text-xs text-gray-600 mt-1">Toplam Danışan</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(clients.reduce((sum, c) => sum + c.adherence, 0) / clients.length)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Ort. Uyum Oranı</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {clients.reduce((sum, c) => sum + c.aiUsageCount, 0)}
              </div>
              <div className="text-xs text-gray-600 mt-1">AI Kullanımı</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {clients.reduce((sum, c) => sum + (c.pendingApprovals?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Onay Bekleyen</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ClientsList;