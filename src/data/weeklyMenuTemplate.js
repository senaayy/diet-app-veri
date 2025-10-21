// src/data/weeklyMenuTemplate.js
import INITIAL_RECIPES from './recipes';

// DAYS ve DAY_NAMES'i NAMED EXPORT olarak dışa aktarıyoruz
export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']; 
export const DAY_NAMES = { 
  monday: 'Pazartesi', 
  tuesday: 'Salı', 
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar'
};

const WEEKLY_MENU_TEMPLATE = {
  monday: [
    { id: 'm1', mealType: "Kahvaltı", recipe: INITIAL_RECIPES[5], portion: "2 yumurta, 2 dilim ekmek", status: "pending", aiModified: false },
    { id: 'm2', mealType: "Ara Öğün", recipe: null, items: "1 elma, 10 badem", calories: 150, status: "pending", aiModified: false },
    { id: 'm3', mealType: "Öğle", recipe: INITIAL_RECIPES[0], portion: "150g tavuk, 100g kinoa", status: "pending", aiModified: false },
    { id: 'm4', mealType: "Ara Öğün", recipe: null, items: "1 kase yoğurt", calories: 120, status: "pending", aiModified: false },
    { id: 'm5', mealType: "Akşam", recipe: INITIAL_RECIPES[2], portion: "4 adet köfte, 150g yoğurt", status: "pending", aiModified: false }
  ],
  tuesday: [
    { id: 't1', mealType: "Kahvaltı", recipe: INITIAL_RECIPES[5], portion: "2 yumurta, 2 dilim ekmek", status: "pending", aiModified: false },
    { id: 't2', mealType: "Ara Öğün", recipe: null, items: "1 portakal, 5 ceviz", calories: 180, status: "pending", aiModified: false },
    { id: 't3', mealType: "Öğle", recipe: INITIAL_RECIPES[1], portion: "120g somon, 150g sebze", status: "pending", aiModified: false },
    { id: 't4', mealType: "Ara Öğün", recipe: null, items: "Protein bar", calories: 150, status: "pending", aiModified: false },
    { id: 't5', mealType: "Akşam", recipe: INITIAL_RECIPES[3], portion: "3 köfte, 100g pilav", status: "pending", aiModified: false }
  ],
  wednesday: [
    { id: 'w1', mealType: "Kahvaltı", recipe: INITIAL_RECIPES[6], portion: "Sebzeli Omlet", status: "pending", aiModified: false },
    { id: 'w2', mealType: "Öğle", recipe: INITIAL_RECIPES[4], portion: "Ton Balığı Salata", status: "pending", aiModified: false },
    { id: 'w3', mealType: "Akşam", recipe: INITIAL_RECIPES[0], portion: "150g tavuk, 100g brokoli", status: "pending", aiModified: false }
  ]
};

export default WEEKLY_MENU_TEMPLATE;