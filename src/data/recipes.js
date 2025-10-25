// src/data/recipes.js - Genişletilmiş Tarif Listesi
const INITIAL_RECIPES = [
  // Tavuk Tarifleri
  { id: 1, name: "Izgara Tavuk Göğsü & Kinoa", calories: 450, protein: 45, carbs: 35, fat: 12, ingredients: ["tavuk göğsü", "kinoa", "zeytinyağı", "brokoli"], cookTime: 25, cost: 35, allergens: [] },
  { id: 8, name: "Tavuklu Salata", calories: 380, protein: 38, carbs: 20, fat: 15, ingredients: ["tavuk göğsü", "marul", "domates", "salatalık", "zeytinyağı"], cookTime: 20, cost: 30, allergens: [] },
  { id: 9, name: "Fırın Tavuk & Patates", calories: 480, protein: 42, carbs: 45, fat: 14, ingredients: ["tavuk but", "patates", "soğan", "zeytinyağı", "baharatlar"], cookTime: 40, cost: 28, allergens: [] },
  { id: 10, name: "Tavuk Sote", calories: 420, protein: 40, carbs: 30, fat: 12, ingredients: ["tavuk göğsü", "biber", "soğan", "domates", "zeytinyağı"], cookTime: 25, cost: 32, allergens: [] },
  
  // Balık Tarifleri
  { id: 2, name: "Somon & Fırın Sebze", calories: 520, protein: 42, carbs: 28, fat: 24, ingredients: ["somon", "patates", "havuç", "zeytinyağı"], cookTime: 30, cost: 65, allergens: ["balık"] },
  { id: 5, name: "Ton Balığı Salata", calories: 350, protein: 35, carbs: 25, fat: 15, ingredients: ["ton balığı", "marul", "domates", "zeytinyağı"], cookTime: 10, cost: 40, allergens: ["balık"] },
  { id: 11, name: "Izgara Levrek", calories: 380, protein: 45, carbs: 15, fat: 18, ingredients: ["levrek", "limon", "zeytinyağı", "yeşil salata"], cookTime: 25, cost: 55, allergens: ["balık"] },
  { id: 12, name: "Fırın Çipura", calories: 400, protein: 40, carbs: 20, fat: 20, ingredients: ["çipura", "domates", "limon", "zeytinyağı"], cookTime: 30, cost: 50, allergens: ["balık"] },
  
  // Et Tarifleri
  { id: 4, name: "Hindi Köfte & Bulgur Pilavı", calories: 410, protein: 38, carbs: 42, fat: 10, ingredients: ["hindi kıyma", "bulgur", "domates", "biber"], cookTime: 35, cost: 32, allergens: ["gluten"] },
  { id: 13, name: "Dana Haşlama", calories: 450, protein: 50, carbs: 25, fat: 18, ingredients: ["dana eti", "havuç", "patates", "soğan"], cookTime: 60, cost: 70, allergens: [] },
  { id: 14, name: "Izgara Köfte", calories: 480, protein: 42, carbs: 30, fat: 22, ingredients: ["dana kıyma", "soğan", "baharatlar", "bulgur"], cookTime: 25, cost: 45, allergens: ["gluten"] },
  { id: 15, name: "Etli Nohut", calories: 520, protein: 35, carbs: 55, fat: 16, ingredients: ["dana eti", "nohut", "soğan", "domates"], cookTime: 90, cost: 55, allergens: [] },
  
  // Vejeteryan/Vegan
  { id: 3, name: "Mercimek Köfte & Yoğurt", calories: 380, protein: 18, carbs: 52, fat: 8, ingredients: ["kırmızı mercimek", "bulgur", "yoğurt", "salatalık"], cookTime: 20, cost: 15, allergens: ["gluten", "süt"] },
  { id: 16, name: "Nohutlu Salata", calories: 350, protein: 15, carbs: 48, fat: 12, ingredients: ["nohut", "marul", "domates", "salatalık", "zeytinyağı"], cookTime: 15, cost: 18, allergens: [] },
  { id: 17, name: "Zeytinyağlı Fasulye", calories: 280, protein: 12, carbs: 40, fat: 10, ingredients: ["taze fasulye", "domates", "soğan", "zeytinyağı"], cookTime: 35, cost: 20, allergens: [] },
  { id: 18, name: "Mercimek Çorbası", calories: 220, protein: 14, carbs: 35, fat: 4, ingredients: ["kırmızı mercimek", "havuç", "patates", "soğan"], cookTime: 30, cost: 12, allergens: [] },
  { id: 19, name: "Fırın Sebze", calories: 250, protein: 8, carbs: 35, fat: 10, ingredients: ["kabak", "patlıcan", "biber", "domates", "zeytinyağı"], cookTime: 40, cost: 22, allergens: [] },
  
  // Yumurta Tarifleri
  { id: 6, name: "Yumurta & Kepekli Ekmek", calories: 320, protein: 22, carbs: 35, fat: 10, ingredients: ["yumurta", "kepekli ekmek", "domates", "salatalık"], cookTime: 15, cost: 18, allergens: ["gluten"] },
  { id: 7, name: "Sebzeli Omlet", calories: 280, protein: 18, carbs: 10, fat: 16, ingredients: ["yumurta", "biber", "mantar", "soğan", "zeytinyağı"], cookTime: 15, cost: 20, allergens: [] },
  { id: 20, name: "Menemen", calories: 320, protein: 16, carbs: 20, fat: 20, ingredients: ["yumurta", "domates", "biber", "soğan", "zeytinyağı"], cookTime: 15, cost: 18, allergens: [] },
  { id: 21, name: "Çılbır (Yoğurtlu Yumurta)", calories: 360, protein: 20, carbs: 25, fat: 22, ingredients: ["yumurta", "yoğurt", "tereyağı", "pul biber"], cookTime: 15, cost: 20, allergens: ["süt"] },
  
  // Makarna & Pirinç
  { id: 22, name: "Yoğurtlu Makarna", calories: 420, protein: 18, carbs: 60, fat: 12, ingredients: ["makarna", "yoğurt", "tereyağı", "sarımsak"], cookTime: 20, cost: 15, allergens: ["gluten", "süt"] },
  { id: 23, name: "Sebzeli Makarna", calories: 450, protein: 15, carbs: 65, fat: 14, ingredients: ["makarna", "kabak", "biber", "domates", "zeytinyağı"], cookTime: 25, cost: 18, allergens: ["gluten"] },
  { id: 24, name: "Pirinç Pilavı", calories: 320, protein: 8, carbs: 65, fat: 5, ingredients: ["pirinç", "tereyağı", "şehriye", "su"], cookTime: 25, cost: 12, allergens: ["gluten"] },
  { id: 25, name: "Sebzeli Pilav", calories: 380, protein: 10, carbs: 68, fat: 8, ingredients: ["pirinç", "bezelye", "havuç", "tereyağı"], cookTime: 30, cost: 16, allergens: [] },
  { id: 26, name: "Bulgur Pilavı", calories: 340, protein: 12, carbs: 62, fat: 6, ingredients: ["bulgur", "domates", "biber", "soğan", "zeytinyağı"], cookTime: 20, cost: 10, allergens: ["gluten"] },
  
  // Kahvaltılık
  { id: 27, name: "Peynirli Omlet & Salata", calories: 380, protein: 24, carbs: 15, fat: 26, ingredients: ["yumurta", "beyaz peynir", "marul", "domates", "zeytinyağı"], cookTime: 15, cost: 22, allergens: ["süt"] },
  { id: 28, name: "Yulaf Ezmesi (Oatmeal)", calories: 320, protein: 12, carbs: 55, fat: 8, ingredients: ["yulaf", "süt", "muz", "bal"], cookTime: 10, cost: 15, allergens: ["gluten", "süt"] },
  { id: 29, name: "Avokado Toast", calories: 420, protein: 12, carbs: 40, fat: 24, ingredients: ["kepekli ekmek", "avokado", "yumurta", "limon"], cookTime: 10, cost: 35, allergens: ["gluten"] },
  { id: 30, name: "Peynir & Zeytin Tabağı", calories: 350, protein: 18, carbs: 30, fat: 20, ingredients: ["beyaz peynir", "zeytin", "domates", "salatalık", "tam buğday ekmeği"], cookTime: 5, cost: 20, allergens: ["süt", "gluten"] },
  
  // Çorba
  { id: 31, name: "Tavuk Suyu Çorbası", calories: 180, protein: 15, carbs: 20, fat: 4, ingredients: ["tavuk göğsü", "havuç", "patates", "şehriye"], cookTime: 30, cost: 20, allergens: ["gluten"] },
  { id: 32, name: "Domates Çorbası", calories: 150, protein: 6, carbs: 25, fat: 4, ingredients: ["domates", "un", "tereyağı", "süt"], cookTime: 25, cost: 15, allergens: ["gluten", "süt"] },
  { id: 33, name: "Ezogelin Çorbası", calories: 200, protein: 10, carbs: 35, fat: 3, ingredients: ["kırmızı mercimek", "bulgur", "pirinç", "domates"], cookTime: 30, cost: 12, allergens: ["gluten"] },
  { id: 34, name: "Yayla Çorbası", calories: 220, protein: 12, carbs: 30, fat: 6, ingredients: ["yoğurt", "pirinç", "nane", "un"], cookTime: 25, cost: 14, allergens: ["gluten", "süt"] },
  
  // Ara Öğün/Snack
  { id: 35, name: "Yoğurt & Meyve", calories: 180, protein: 10, carbs: 30, fat: 3, ingredients: ["yoğurt", "muz", "çilek", "bal"], cookTime: 5, cost: 18, allergens: ["süt"] },
  { id: 36, name: "Fıstık Ezmesi & Elma", calories: 250, protein: 8, carbs: 28, fat: 14, ingredients: ["fıstık ezmesi", "elma"], cookTime: 2, cost: 15, allergens: ["fındık"] },
  { id: 37, name: "Humus & Havuç", calories: 200, protein: 8, carbs: 25, fat: 10, ingredients: ["nohut", "tahin", "limon", "havuç"], cookTime: 10, cost: 16, allergens: [] },
  { id: 38, name: "Protein Bar & Badem", calories: 280, protein: 15, carbs: 30, fat: 12, ingredients: ["protein tozu", "yulaf", "badem", "hurma"], cookTime: 15, cost: 25, allergens: ["fındık", "gluten"] },
  
  // Salata
  { id: 39, name: "Yunan Salatası", calories: 220, protein: 8, carbs: 15, fat: 16, ingredients: ["marul", "domates", "salatalık", "beyaz peynir", "zeytin", "zeytinyağı"], cookTime: 10, cost: 22, allergens: ["süt"] },
  { id: 40, name: "Kinoa Salatası", calories: 320, protein: 12, carbs: 40, fat: 14, ingredients: ["kinoa", "nohut", "domates", "salatalık", "zeytinyağı"], cookTime: 20, cost: 25, allergens: [] },
  { id: 41, name: "Mevsim Salatası", calories: 150, protein: 4, carbs: 20, fat: 8, ingredients: ["marul", "domates", "salatalık", "havuç", "zeytinyağı", "limon"], cookTime: 10, cost: 15, allergens: [] },
  { id: 42, name: "Izgara Sebze Salatası", calories: 280, protein: 8, carbs: 30, fat: 16, ingredients: ["patlıcan", "kabak", "biber", "marul", "zeytinyağı"], cookTime: 25, cost: 20, allergens: [] },
];

export default INITIAL_RECIPES;