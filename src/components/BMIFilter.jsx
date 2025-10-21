import React, { useState } from 'react';
import { Filter, Users, TrendingUp, AlertTriangle, Heart } from 'lucide-react';

const BMIFilter = ({ onFilterChange, selectedCategory, clientCounts }) => {
  const categories = [
    { 
      id: 'Tümü', 
      label: 'Tüm Danışanlar', 
      icon: Users, 
      color: 'gray',
      count: clientCounts?.total || 0
    },
    { 
      id: 'Zayıf', 
      label: 'Zayıf (< 18.5)', 
      icon: TrendingUp, 
      color: 'blue',
      count: clientCounts?.zayif || 0
    },
    { 
      id: 'Normal', 
      label: 'Normal (18.5-24.9)', 
      icon: Heart, 
      color: 'green',
      count: clientCounts?.normal || 0
    },
    { 
      id: 'Fazla kilolu', 
      label: 'Fazla Kilolu (25-29.9)', 
      icon: AlertTriangle, 
      color: 'yellow',
      count: clientCounts?.fazlaKilolu || 0
    },
    { 
      id: 'Obez', 
      label: 'Obez (30-34.9)', 
      icon: AlertTriangle, 
      color: 'orange',
      count: clientCounts?.obez || 0
    },
    { 
      id: 'Morbid obez', 
      label: 'Morbid Obez (35+)', 
      icon: AlertTriangle, 
      color: 'red',
      count: clientCounts?.morbidObez || 0
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      gray: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
      red: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
    };
    return colorMap[color] || colorMap.gray;
  };

  const getSelectedColorClasses = (color) => {
    const colorMap = {
      gray: 'bg-gray-200 text-gray-800 border-gray-300',
      blue: 'bg-blue-200 text-blue-800 border-blue-300',
      green: 'bg-green-200 text-green-800 border-green-300',
      yellow: 'bg-yellow-200 text-yellow-800 border-yellow-300',
      orange: 'bg-orange-200 text-orange-800 border-orange-300',
      red: 'bg-red-200 text-red-800 border-red-300'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">BMI Kategorisi Filtresi</h3>
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
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-sm">{category.label}</p>
                  <p className="text-xs opacity-75">
                    {category.count} danışan
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="w-2 h-2 bg-current rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* BMI Açıklaması */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">BMI Kategorileri</h4>
        <div className="text-xs text-gray-600 space-y-1">
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
