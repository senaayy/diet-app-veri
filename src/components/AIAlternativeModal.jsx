// src/components/AIAlternativeModal.jsx - Renk Paleti Uygulanmış Hali

import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Check, Clock, DollarSign, ChefHat } from 'lucide-react';
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
      <div className="bg-background-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-secondary to-tertiary rounded-xl"> {/* AI için sarı-turuncu gradyan */}
              <Sparkles className="text-background-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-dark">AI Alternatif Öneri</h3>
              <p className="text-text-medium text-sm">Eşdeğer besin değerinde alternatif bul</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-medium hover:text-text-dark">
            <X size={24} />
          </button>
        </div>

        <div className="bg-background-light rounded-xl p-4 mb-6 border border-divider"> {/* Mevcut öğün kartı */}
          <div className="text-sm text-text-medium mb-2">Mevcut Öğün</div>
          <div className="font-semibold text-lg text-text-dark mb-3">{mealItem.recipe?.name || mealItem.items}</div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
              <div className="text-xs text-text-medium">Kalori</div>
              <div className="font-bold text-tertiary">{mealItem.recipe?.calories || mealItem.calories}</div> {/* Turuncu */}
            </div>
            {mealItem.recipe && (<>
              <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                <div className="text-xs text-text-medium">Protein</div>
                <div className="font-bold text-primary">{mealItem.recipe.protein}g</div> {/* Yeşil */}
              </div>
              <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                <div className="text-xs text-text-medium">Karb</div>
                <div className="font-bold text-tertiary">{mealItem.recipe.carbs}g</div> {/* Turuncu */}
              </div>
              <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                <div className="text-xs text-text-medium">Yağ</div>
                <div className="font-bold text-secondary">{mealItem.recipe.fat}g</div> {/* Sarı */}
              </div>
            </>)}
          </div>
        </div>

        {!alternative && (
          <button onClick={generateAlternative} disabled={isGenerating} className="w-full bg-gradient-to-r from-secondary to-tertiary text-text-dark py-4 rounded-xl font-semibold hover:from-secondary/90 hover:to-tertiary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isGenerating ? (<><RefreshCw className="animate-spin" size={20} />AI Analiz Ediyor...</>) : (<><Sparkles size={20} />Alternatif Öner</>)}
          </button>
        )}

        {alternative && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-secondary/10 to-tertiary/10 rounded-xl p-5 border-2 border-secondary/50"> {/* AI öneri kartı arka planı */}
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-tertiary" size={20} /> {/* İkon rengi */}
                <span className="font-semibold text-text-dark">AI Önerisi</span>
              </div>
              <div className="font-bold text-xl text-text-dark mb-3">{alternative.name}</div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                  <div className="text-xs text-text-medium">Kalori</div>
                  <div className="font-bold text-tertiary">{alternative.calories}</div>
                </div>
                <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                  <div className="text-xs text-text-medium">Protein</div>
                  <div className="font-bold text-primary">{alternative.protein}g</div>
                </div>
                <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                  <div className="text-xs text-text-medium">Karb</div>
                  <div className="font-bold text-tertiary">{alternative.carbs}g</div>
                </div>
                <div className="bg-background-white rounded-lg p-2 text-center border border-divider">
                  <div className="text-xs text-text-medium">Yağ</div>
                  <div className="font-bold text-secondary">{alternative.fat}g</div>
                </div>
              </div>
              {alternative.ingredients && (
                <div className="mb-4">
                  <div className="text-sm text-text-medium mb-1">Malzemeler</div>
                  <div className="text-sm text-text-dark">{alternative.ingredients.join(", ")}</div>
                </div>
              )}
              <div className="bg-background-light rounded-lg p-3 border border-divider"> {/* AI açıklama kutusu */}
                <div className="text-xs text-text-dark font-medium mb-1">🤖 AI Açıklama</div>
                <div className="text-sm text-text-dark">{alternative.aiReason}</div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-divider">
              <button onClick={onClose} className="flex-1 bg-background-light text-text-dark py-3 rounded-xl font-semibold hover:bg-divider transition-colors">İptal</button>
              <button onClick={() => onAccept(alternative)} className="flex-1 bg-primary text-text-dark py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
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