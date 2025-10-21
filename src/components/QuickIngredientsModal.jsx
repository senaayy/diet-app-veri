// src/components/QuickIngredientsModal.jsx - Renk Paleti Uygulanmış Hali

import React, { useState } from 'react';
import { ChefHat, Plus, X, Sparkles, RefreshCw, Award, AlertCircle, Check } from 'lucide-react';
import INITIAL_RECIPES from '../data/recipes';

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
      <div className="bg-background-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-tertiary to-error rounded-xl"> {/* Malzemeler için turuncu-kırmızı gradyan */}
              <ChefHat className="text-background-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-dark">Elimdeki Malzemeler</h3>
              <p className="text-text-medium text-sm">Ne var ne yok, ben hallederim! 🍳</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-medium hover:text-text-dark">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text-dark mb-3">Evinde ne var? Ekle bakalım:</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient(inputValue.trim())}
              placeholder="örn: tavuk, yumurta, domates..."
              className="flex-1 px-4 py-3 border-2 border-divider rounded-xl focus:ring-2 focus:ring-tertiary focus:border-tertiary text-text-dark"
            />
            <button onClick={() => addIngredient(inputValue.trim())} className="bg-tertiary text-text-dark px-6 py-3 rounded-xl hover:bg-tertiary/90 transition-colors font-medium">
              <Plus size={20} />
            </button>
          </div>

          <div className="mb-4">
            <div className="text-xs text-text-medium mb-2">Hızlı Ekle:</div>
            <div className="flex flex-wrap gap-2">
              {commonIngredients.map(ing => (
                <button key={ing} onClick={() => addIngredient(ing)} disabled={ingredients.includes(ing)} className="px-3 py-1 bg-background-light text-text-dark rounded-full text-sm hover:bg-tertiary/10 hover:text-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-divider">
                  {ing}
                </button>
              ))}
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="bg-tertiary/10 rounded-xl p-4 border-2 border-tertiary/50"> {/* Seçili malzemeler kutusu */}
              <div className="text-sm font-medium text-tertiary mb-2">Seçili Malzemeler ({ingredients.length})</div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ing => (
                  <span key={ing} className="bg-background-white text-text-dark px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-divider">
                    {ing}
                    <button onClick={() => removeIngredient(ing)} className="hover:text-error/80 text-text-medium">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {ingredients.length > 0 && suggestions.length === 0 && (
          <button onClick={generateFromIngredients} disabled={isGenerating} className="w-full bg-gradient-to-r from-tertiary to-error text-background-white py-4 rounded-xl font-semibold hover:from-tertiary/90 hover:to-error/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
            {isGenerating ? (<><RefreshCw className="animate-spin" size={20} />AI Tarif Buluyor...</>) : (<><Sparkles size={20} />Bu Malzemelerle Ne Yapabilirim?</>)}
          </button>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-text-dark">🎉 {suggestions.length} Tarif Bulundu!</h4>
              <button onClick={() => { setSuggestions([]); setIngredients([]); }} className="text-sm text-text-medium hover:text-text-dark">Yeni Arama</button>
            </div>
            {suggestions.map((recipe, index) => (
              <div key={index} className="bg-gradient-to-br from-tertiary/5 to-error/5 rounded-xl p-5 border-2 border-tertiary/20"> {/* Öneri kartı arka planı */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="text-tertiary" size={20} /> {/* İkon rengi */}
                          <span className="font-bold text-xl text-text-dark">{recipe.name}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                            <div className="text-xs text-text-medium">Kalori</div>
                            <div className="font-bold text-tertiary">{recipe.calories}</div>
                          </div>
                          <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                            <div className="text-xs text-text-medium">Protein</div>
                            <div className="font-bold text-primary">{recipe.protein}g</div>
                          </div>
                          <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                            <div className="text-xs text-text-medium">Karb</div>
                            <div className="font-bold text-tertiary">{recipe.carbs}g</div>
                          </div>
                          <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                            <div className="text-xs text-text-medium">Yağ</div>
                            <div className="font-bold text-secondary">{recipe.fat}g</div>
                          </div>
                        </div>
                        {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-primary mb-1">✅ Evinizde Var ({recipe.matchedIngredients.length})</div>
                            <div className="text-sm text-text-dark">{recipe.matchedIngredients.join(", ")}</div>
                          </div>
                        )}
                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-tertiary mb-1">🛒 Almanız Gerekenler ({recipe.missingIngredients.length})</div>
                            <div className="text-sm text-text-dark">{recipe.missingIngredients.join(", ")}</div>
                          </div>
                        )}
                        <div className="bg-background-light rounded-lg p-3 mt-3 border border-divider"> {/* AI açıklama kutusu */}
                          <div className="text-xs text-tertiary font-medium mb-1">🤖 AI Önerisi</div>
                          <div className="text-sm text-text-dark">{recipe.aiReason}</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onAccept(recipe)} className="w-full bg-primary text-text-dark py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
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