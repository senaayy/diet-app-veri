// src/components/ClientApp.jsx
import React, { useState } from 'react';
import { ChefHat, Sparkles, Apple, Clock, DollarSign, AlertCircle, Plus, X, Check, TrendingUp, Activity, Flame } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WeightTrackingChart from '../components/WeightTrackingChart';

// Dışarıdan import edilen veriler
import INITIAL_RECIPES from '../data/recipes';

function ClientApp({ client, onBack }) { // Bileşen adı ClientApp olarak değiştirildi
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [maxBudget, setMaxBudget] = useState(50);
  const [maxCookTime, setMaxCookTime] = useState(30);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [surpriseCount, setSurpriseCount] = useState(0);

  const filterRecipes = () => {
    return INITIAL_RECIPES.filter(recipe => {
      const hasAllergen = recipe.allergens.some(a => client.allergens.includes(a));
      if (hasAllergen) return false;

      // Basit kalori eşleşmesi (hedef günlük kalori / 4 öğün * %10 tolerans)
      const calorieMatch = Math.abs(recipe.calories - client.targetCalories / 4) < client.targetCalories * 0.1;
      
      if (recipe.cost > maxBudget || recipe.cookTime > maxCookTime) return false;

      // Malzeme kısıtı: Eğer malzeme girilmişse, tarif en az 1 malzemeyi içermeli
      if (availableIngredients.length > 0) {
        const matchCount = recipe.ingredients.filter(i => 
          availableIngredients.some(ai => ai.toLowerCase() === i.toLowerCase())
        ).length;
        return matchCount >= 1;
      }

      return calorieMatch;
    });
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !availableIngredients.includes(ingredientInput.trim())) {
      setAvailableIngredients([...availableIngredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing) => {
    setAvailableIngredients(availableIngredients.filter(i => i !== ing));
  };

  const generateMeal = () => {
    const filtered = filterRecipes();
    if (filtered.length > 0) {
      setCurrentMeal(filtered[Math.floor(Math.random() * filtered.length)]);
    } else {
      setCurrentMeal(null); // Uygun tarif bulunamazsa temizle
    }
  };

  const generateSurprise = () => {
    const filtered = filterRecipes();
    if (filtered.length > 0) {
      const alternatives = filtered.filter(r => r.id !== currentMeal?.id);
      if (alternatives.length > 0) {
        setCurrentMeal(alternatives[Math.floor(Math.random() * alternatives.length)]);
        setSurpriseCount(surpriseCount + 1);
      } else {
        alert("Başka alternatif tarif bulunamadı!");
      }
    }
  };

  const filteredRecipes = filterRecipes();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <button onClick={onBack} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
          ← Geri Dön
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{client.name}</h2>
            <p className="text-blue-100">Kişisel Beslenme Asistanı</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{client.currentWeight} kg</div>
            <div className="text-blue-100">Hedef: {client.targetWeight} kg</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-600">İlerleme</div>
              <div className="text-xl font-bold text-gray-800">
                {(client.startWeight - client.currentWeight).toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-600">Uyum Oranı</div>
              <div className="text-xl font-bold text-gray-800">{client.adherence}%</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="text-orange-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-600">Günlük Kalori</div>
              <div className="text-xl font-bold text-gray-800">{client.targetCalories}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChefHat className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-600">Öğün Kaydı</div>
              <div className="text-xl font-bold text-gray-800">{client.mealsLogged}/{client.totalMeals}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <WeightTrackingChart 
        clientId={client.id}
        clientName={client.name}
        targetWeight={client.targetWeight}
        height={client.height}
      />

      {/* Meal Planning Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ChefHat className="text-blue-600" />
          Öğün Planlama
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evdeki Malzemeler
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Malzeme ekle..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addIngredient}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableIngredients.map(ing => (
                <span key={ing} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {ing}
                  <button onClick={() => removeIngredient(ing)} className="hover:text-green-600">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Bütçe: {maxBudget}₺
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maks. Pişirme: {maxCookTime} dk
              </label>
              <input
                type="range"
                min="10"
                max="60"
                value={maxCookTime}
                onChange={(e) => setMaxCookTime(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateMeal}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <ChefHat size={20} />
            Öğün Öner
          </button>
          {currentMeal && (
            <button
              onClick={generateSurprise}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles size={20} />
              Sürpriz Alternatif ({surpriseCount})
            </button>
          )}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <AlertCircle className="inline-block text-yellow-600 mb-2" size={24} />
            <p className="text-gray-700">Kısıtlamalarınıza uygun tarif bulunamadı. Lütfen bütçe veya süre limitlerini artırın.</p>
          </div>
        )}

        {currentMeal && (
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Check className="text-green-500" size={28} />
              {currentMeal.name}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-gray-600 text-sm">Kalori</div>
                <div className="text-xl font-bold text-blue-600">{currentMeal.calories}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-gray-600 text-sm">Protein</div>
                <div className="text-xl font-bold text-green-600">{currentMeal.protein}g</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-gray-600 text-sm">Karbonhidrat</div>
                <div className="text-xl font-bold text-orange-600">{currentMeal.carbs}g</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-gray-600 text-sm">Yağ</div>
                <div className="text-xl font-bold text-red-600">{currentMeal.fat}g</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <ChefHat size={18} className="text-purple-500" />
                <span className="font-medium">Malzemeler:</span>
                <span>{currentMeal.ingredients.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={18} className="text-blue-500" />
                <span className="font-medium">Hazırlama:</span>
                <span>{currentMeal.cookTime} dakika</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign size={18} className="text-green-500" />
                <span className="font-medium">Tahmini Maliyet:</span>
                <span>{currentMeal.cost}₺</span>
              </div>
            </div>
          </div>
        )}

        {surpriseCount > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200">
            <Sparkles className="inline-block text-purple-600 mb-2" size={20} />
            <p className="text-gray-700">
              <span className="font-bold text-purple-600">{surpriseCount}</span> kez sürpriz alternatif kullandınız! 
              Motivasyonunuz yüksek 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientApp;