// src/pages/dietitian/DietitianDashboard.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../context/ClientContext';
import { Users, Activity, BarChart3, Sparkles, Check, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '../../components/StatCard';
import BMIFilter from '../../components/BMIFilter';
import WeightTrackingChart from '../../components/WeightTrackingChart';
import { DAYS } from '../../data/weeklyMenuTemplate';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const breakdown = data.breakdown || {};

    if (Object.keys(breakdown).length === 0) {
        return (
             <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-gray-800">{`${label}`}</p>
                <p className="text-sm text-gray-700">Bu gün kayıtlı öğün yok.</p>
            </div>
        );
    }

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{`${label}`}</p>
        <p className="text-sm text-blue-600 font-semibold mb-2">{`Toplam Kayıtlı Öğün: ${data.meals}`}</p>
        <div className="border-t pt-2">
          <p className="text-xs font-bold text-gray-600 mb-1">Dağılım:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {Object.entries(breakdown).map(([clientName, count]) => (
              <li key={clientName}>
                <span className="font-semibold">{clientName}:</span> {count} öğün
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return null;
};

function DietitianDashboard() {
  const navigate = useNavigate();
  const { clients } = useClients();
  const [selectedBMICategory, setSelectedBMICategory] = useState('Tümü');
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientCounts, setClientCounts] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);

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

  // BMI bilgileri ile danışanları işle
  const clientsWithBMI = useMemo(() => {
    return clients.map(client => {
      const bmi = calculateBMI(client.currentWeight, client.height);
      return {
        ...client,
        bmi: bmi ? Math.round(bmi * 10) / 10 : null,
        bmiCategory: getBMICategory(bmi)
      };
    });
  }, [clients]);

  // BMI kategorilerine göre filtreleme
  useEffect(() => {
    let filtered = clientsWithBMI;
    
    if (selectedBMICategory !== 'Tümü') {
      filtered = clientsWithBMI.filter(client => client.bmiCategory === selectedBMICategory);
    }
    
    setFilteredClients(filtered);
  }, [clientsWithBMI, selectedBMICategory]);

  // BMI kategorilerine göre sayıları hesapla
  useEffect(() => {
    const counts = {
      total: clientsWithBMI.length,
      zayif: clientsWithBMI.filter(c => c.bmiCategory === 'Zayıf').length,
      normal: clientsWithBMI.filter(c => c.bmiCategory === 'Normal').length,
      fazlaKilolu: clientsWithBMI.filter(c => c.bmiCategory === 'Fazla kilolu').length,
      obez: clientsWithBMI.filter(c => c.bmiCategory === 'Obez').length,
      morbidObez: clientsWithBMI.filter(c => c.bmiCategory === 'Morbid obez').length
    };
    setClientCounts(counts);
  }, [clientsWithBMI]);

  const mealFrequencyData = useMemo(() => {
    const dailyData = {};
    
    // Tüm günleri başlat
    DAYS.forEach(day => { 
      dailyData[day] = { total: 0, breakdown: {} }; 
    });
    
    // Her danışan için haftalık menüyü işle
    clients.forEach(client => {
      if (client.weeklyMenu && typeof client.weeklyMenu === 'object') {
        Object.keys(client.weeklyMenu).forEach(day => {
          if (dailyData[day] && Array.isArray(client.weeklyMenu[day])) {
            const loggedMealsCount = client.weeklyMenu[day].filter(meal => 
              meal.status === 'completed' || meal.status === 'skipped'
            ).length;
            
            if (loggedMealsCount > 0) {
              dailyData[day].total += loggedMealsCount;
              dailyData[day].breakdown[client.name] = loggedMealsCount;
            }
          }
        });
      }
    });
    
    const shortDayNames = { 
      monday: 'Pzt', 
      tuesday: 'Sal', 
      wednesday: 'Çar',
      thursday: 'Per',
      friday: 'Cum',
      saturday: 'Cmt',
      sunday: 'Paz'
    };
    
    return DAYS.map(day => ({ 
      day: shortDayNames[day] || day, 
      meals: dailyData[day].total, 
      breakdown: dailyData[day].breakdown 
    }));
  }, [clients]);

  const totalClients = clients.length;
  const avgAdherence = totalClients > 0 ? Math.round(clients.reduce((sum, c) => sum + c.adherence, 0) / totalClients) : 0;
  const totalAiUsage = totalClients > 0 ? clients.reduce((sum, c) => sum + c.aiUsageCount, 0) : 0;
  const pendingApprovalCount = totalClients > 0 ? clients.reduce((sum, c) => sum + (c.pendingApprovals ? c.pendingApprovals.length : 0), 0) : 0;
  
  // BU KISIM ZATEN DİNAMİK ÇALIŞIYOR
  const aiUsageData = clients.map(c => ({ name: c.name, usage: c.aiUsageCount })).sort((a, b) => b.usage - a.usage);

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları - En Üstte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} title="Toplam Danışan" value={totalClients} onClick={() => navigate('/dietitian/clients')} color="bg-blue-500" />
        <StatCard icon={Activity} title="Uyum Oranı" value={`${avgAdherence}%`} color="bg-green-500" />
        <StatCard icon={Sparkles} title="AI Kullanımı" value={totalAiUsage} color="bg-purple-500" />
        <StatCard icon={Check} title="Onay Bekleyen" value={pendingApprovalCount} onClick={() => navigate('/dietitian/approvals')} color="bg-red-500" />
      </div>

      {/* Grafikler - İstatistik Kartlarının Hemen Altında */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Haftalık Öğün Takibi</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mealFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.6)' }} />
              <Bar dataKey="meals" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Danışan AI Kullanım Raporu</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={aiUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={12} />
              <Tooltip formatter={(value) => [`${value} kez`, 'Kullanım']} />
              <Bar dataKey="usage" fill="#8884d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BMI Filtreleme - En Altta */}
      <BMIFilter 
        onFilterChange={setSelectedBMICategory}
        selectedCategory={selectedBMICategory}
        clientCounts={clientCounts}
      />

      {/* Filtrelenmiş Danışan Listesi */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedBMICategory === 'Tümü' ? 'Tüm Danışanlar' : `${selectedBMICategory} Danışanlar`}
          </h3>
          <span className="text-sm text-gray-500">{filteredClients.length} danışan</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{client.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.bmiCategory === 'Normal' ? 'bg-green-100 text-green-700' :
                  client.bmiCategory === 'Zayıf' ? 'bg-blue-100 text-blue-700' :
                  client.bmiCategory === 'Fazla kilolu' ? 'bg-yellow-100 text-yellow-700' :
                  client.bmiCategory === 'Obez' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {client.bmiCategory}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <p>Kilo: {client.currentWeight} kg</p>
                <p>Hedef: {client.targetWeight} kg</p>
                {client.bmi && <p>BMI: {client.bmi}</p>}
                <p>Uyum: {client.adherence}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kilo Takibi Grafiği */}
      {selectedClient && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedClient.name} - Kilo Takibi
            </h3>
            <button
              onClick={() => setSelectedClient(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <WeightTrackingChart 
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            targetWeight={selectedClient.targetWeight}
            height={selectedClient.height}
          />
        </div>
      )}
    </div>
  );
}

export default DietitianDashboard;
