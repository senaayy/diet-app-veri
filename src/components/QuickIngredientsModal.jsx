// src/components/QuickIngredientsModal.jsx
import React, { useState } from 'react';
import { ChefHat, Plus, X, Sparkles, RefreshCw, Award, AlertCircle, Check } from 'lucide-react';
import INITIAL_RECIPES from '../data/recipes';

function QuickIngredientsModal({ onClose, onAccept, client }) {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const commonIngredients = ['tavuk', 'yumurta', 'peynir', 'domates', 'salatalık', 'makarna', 'pirinç', 'patates', 'soğan', 'zeytinyağı', 'süt', 'yoğurt', 'ekmek', 'mercimek', 'nohut'];

  const addIngredient = (ing) => {
    if (ing && !ingredients.includes(ing)) {
      setIngredients([...ingredients, ing]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const generateFromIngredients = () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      const matchedRecipes = INITIAL_RECIPES.filter(recipe => {
        const noAllergen = !client.allergens.some(a => recipe.allergens.includes(a));
        if (!noAllergen) return false;
        const matchCount = recipe.ingredients.filter(recipeIng =>
          ingredients.some(userIng => recipeIng.toLowerCase().includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(recipeIng.toLowerCase()))
        ).length;
        return matchCount >= Math.min(2, ingredients.length); 
      });

      if (matchedRecipes.length > 0) {
        const sorted = matchedRecipes.sort((a, b) => {
          const aMatch = a.ingredients.filter(ing => ingredients.some(ui => ing.toLowerCase().includes(ui.toLowerCase()))).length;
          const bMatch = b.ingredients.filter(ing => ingredients.some(ui => ing.toLowerCase().includes(ui.toLowerCase()))).length;
          return bMatch - aMatch; 
        });

        setSuggestions(sorted.slice(0, 3).map(recipe => ({ 
          ...recipe,
          matchedIngredients: recipe.ingredients.filter(ing => ingredients.some(ui => ing.toLowerCase().includes(ui.toLowerCase()))),
          missingIngredients: recipe.ingredients.filter(ing => !ingredients.some(ui => ing.toLowerCase().includes(ui.toLowerCase()))),
          aiReason: `Evinizdeki malzemelerle hazırlayabileceğiniz en uygun tarif. ${recipe.ingredients.filter(ing => ingredients.some(ui => ing.toLowerCase().includes(ui.toLowerCase()))).length} malzeme eşleşti!`,
          portion: "AI tarafından belirlendi" 
        })));
      } else {
        setSuggestions([{
          name: "Pratik Omlet", 
          calories: 300,
          protein: 20,
          carbs: 15,
          fat: 18,
          ingredients: ingredients.slice(0, 3), 
          matchedIngredients: ingredients,
          missingIngredients: [],
          aiReason: "Elimizdeki malzemelerle hazırlayabileceğiniz hızlı ve sağlıklı bir öneri.",
          portion: "AI tarafından belirlendi"
        }]);
      }
      setIsGenerating(false);
    }, 1500); 
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <ChefHat className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Elimdeki Malzemeler</h3>
              <p className="text-gray-600 text-sm">Ne var ne yok, ben hallederim! 🍳</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Evinde ne var? Ekle bakalım:</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient(inputValue.trim())}
              placeholder="örn: tavuk, yumurta, domates..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button onClick={() => addIngredient(inputValue.trim())} className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors font-medium">
              <Plus size={20} />
            </button>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-2">Hızlı Ekle:</div>
            <div className="flex flex-wrap gap-2">
              {commonIngredients.map(ing => (
                <button key={ing} onClick={() => addIngredient(ing)} disabled={ingredients.includes(ing)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-100 hover:text-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {ing}
                </button>
              ))}
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
              <div className="text-sm font-medium text-orange-900 mb-2">Seçili Malzemeler ({ingredients.length})</div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ing => (
                  <span key={ing} className="bg-white text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-orange-300">
                    {ing}
                    <button onClick={() => removeIngredient(ing)} className="hover:text-orange-600">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {ingredients.length > 0 && suggestions.length === 0 && (
          <button onClick={generateFromIngredients} disabled={isGenerating} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
            {isGenerating ? (<><RefreshCw className="animate-spin" size={20} />AI Tarif Buluyor...</>) : (<><Sparkles size={20} />Bu Malzemelerle Ne Yapabilirim?</>)}
          </button>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">🎉 {suggestions.length} Tarif Bulundu!</h4>
              <button onClick={() => { setSuggestions([]); setIngredients([]); }} className="text-sm text-gray-600 hover:text-gray-800">Yeni Arama</button>
            </div>
            {suggestions.map((recipe, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="text-orange-600" size={20} />
                          <span className="font-bold text-xl text-gray-800">{recipe.name}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-600">Kalori</div>
                            <div className="font-bold text-blue-600">{recipe.calories}</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-600">Protein</div>
                            <div className="font-bold text-green-600">{recipe.protein}g</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-600">Karb</div>
                            <div className="font-bold text-orange-600">{recipe.carbs}g</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-600">Yağ</div>
                            <div className="font-bold text-red-600">{recipe.fat}g</div>
                          </div>
                        </div>
                        {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-green-700 mb-1">✅ Evinizde Var ({recipe.matchedIngredients.length})</div>
                            <div className="text-sm text-gray-700">{recipe.matchedIngredients.join(", ")}</div>
                          </div>
                        )}
                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-orange-700 mb-1">🛒 Almanız Gerekenler ({recipe.missingIngredients.length})</div>
                            <div className="text-sm text-gray-700">{recipe.missingIngredients.join(", ")}</div>
                          </div>
                        )}
                        <div className="bg-white rounded-lg p-3 mt-3">
                          <div className="text-xs text-orange-700 font-medium mb-1">🤖 AI Önerisi</div>
                          <div className="text-sm text-gray-800">{recipe.aiReason}</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onAccept(recipe)} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2">
                      <Check size={20} />Bu Tarifi Seç
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    export default QuickIngredientsModal;