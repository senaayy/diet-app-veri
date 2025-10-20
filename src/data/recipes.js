// src/data/recipes.js
const INITIAL_RECIPES = [
  { id: 1, name: "Izgara Tavuk Göğsü & Kinoa", calories: 450, protein: 45, carbs: 35, fat: 12, ingredients: ["tavuk göğsü", "kinoa", "zeytinyağı", "brokoli"], cookTime: 25, cost: 35, allergens: [] },
  { id: 2, name: "Somon & Fırın Sebze", calories: 520, protein: 42, carbs: 28, fat: 24, ingredients: ["somon", "patates", "havuç", "zeytinyağı"], cookTime: 30, cost: 65, allergens: ["balık"] },
  { id: 3, name: "Mercimek Köfte & Yoğurt", calories: 380, protein: 18, carbs: 52, fat: 8, ingredients: ["kırmızı mercimek", "bulgur", "yoğurt", "salatalık"], cookTime: 20, cost: 15, allergens: ["gluten", "süt"] },
  { id: 4, name: "Hindi Köfte & Bulgur Pilavı", calories: 410, protein: 38, carbs: 42, fat: 10, ingredients: ["hindi kıyma", "bulgur", "domates", "biber"], cookTime: 35, cost: 32, allergens: ["gluten"] },
  { id: 5, name: "Ton Balığı Salata", calories: 350, protein: 35, carbs: 25, fat: 15, ingredients: ["ton balığı", "marul", "domates", "zeytinyağı"], cookTime: 10, cost: 40, allergens: ["balık"] },
  { id: 6, name: "Yumurta & Kepekli Ekmek", calories: 320, protein: 22, carbs: 35, fat: 10, ingredients: ["yumurta", "kepekli ekmek", "domates", "salatalık"], cookTime: 15, cost: 18, allergens: ["gluten"] },
  { id: 7, name: "Sebzeli Omlet", calories: 280, protein: 18, carbs: 10, fat: 16, ingredients: ["yumurta", "biber", "mantar", "soğan", "zeytinyağı"], cookTime: 15, cost: 20, allergens: [] }
];

export default INITIAL_RECIPES;