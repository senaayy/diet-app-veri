// src/pages/dietitian/ClientsList.jsx

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
  const { clients, setClients, loading, error } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBMI, setFilterBMI] = useState('all');
  const [filterAdherence, setFilterAdherence] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleClientAdded = (newClient) => {
    const formattedClient = {
      ...newClient,
      allergens: newClient.allergens ? JSON.parse(newClient.allergens) : [],
      weeklyProgress: newClient.weeklyProgress ? JSON.parse(newClient.weeklyProgress) : [],
      pendingApprovals: [], 
      notifications: [],
      weeklyMenu: {},
    };
    setClients(prevClients => [formattedClient, ...prevClients]);
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

  if (loading) return <div className="text-center p-8">Yükleniyor...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Hata: {error}</div>;

  return (
    <>
      {isModalOpen && <AddClientModal onClose={() => setIsModalOpen(false)} onClientAdded={handleClientAdded} />}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Danışan Listesi</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors shadow-sm"
            >
              <PlusCircle size={18} />
              Yeni Danışan Ekle
            </button>
          </div>

          {/* Arama ve Filtre */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Danışan ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              Filtrele
            </button>
          </div>

          {/* Filtre Seçenekleri */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BMI Kategorisi</label>
                <select
                  value={filterBMI}
                  onChange={(e) => setFilterBMI(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  <option value="Zayıf">Zayıf</option>
                  <option value="Normal">Normal</option>
                  <option value="Fazla Kilolu">Fazla Kilolu</option>
                  <option value="Obez (1. Derece)">Obez (1. Derece)</option>
                  <option value="Obez (2. Derece)">Obez (2. Derece)</option>
                  <option value="Morbid Obez">Morbid Obez</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uyum Durumu</label>
                <select
                  value={filterAdherence}
                  onChange={(e) => setFilterAdherence(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  <option value="high">Yüksek (≥80%)</option>
                  <option value="medium">Orta (50-79%)</option>
                  <option value="low">Düşük (&lt;50%)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Danışan Listesi */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-lg">
              {clients.length === 0 ? (
                <>
                  <p className="font-semibold text-lg">Henüz kayıtlı bir danışanınız yok.</p>
                  <p className="mt-2">Başlamak için yukarıdaki "Yeni Danışan Ekle" butonuna tıklayın.</p>
                </>
              ) : (
                <p className="font-semibold text-lg">Filtrelere uygun danışan bulunamadı.</p>
              )}
            </div>
          ) : (
            filteredClients.map(clientItem => {
              const bmi = calculateBMI(clientItem.currentWeight, clientItem.height);
              const bmiCategory = getBMICategory(bmi);
              const weightChange = getWeightChange(clientItem);

              return (
                <div
                  key={clientItem.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/dietitian/clients/${clientItem.id}/menu`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {clientItem.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg text-gray-800">{clientItem.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(bmiCategory.color)}`}>
                            {bmiCategory.label}
                          </span>
                          {bmi && (
                            <span className="text-xs text-gray-500">BMI: {bmi}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Activity size={14} />
                            {clientItem.adherence}% uyum
                          </span>
                          <span className="flex items-center gap-1">
                            <ChefHat size={14} />
                            {clientItem.mealsLogged}/{clientItem.totalMeals} öğün
                          </span>
                          {clientItem.currentWeight && (
                            <span className="flex items-center gap-1 font-medium">
                              Mevcut: {clientItem.currentWeight} kg
                            </span>
                          )}
                          {weightChange && (
                            <span className={`flex items-center gap-1 font-medium ${parseFloat(weightChange) < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {parseFloat(weightChange) < 0 ? (
                                <>
                                  <TrendingDown size={14} />
                                  {Math.abs(weightChange)} kg
                                </>
                              ) : (
                                <>
                                  <TrendingUp size={14} />
                                  +{weightChange} kg
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button className="hidden sm:inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm group-hover:shadow-md transition-all">
                      Detaylar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default ClientsList;