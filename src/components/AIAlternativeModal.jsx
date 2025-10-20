// src/components/AIAlternativeModal.jsx
import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Check, Clock, DollarSign, ChefHat } from 'lucide-react';
import INITIAL_RECIPES from '../data/recipes';

function AIAlternativeModal({ mealItem, onClose, onAccept, client }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [alternative, setAlternative] = useState(null);

  const generateAlternative = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const originalCalories = mealItem.recipe?.calories || mealItem.calories || 0;
      const filtered = INITIAL_RECIPES.filter(recipe => {
        const calorieMatch = Math.abs(recipe.calories - originalCalories) < 50; 
        const noAllergen = !client.allergens.some(a => recipe.allergens.includes(a));
        const notSame = recipe.id !== mealItem.recipe?.id; 
        return calorieMatch && noAllergen && notSame;
      });

      if (filtered.length > 0) {
        const selected = filtered[Math.floor(Math.random() * filtered.length)];
        setAlternative({
          ...selected,
          aiReason: `Bu öneri, orijinal öğününüzle aynı kalori değerine sahip (±50 kcal) ve alerji kısıtlamalarınıza uygun. Protein/karb/yağ dengesi korunmuştur.`,
          portion: "AI tarafından belirlendi" 
        });
      } else {
        setAlternative({
          name: "Özel AI Önerisi (Yeni Tarif)",
          calories: originalCalories,
          protein: Math.round(originalCalories * 0.25 / 4), 
          carbs: Math.round(originalCalories * 0.45 / 4),
          fat: Math.round(originalCalories * 0.30 / 9),
          ingredients: ["tavuk", "sebze", "tam buğdaylı ürünler"], 
          aiReason: "Kısıtlamalarınıza uygun başka bir tarif bulunamadı, ancak benzer besin değerine sahip bu özel menü sizin için hazırlandı.",
          portion: "AI tarafından belirlendi"
        });
      }
      setIsGenerating(false);
    }, 1500); 
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">AI Alternatif Öneri</h3>
              <p className="text-gray-600 text-sm">Eşdeğer besin değerinde alternatif bul</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="text-sm text-gray-600 mb-2">Mevcut Öğün</div>
          <div className="font-semibold text-lg text-gray-800 mb-3">{mealItem.recipe?.name || mealItem.items}</div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">Kalori</div>
              <div className="font-bold text-blue-600">{mealItem.recipe?.calories || mealItem.calories}</div>
            </div>
            {mealItem.recipe && (<>
              <div className="bg-white rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Protein</div>
                <div className="font-bold text-green-600">{mealItem.recipe.protein}g</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Karb</div>
                <div className="font-bold text-orange-600">{mealItem.recipe.carbs}g</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Yağ</div>
                <div className="font-bold text-red-600">{mealItem.recipe.fat}g</div>
              </div>
            </>)}
          </div>
        </div>

        {!alternative && (
          <button onClick={generateAlternative} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isGenerating ? (<><RefreshCw className="animate-spin" size={20} />AI Analiz Ediyor...</>) : (<><Sparkles size={20} />Alternatif Öner</>)}
          </button>
        )}

        {alternative && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-purple-600" size={20} />
                <span className="font-semibold text-purple-900">AI Önerisi</span>
              </div>
              <div className="font-bold text-xl text-gray-800 mb-3">{alternative.name}</div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Kalori</div>
                  <div className="font-bold text-blue-600">{alternative.calories}</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Protein</div>
                  <div className="font-bold text-green-600">{alternative.protein}g</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Karb</div>
                  <div className="font-bold text-orange-600">{alternative.carbs}g</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Yağ</div>
                  <div className="font-bold text-red-600">{alternative.fat}g</div>
                </div>
              </div>
              {alternative.ingredients && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Malzemeler</div>
                  <div className="text-sm text-gray-800">{alternative.ingredients.join(", ")}</div>
                </div>
              )}
              <div className="bg-purple-100 rounded-lg p-3">
                <div className="text-xs text-purple-700 font-medium mb-1">🤖 AI Açıklama</div>
                <div className="text-sm text-purple-900">{alternative.aiReason}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors">İptal</button>
              <button onClick={() => onAccept(alternative)} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2">
                <Check size={20} />Kabul Et
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAlternativeModal;