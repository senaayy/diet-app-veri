// src/components/ShoppingListModal.jsx - Renk Paleti Uygulanmış Hali

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, List, RefreshCw } from 'lucide-react';
import INITIAL_RECIPES from '../data/recipes';
import { DAY_NAMES } from '../data/weeklyMenuTemplate';

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

const ShoppingListModal = ({ client, onClose }) => {
  const [shoppingList, setShoppingList] = useState({});
  const [selectedDay, setSelectedDay] = useState('all'); 
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem(`shoppingListChecked_${client.id}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const generateList = () => {
      const list = {};
      const daysToProcess = selectedDay === 'all' ? Object.keys(client.weeklyMenu) : [selectedDay];

      daysToProcess.forEach(day => {
        client.weeklyMenu[day]?.forEach(mealItem => {
          const recipe = mealItem.recipe;
          const items = mealItem.items; 

          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ingredient => {
              const normalizedIngredient = ingredient.toLowerCase().trim();
              list[normalizedIngredient] = (list[normalizedIngredient] || 0) + 1;
            });
          } else if (items) {
            items.split(',').forEach(item => {
              const normalizedItem = item.toLowerCase().trim();
              if (normalizedItem) {
                list[normalizedItem] = (list[normalizedItem] || 0) + 1;
              }
            });
          }
        });
      });

      const sortedList = Object.keys(list).sort().reduce(
        (obj, key) => { 
          obj[key] = list[key]; 
          return obj;
        }, 
        {}
      );

      setShoppingList(sortedList);
    };

    generateList();
  }, [client.weeklyMenu, selectedDay]);

  useEffect(() => {
    localStorage.setItem(`shoppingListChecked_${client.id}`, JSON.stringify(checkedItems));
  }, [checkedItems, client.id]);


  const handleCheckItem = (item) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleClearChecked = () => {
    setCheckedItems({});
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const daysOfWeek = Object.keys(client.weeklyMenu);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-background-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-tertiary to-primary rounded-xl"> {/* Alışveriş için turuncu-yeşil gradyan */}
              <ShoppingBag className="text-background-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-dark">Alışveriş Listesi</h3>
              <p className="text-text-medium text-sm">{client.name}'in Haftalık Menüsüne Göre</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-medium hover:text-text-dark">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 border border-divider rounded-xl p-3 bg-background-light"> {/* Gün seçici kutusu */}
          <label className="block text-sm font-medium text-text-dark mb-2">Hangi günlerin listesini görmek istersin?</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectDay('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDay === 'all' ? 'bg-primary text-text-dark shadow-md' : 'bg-background-light text-text-dark hover:bg-divider'}`}
            >
              Tüm Hafta
            </button>
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => handleSelectDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDay === day ? 'bg-primary text-text-dark shadow-md' : 'bg-background-light text-text-dark hover:bg-divider'}`}
              >
                {DAY_NAMES[day]}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(shoppingList).length > 0 ? (
          <div className="space-y-3">
            {Object.keys(shoppingList).map(item => (
              <div 
                key={item} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${checkedItems[item] 
                  ? 'bg-primary/5 border-primary/20 line-through text-text-medium' // Tamamlandıysa primary'nin açık tonu
                  : 'bg-background-white border-divider text-text-dark'}`} // Normalde nötr
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 text-left">
                  <input
                    type="checkbox"
                    checked={checkedItems[item] || false}
                    onChange={() => handleCheckItem(item)}
                    className="form-checkbox h-5 w-5 text-primary rounded-full focus:ring-primary" // Checkbox rengi
                  />
                  <span className="text-lg font-medium">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                </label>
                <span className="text-sm text-text-medium">({shoppingList[item]} öğünde)</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center"> {/* Liste boşsa sarımsı uyarı */}
            <List className="inline-block text-secondary mb-2" size={24} />
            <p className="text-text-dark">Seçili günler için alışveriş listeniz boş görünüyor. Menünüzü kontrol edin.</p>
          </div>
        )}

        {Object.keys(shoppingList).length > 0 && (
          <button onClick={handleClearChecked} className="w-full mt-6 bg-error text-background-white py-3 rounded-xl font-semibold hover:bg-error/90 transition-colors flex items-center justify-center gap-2">
            <RefreshCw size={18} />Tamamlananları Temizle
          </button>
        )}
      </div>
    </div>
  );
};

export default ShoppingListModal;