// src/components/BMIFilter.jsx - Renk Paleti Uygulanmış Hali (DÜZELTİLMİŞ)

import React, { useState } from 'react';
import { Filter, Users, TrendingUp, AlertTriangle, Heart } from 'lucide-react';

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


const BMIFilter = ({ onFilterChange, selectedCategory, clientCounts }) => {
  const categories = [
    { 
      id: 'Tümü', 
      label: 'Tüm Danışanlar', 
      icon: Users, 
      color: 'gray', // Bu string değerler aşağıda getColorClasses'ta kullanılacak
      count: clientCounts?.total || 0
    },
    { 
      id: 'Zayıf', 
      label: 'Zayıf (< 18.5)', 
      icon: TrendingUp, 
      color: 'secondary', // Sarı
      count: clientCounts?.zayif || 0
    },
    { 
      id: 'Normal', 
      label: 'Normal (18.5-24.9)', 
      icon: Heart, 
      color: 'primary', // Yeşil
      count: clientCounts?.normal || 0
    },
    { 
      id: 'Fazla kilolu', 
      label: 'Fazla Kilolu (25-29.9)', 
      icon: AlertTriangle, 
      color: 'tertiary', // Turuncu
      count: clientCounts?.fazlaKilolu || 0
    },
    { 
      id: 'Obez', 
      label: 'Obez (30-34.9)', 
      icon: AlertTriangle, 
      color: 'error', // Kırmızı
      count: clientCounts?.obez || 0
    },
    { 
      id: 'Morbid obez', 
      label: 'Morbid Obez (35+)', 
      icon: AlertTriangle, 
      color: 'error', // Kırmızı
      count: clientCounts?.morbidObez || 0
    }
  ];

  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'primary': return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
      case 'secondary': return 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20';
      case 'tertiary': return 'bg-tertiary/10 text-tertiary border-tertiary/20 hover:bg-tertiary/20';
      case 'error': return 'bg-error/10 text-error border-error/20 hover:bg-error/20';
      case 'gray': return 'bg-background-light text-text-dark border-divider hover:bg-divider'; // Nötr kategori
      default: return 'bg-background-light text-text-dark border-divider hover:bg-divider';
    }
  };

  const getSelectedColorClasses = (colorName) => {
    switch (colorName) {
      case 'primary': return 'bg-primary text-text-dark border-primary/80 shadow-md';
      case 'secondary': return 'bg-secondary text-text-dark border-secondary/80 shadow-md';
      case 'tertiary': return 'bg-tertiary text-text-dark border-tertiary/80 shadow-md';
      case 'error': return 'bg-error text-background-white border-error/80 shadow-md'; // Kırmızı için beyaz metin
      case 'gray': return 'bg-text-medium text-background-white border-text-dark shadow-md'; // Seçili nötr için koyu
      default: return 'bg-text-medium text-background-white border-text-dark shadow-md';
    }
  };

  return (
    <div className="bg-background-white rounded-xl shadow-sm border border-divider p-4">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-text-medium mr-2" />
        <h3 className="text-lg font-semibold text-text-dark">BMI Kategorisi Filtresi</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              className={`
                flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? getSelectedColorClasses(category.color)
                  : getColorClasses(category.color)
                }
                hover:shadow-md
              `}
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" /> {/* İkonun rengi text sınıfından gelecek */}
                <div className="text-left">
                  <p className="font-medium text-sm">{category.label}</p>
                  <p className="text-xs opacity-75">
                    {category.count} danışan
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="w-2 h-2 bg-current rounded-full"></div> // Kapanış parantezi buraya eklendi!
              )}
            </button>
          );
        })}
      </div>
      
      {/* BMI Açıklaması */}
      <div className="mt-4 p-3 bg-background-light rounded-lg border border-divider">
        <h4 className="text-sm font-semibold text-text-dark mb-2">BMI Kategorileri</h4>
        <div className="text-xs text-text-medium space-y-1">
          <p><span className="font-medium">Zayıf:</span> 18.5'in altı</p>
          <p><span className="font-medium">Normal:</span> 18.5 - 24.9 arası</p>
          <p><span className="font-medium">Fazla Kilolu:</span> 25 - 29.9 arası</p>
          <p><span className="font-medium">Obez:</span> 30 - 34.9 arası</p>
          <p><span className="font-medium">Morbid Obez:</span> 35 ve üzeri</p>
        </div>
      </div>
    </div>
  );
};

export default BMIFilter;