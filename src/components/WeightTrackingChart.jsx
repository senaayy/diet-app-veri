// src/components/WeightTrackingChart.jsx - Renk Paleti Uygulanmış Hali

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Calendar } from 'lucide-react';

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

const WeightTrackingChart = ({ clientId, clientName, targetWeight, height, lineColor }) => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    fetchWeightHistory();
  }, [clientId]);

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}/weight-history`);
      const data = await response.json();
      setWeightHistory(data);
      
      // Mevcut haftayı belirle
      if (data.length > 0) {
        const maxWeek = Math.max(...data.map(entry => entry.week));
        setCurrentWeek(maxWeek + 1);
      }
    } catch (error) {
      console.error('Kilo geçmişi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWeightEntry = async (weight, week, notes = '') => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight, week, notes }),
      });

      if (response.ok) {
        await fetchWeightHistory();
        setCurrentWeek(week + 1);
      }
    } catch (error) {
      console.error('Kilo girişi hatası:', error);
    }
  };

  // Grafik verilerini hazırla
  const chartData = weightHistory.map(entry => ({
    week: `Hafta ${entry.week}`,
    weight: entry.weight,
    date: new Date(entry.date).toLocaleDateString('tr-TR')
  }));

  // BMI hesaplama
  const calculateBMI = (weight, height) => {
    if (!height || height <= 0) return null;
    return weight / Math.pow(height / 100, 2);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Bilinmiyor';
    if (bmi < 18.5) return 'Zayıf';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Fazla kilolu';
    if (bmi < 35) return 'Obez';
    return 'Morbid obez';
  };

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0;
  const currentBMI = calculateBMI(currentWeight, height);
  const bmiCategory = getBMICategory(currentBMI);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div> {/* Spinner rengi */}
      </div>
    );
  }

  return (
    <div className="bg-background-white rounded-xl shadow-lg p-6 border border-divider">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-dark">{clientName} - Kilo Takibi</h3>
          <p className="text-sm text-text-medium">Haftalık kilo değişimi</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-text-medium">Mevcut Kilo</p>
            <p className="text-2xl font-bold text-tertiary">{currentWeight} kg</p> {/* Turuncu */}
          </div>
          <div className="text-center">
            <p className="text-sm text-text-medium">Hedef</p>
            <p className="text-2xl font-bold text-primary">{targetWeight} kg</p> {/* Yeşil */}
          </div>
        </div>
      </div>

      {/* BMI Bilgisi */}
      {currentBMI && (
        <div className="mb-6 p-4 bg-background-light rounded-lg border border-divider">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-medium">Vücut Kitle İndeksi</p>
              <p className="text-2xl font-bold text-secondary">{currentBMI.toFixed(1)}</p> {/* Sarı */}
            </div>
            <div className="text-right">
              <p className="text-sm text-text-medium">Kategori</p>
              <p className={`text-lg font-semibold ${
                bmiCategory === 'Normal' ? 'text-primary' :
                bmiCategory === 'Zayıf' ? 'text-secondary' :
                bmiCategory === 'Fazla kilolu' ? 'text-tertiary' :
                bmiCategory === 'Obez' ? 'text-error' :
                'text-error'
              }`}>
                {bmiCategory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grafik */}
      <div className="mb-6">
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  stroke={lineColor || COLORS.tertiary} // Prop veya varsayılan turuncu
                  strokeWidth={3}
                  dot={{ fill: lineColor || COLORS.tertiary, strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: lineColor || COLORS.tertiary, strokeWidth: 2 }}
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

      {/* Kilo Girişi Formu */}
      <div className="border-t border-divider pt-4">
        <h4 className="text-lg font-semibold text-text-dark mb-4">Yeni Kilo Girişi</h4>
        <WeightEntryForm 
          onAddWeight={addWeightEntry}
          currentWeek={currentWeek}
          targetWeight={targetWeight}
        />
      </div>
    </div>
  );
};

// Kilo girişi formu komponenti
const WeightEntryForm = ({ onAddWeight, currentWeek, targetWeight }) => {
  const [weight, setWeight] = useState('');
  const [week, setWeek] = useState(currentWeek);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !week) return;

    setIsSubmitting(true);
    await onAddWeight(parseFloat(weight), parseInt(week), notes);
    
    setWeight('');
    setNotes('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">
            Kilo (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Örn: 75.5"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">
            Hafta
          </label>
          <input
            type="number"
            min="1"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="w-full px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting || !weight || !week}
            className="w-full bg-primary text-text-dark py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kilo Ekle'}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Notlar (Opsiyonel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={2}
          placeholder="Bu hafta hakkında notlar..."
        />
      </div>
    </form>
  );
};

export default WeightTrackingChart;