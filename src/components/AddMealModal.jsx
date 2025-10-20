// src/components/AddMealModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

function AddMealModal({ day, onClose, onSave }) {
  const [meal, setMeal] = useState({
    id: `meal-${Date.now()}`, // Benzersiz bir ID oluştur
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
    // Kaloriyi sayıya çevir
    const finalMeal = { ...meal, calories: parseInt(meal.calories) || 0 };
    onSave(finalMeal);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{day} Gününe Öğün Ekle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select name="mealType" value={meal.mealType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50">
            <option>Kahvaltı</option>
            <option>Öğle</option>
            <option>Akşam</option>
            <option>Ara Öğün</option>
          </select>
          <input type="text" name="items" value={meal.items} onChange={handleChange} placeholder="Yiyecekler (örn: 1 elma, 10 badem)" required className="w-full p-3 border rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="portion" value={meal.portion} onChange={handleChange} placeholder="Porsiyon (örn: 1 kase)" className="w-full p-3 border rounded-lg" />
            <input type="number" name="calories" value={meal.calories} onChange={handleChange} placeholder="Toplam Kalori" required className="w-full p-3 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">İptal</button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">Öğünü Ekle</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMealModal;