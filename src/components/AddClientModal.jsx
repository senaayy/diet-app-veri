// src/components/AddClientModal.jsx - Renk Paleti ve Cinsiyet Alanı Uygulanmış Hali (KESİN)

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

function AddClientModal({ onClose, onClientAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Belirtilmedi', // <-- BURAYA gender ALANI EKLENDİ
    height: '', 
    targetCalories: '',
    protein: '',
    carbs: '',
    fat: '',
    allergens: [],
    currentWeight: '',
    targetWeight: '',
    startWeight: '',
  });

  const [allergenInput, setAllergenInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergenInput.trim()]
      }));
      setAllergenInput('');
    }
  };

  const handleRemoveAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // gender alanı formData'da zaten doğru şekilde yer alıyor
          height: parseFloat(formData.height) || null,
          targetCalories: parseInt(formData.targetCalories) || 0,
          protein: parseInt(formData.protein) || 0,
          carbs: parseInt(formData.carbs) || 0,
          fat: parseInt(formData.fat) || 0,
          currentWeight: parseFloat(formData.currentWeight) || 0,
          targetWeight: parseFloat(formData.targetWeight) || 0,
          startWeight: parseFloat(formData.startWeight) || 0,
          allergens: JSON.stringify(formData.allergens),
          weeklyProgress: JSON.stringify([]),
          adherence: 0,
          mealsLogged: 0,
          totalMeals: 0,
        }),
      });

      if (response.ok) {
        const newClient = await response.json();
        onClientAdded(newClient);
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Danışan eklenirken bir hata oluştu: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Bağlantı hatası oluştu. Backend sunucusunun çalıştığından emin olun.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-background-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-dark">Yeni Danışan Ekle</h2>
          <button 
            onClick={onClose} 
            className="text-text-medium hover:text-text-dark transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-dark text-lg">Temel Bilgiler</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Danışan adı ve soyadı"
                className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
              />
            </div>

            {/* Cinsiyet Seçimi - YENİ EKLENEN KISIM */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                Cinsiyet
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark bg-background-white"
              >
                <option value="Belirtilmedi">Belirtilmedi</option>
                <option value="Kadın">Kadın</option>
                <option value="Erkek">Erkek</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            {/* Cinsiyet Seçimi SONU */}

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                Boy (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                placeholder="170"
                className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Başlangıç Kilosu (kg)
                </label>
                <input
                  type="number"
                  name="startWeight"
                  value={formData.startWeight}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="75.5"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Mevcut Kilo (kg)
                </label>
                <input
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="73.2"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Hedef Kilo (kg)
                </label>
                <input
                  type="number"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="70.0"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
            </div>
          </div>

          {/* Makro Hedefleri */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-dark text-lg">Günlük Hedefler</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Hedef Kalori *
                </label>
                <input
                  type="number"
                  name="targetCalories"
                  value={formData.targetCalories}
                  onChange={handleChange}
                  required
                  placeholder="2000"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  placeholder="150"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Karbonhidrat (g)
                </label>
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleChange}
                  placeholder="200"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Yağ (g)
                </label>
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
                />
              </div>
            </div>
          </div>

          {/* Alerjenler */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-dark text-lg">Alerjenler</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergen())}
                placeholder="Alerjen ekle (örn: Fındık)"
                className="flex-1 p-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
              />
              <button
                type="button"
                onClick={handleAddAllergen}
                className="px-6 py-3 bg-background-light text-text-dark rounded-lg hover:bg-divider font-semibold"
              >
                Ekle
              </button>
            </div>

            {formData.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-error/10 text-error px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergen(allergen)}
                      className="hover:text-error/80"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Butonları */}
          <div className="flex justify-end gap-4 pt-4 border-t border-divider">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-background-light text-text-dark rounded-lg hover:bg-divider font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-text-dark rounded-lg hover:bg-primary/90 font-semibold transition-colors shadow-sm"
            >
              Danışanı Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClientModal;