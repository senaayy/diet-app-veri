// src/components/AddMealModal.jsx - Renk Paleti Uygulanmış Hali

import React, { useState } from 'react';
import { X } from 'lucide-react';

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

function AddMealModal({ day, onClose, onSave }) {
  const [meal, setMeal] = useState({
    id: `meal-${Date.now()}`, 
    mealType: 'Kahvaltı',
    items: '',
    calories: '',
    portion: '',
    status: 'pending',
    aiModified: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeal(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalMeal = { ...meal, calories: parseInt(meal.calories) || 0 };
    onSave(finalMeal);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-background-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-dark">{day} Gününe Öğün Ekle</h2>
          <button onClick={onClose} className="text-text-medium hover:text-text-dark"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select 
            name="mealType" 
            value={meal.mealType} 
            onChange={handleChange} 
            className="w-full p-3 border border-divider rounded-lg bg-background-light text-text-dark focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option>Kahvaltı</option>
            <option>Öğle</option>
            <option>Akşam</option>
            <option>Ara Öğün</option>
          </select>
          <input 
            type="text" 
            name="items" 
            value={meal.items} 
            onChange={handleChange} 
            placeholder="Yiyecekler (örn: 1 elma, 10 badem)" 
            required 
            className="w-full p-3 border border-divider rounded-lg text-text-dark focus:ring-2 focus:ring-primary focus:border-transparent" 
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              name="portion" 
              value={meal.portion} 
              onChange={handleChange} 
              placeholder="Porsiyon (örn: 1 kase)" 
              className="w-full p-3 border border-divider rounded-lg text-text-dark focus:ring-2 focus:ring-primary focus:border-transparent" 
            />
            <input 
              type="number" 
              name="calories" 
              value={meal.calories} 
              onChange={handleChange} 
              placeholder="Toplam Kalori" 
              required 
              className="w-full p-3 border border-divider rounded-lg text-text-dark focus:ring-2 focus:ring-primary focus:border-transparent" 
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-divider">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 bg-background-light text-text-dark rounded-lg hover:bg-divider font-semibold transition-colors"
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary text-text-dark rounded-lg hover:bg-primary/90 font-semibold shadow-sm transition-colors"
            >
              Öğünü Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMealModal;