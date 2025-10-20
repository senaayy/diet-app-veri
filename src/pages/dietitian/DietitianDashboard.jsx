// src/pages/dietitian/DietitianDashboard.jsx

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../context/ClientContext';
import { Users, Activity, BarChart3, Sparkles, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';
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

  const mealFrequencyData = useMemo(() => {
    const dailyData = {};
    DAYS.forEach(day => { dailyData[day] = { total: 0, breakdown: {} }; });
    clients.forEach(client => {
      Object.keys(client.weeklyMenu).forEach(day => {
        if (dailyData[day]) {
          const loggedMealsCount = client.weeklyMenu[day].filter(meal => meal.status === 'completed' || meal.status === 'skipped').length;
          if (loggedMealsCount > 0) {
            dailyData[day].total += loggedMealsCount;
            dailyData[day].breakdown[client.name] = loggedMealsCount;
          }
        }
      });
    });
    const shortDayNames = { monday: 'Pzt', tuesday: 'Sal', wednesday: 'Çar' };
    return DAYS.map(day => ({ day: shortDayNames[day], meals: dailyData[day].total, breakdown: dailyData[day].breakdown }));
  }, [clients]);

  const totalClients = clients.length;
  const avgAdherence = totalClients > 0 ? Math.round(clients.reduce((sum, c) => sum + c.adherence, 0) / totalClients) : 0;
  const totalAiUsage = totalClients > 0 ? clients.reduce((sum, c) => sum + c.aiUsageCount, 0) : 0;
  const pendingApprovalCount = totalClients > 0 ? clients.reduce((sum, c) => sum + (c.pendingApprovals ? c.pendingApprovals.length : 0), 0) : 0;
  
  // BU KISIM ZATEN DİNAMİK ÇALIŞIYOR
  const aiUsageData = clients.map(c => ({ name: c.name, usage: c.aiUsageCount })).sort((a, b) => b.usage - a.usage);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} title="Toplam Danışan" value={totalClients} onClick={() => navigate('/dietitian/clients')} color="bg-blue-500" />
        <StatCard icon={Activity} title="Uyum Oranı" value={`${avgAdherence}%`} color="bg-green-500" />
        <StatCard icon={Sparkles} title="AI Kullanımı" value={totalAiUsage} color="bg-purple-500" />
        <StatCard icon={Check} title="Onay Bekleyen" value={pendingApprovalCount} onClick={() => navigate('/dietitian/approvals')} color="bg-red-500" />
      </div>
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
            {/* Bu grafik 'aiUsageData'yı kullandığı için zaten dinamik */}
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
    </div>
  );
}

export default DietitianDashboard;
