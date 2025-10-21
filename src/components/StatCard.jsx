// src/components/StatCard.jsx - Renk Paleti Uygulanmış Hali

import React from 'react';
import { TrendingUp } from 'lucide-react';

function StatCard({ icon: Icon, title, value, subtitle, trend, color, onClick }) {
  
  const isClickable = !!onClick;

  return (
    <div 
      onClick={onClick} 
      className={`bg-background-white rounded-xl p-5 shadow-sm border border-divider transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:shadow-lg hover:border-primary hover:-translate-y-1' // Hover rengi primary
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${color}`}> {/* color prop'u (bg-primary, bg-secondary vb.) buradan gelecek */}
              <Icon size={20} className="text-background-white" /> {/* İkon rengi her zaman beyaz */}
            </div>
            <span className="text-sm text-text-medium">{title}</span> {/* Başlık metni orta gri */}
          </div>
          <div className="text-2xl font-bold text-text-dark mb-1">{value}</div> {/* Değer metni koyu gri */}
          <div className="text-xs text-text-medium">{subtitle}</div> {/* Alt başlık metni orta gri */}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error' // Trend: Primary/Error renklerinin açık tonları
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