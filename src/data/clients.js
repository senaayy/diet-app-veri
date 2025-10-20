// src/data/clients.js
import WEEKLY_MENU_TEMPLATE from './weeklyMenuTemplate';

const CLIENTS = [
  { 
    id: 1, 
    name: "Ayşe Yılmaz", 
    targetCalories: 1800, 
    protein: 90, 
    carbs: 180, 
    fat: 60, 
    allergens: ["süt"],
    currentWeight: 72,
    targetWeight: 65,
    startWeight: 78,
    weeklyProgress: [78, 77, 75.5, 74, 73, 72.5, 72],
    adherence: 85,
    mealsLogged: 42,
    totalMeals: 49,
    weeklyMenu: JSON.parse(JSON.stringify(WEEKLY_MENU_TEMPLATE)),
    aiUsageCount: 12,
    pendingApprovals: [],
    notifications: [],
    favoriteAlternatives: []
  },
  { 
    id: 2, 
    name: "Mehmet Kaya", 
    targetCalories: 2200, 
    protein: 110, 
    carbs: 220, 
    fat: 73, 
    allergens: [],
    currentWeight: 88,
    targetWeight: 82,
    startWeight: 95,
    weeklyProgress: [95, 93, 92, 90, 89, 88.5, 88],
    adherence: 92,
    mealsLogged: 46,
    totalMeals: 49,
    weeklyMenu: JSON.parse(JSON.stringify(WEEKLY_MENU_TEMPLATE)),
    aiUsageCount: 8,
    pendingApprovals: [],
    notifications: [],
    favoriteAlternatives: []
  },
  { 
    id: 3, 
    name: "Zeynep Demir", 
    targetCalories: 1600, 
    protein: 80, 
    carbs: 160, 
    fat: 53, 
    allergens: ["gluten", "balık"],
    currentWeight: 68,
    targetWeight: 60,
    startWeight: 70,
    weeklyProgress: [70, 69.5, 69, 68.5, 68.2, 68.1, 68],
    adherence: 78,
    mealsLogged: 38,
    totalMeals: 49,
    weeklyMenu: JSON.parse(JSON.stringify(WEEKLY_MENU_TEMPLATE)),
    aiUsageCount: 15,
    pendingApprovals: [],
    notifications: [],
    favoriteAlternatives: []
  }
];

export default CLIENTS;