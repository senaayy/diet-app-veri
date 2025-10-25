// src/components/ShoppingListModal.jsx - Malzeme Bazlı Alışveriş Listesi

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, List, RefreshCw } from 'lucide-react';
import INITIAL_RECIPES from '../data/recipes';
import { DAY_NAMES } from '../data/weeklyMenuTemplate';

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

  // Yiyecek adından malzemeleri bul
  const findIngredientsByMealName = (mealName) => {
    if (!mealName) return [];
    
    // Tarif datasında ara
    const recipe = INITIAL_RECIPES.find(r => 
      r.name.toLowerCase().includes(mealName.toLowerCase()) ||
      mealName.toLowerCase().includes(r.name.toLowerCase())
    );
    
    if (recipe && recipe.ingredients) {
      return recipe.ingredients;
    }
    
    // Eğer tarif bulunamazsa, yemek adını basit malzemelere ayır
    // Örn: "Tavuk Göğsü Salatası" -> ["tavuk göğsü", "salata"]
    const commonIngredients = [
      'tavuk', 'et', 'balık', 'yumurta', 'peynir', 'süt', 'yoğurt',
      'pirinç', 'makarna', 'bulgur', 'ekmek', 'un',
      'domates', 'salatalık', 'marul', 'soğan', 'sarımsak', 'biber',
      'patates', 'havuç', 'kabak', 'patlıcan',
      'zeytinyağı', 'tereyağı', 'tuz', 'karabiber'
    ];
    
    const foundIngredients = [];
    const lowerMealName = mealName.toLowerCase();
    
    commonIngredients.forEach(ing => {
      if (lowerMealName.includes(ing)) {
        foundIngredients.push(ing);
      }
    });
    
    // Eğer hiç malzeme bulunamadıysa, yemek adının kendisini döndür
    return foundIngredients.length > 0 ? foundIngredients : [mealName];
  };

  useEffect(() => {
    const generateList = () => {
      const list = {};
      const daysToProcess = selectedDay === 'all' ? Object.keys(client.weeklyMenu) : [selectedDay];

      daysToProcess.forEach(day => {
        client.weeklyMenu[day]?.forEach(mealItem => {
          let ingredients = [];
          
          // 1. Önce recipe objesinden malzemeleri çek
          if (mealItem.recipe && mealItem.recipe.ingredients) {
            ingredients = mealItem.recipe.ingredients;
          }
          // 2. Recipe yoksa, mealItem.items'dan malzemeleri bul
          else if (mealItem.items) {
            ingredients = findIngredientsByMealName(mealItem.items);
          }
          
          // Malzemeleri listeye ekle
          ingredients.forEach(ingredient => {
            const normalizedIngredient = ingredient.toLowerCase().trim();
            if (normalizedIngredient) {
              list[normalizedIngredient] = (list[normalizedIngredient] || 0) + 1;
            }
          });
        });
      });

      // Alfabetik sırala
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
            <div className="p-3 bg-gradient-to-br from-tertiary to-primary rounded-xl">
              <ShoppingBag className="text-background-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-dark">Alışveriş Listesi</h3>
              <p className="text-text-medium text-sm">{client.name}'in Haftalık Malzemeleri</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-medium hover:text-text-dark">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 border border-divider rounded-xl p-3 bg-background-light">
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
            <div className="text-sm text-text-medium mb-2">
              Toplam {Object.keys(shoppingList).length} malzeme
            </div>
            {Object.keys(shoppingList).map(item => (
              <div 
                key={item} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${checkedItems[item] 
                  ? 'bg-primary/5 border-primary/20 line-through text-text-medium' 
                  : 'bg-background-white border-divider text-text-dark'}`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 text-left">
                  <input
                    type="checkbox"
                    checked={checkedItems[item] || false}
                    onChange={() => handleCheckItem(item)}
                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-lg font-medium capitalize">{item}</span>
                </label>
                <span className="text-sm text-text-medium bg-background-light px-2 py-1 rounded-full">
                  {shoppingList[item]}x
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
            <List className="inline-block text-secondary mb-2" size={24} />
            <p className="text-text-dark">Seçili günler için alışveriş listeniz boş görünüyor. Menünüzü kontrol edin.</p>
          </div>
        )}

        {Object.keys(shoppingList).length > 0 && (
          <button onClick={handleClearChecked} className="w-full mt-6 bg-error text-background-white py-3 rounded-xl font-semibold hover:bg-error/90 transition-colors flex items-center justify-center gap-2">
            <RefreshCw size={18} />
            Tamamlananları Temizle
          </button>
        )}
      </div>
    </div>
  );
};

export default ShoppingListModal;