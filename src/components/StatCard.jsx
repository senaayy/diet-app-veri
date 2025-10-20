// src/components/StatCard.jsx

import React from 'react';
import { TrendingUp } from 'lucide-react';

function StatCard({ icon: Icon, title, value, subtitle, trend, color, onClick }) {
  
  const isClickable = !!onClick;

  return (
    <div 
      onClick={onClick} 
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:shadow-lg hover:border-blue-300 hover:-translate-y-1' 
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon size={20} className="text-white" />
            </div>
            <span className="text-sm text-gray-600">{title}</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;