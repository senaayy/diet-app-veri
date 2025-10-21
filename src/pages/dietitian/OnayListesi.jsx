// src/pages/dietitian/OnayListesi.jsx - Renk Paleti Uygulanmış Hali

import React from 'react';
import { useClients } from '../../context/ClientContext';
import { Check, X, Calendar, Clock, AlertCircle, ChefHat } from 'lucide-react';
import { DAY_NAMES } from '../../data/weeklyMenuTemplate';

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

function OnayListesi() {
  const { clients, handleApproval } = useClients();

  // Onay bekleyen danışanları bul
  const clientsWithPending = clients.filter(c => c.pendingApprovals && c.pendingApprovals.length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-tertiary to-error rounded-2xl p-6 text-background-white shadow-lg mb-6"> {/* Turuncu-Kırmızı gradyan */}
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle size={32} />
          <div>
            <h3 className="text-3xl font-bold">Onay Bekleyen Talepler</h3>
            <p className="text-tertiary/20 mt-1"> {/* Açık turuncu metin */}
              Danışanların AI önerilerini buradan yönetin.
            </p>
          </div>
        </div>
      </div>

      {clientsWithPending.length > 0 ? (
        <div className="space-y-8">
          {clientsWithPending.map(client => (
            <div key={client.id} className="bg-background-white rounded-2xl shadow-md border border-divider overflow-hidden">
              {/* Danışan Header */}
              <div className="bg-gradient-to-r from-background-light to-divider px-6 py-4 border-b border-divider"> {/* Hafif gri gradyan */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center text-background-white font-bold text-lg shadow-md"> {/* Avatar rengi */}
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-text-dark">{client.name}</h4>
                    <p className="text-sm text-text-medium">
                      {client.pendingApprovals.length} talep bekleniyor
                    </p>
                  </div>
                </div>
              </div>

              {/* Talepler */}
              <div className="p-6 space-y-6">
                {client.pendingApprovals.map((approval, index) => (
                  <div 
                    key={approval.id} 
                    className="bg-secondary/10 rounded-2xl p-6 border-2 border-secondary/50 shadow-sm hover:shadow-md transition-all" // Açık sarımsı arka plan
                  >
                    {/* Üst Bilgi */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-tertiary text-background-white px-3 py-1 rounded-full text-xs font-bold"> {/* Numara etiketi */}
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-dark">
                          <Calendar size={16} className="text-secondary" /> {/* İkon rengi */}
                          <span className="font-medium">{DAY_NAMES[approval.day] || approval.day}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-medium">
                          <Clock size={16} className="text-divider" /> {/* İkon rengi */}
                          <span>{new Date(approval.timestamp).toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'long', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      </div>
                      <div className="bg-tertiary/20 text-tertiary px-3 py-1 rounded-full text-xs font-bold"> {/* Öğün tipi etiketi */}
                        {approval.originalMeal?.mealType || 'Öğün'}
                      </div>
                    </div>

                    {/* Orijinal vs Alternatif */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Orijinal */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center"> {/* Kırmızı arka plan */}
                            <span className="text-error font-bold text-lg">❌</span>
                          </div>
                          <h5 className="font-bold text-text-dark">ORİJİNAL</h5>
                        </div>
                        <div className="bg-background-white rounded-xl p-4 border-2 border-error/50 shadow-sm"> {/* Kırmızı kenarlık */}
                          <div className="font-bold text-text-dark mb-3 text-lg">
                            {approval.originalMeal?.items || 'Öğün bilgisi yok'}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-divider">
                              <span className="text-text-medium">Kalori</span>
                              <span className="font-bold text-tertiary"> {/* Turuncu */}
                                {approval.originalMeal?.calories || 0} kcal
                              </span>
                            </div>
                            {approval.originalMeal?.portion && (
                              <div className="flex items-center gap-2 text-text-dark">
                                <ChefHat size={14} className="text-text-medium" />
                                <span>{approval.originalMeal.portion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Alternatif */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"> {/* Yeşil arka plan */}
                            <span className="text-primary font-bold text-lg">✨</span>
                          </div>
                          <h5 className="font-bold text-text-dark">AI ÖNERİSİ</h5>
                        </div>
                        <div className="bg-background-white rounded-xl p-4 border-2 border-primary/50 shadow-sm"> {/* Yeşil kenarlık */}
                          <div className="font-bold text-text-dark mb-3 text-lg">
                            {approval.suggestedAlternative?.name || 'Yeni Tarif'}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-background-light rounded-lg p-2 text-center border border-divider">
                              <div className="text-xs text-text-medium">Kalori</div>
                              <div className="font-bold text-tertiary"> {/* Turuncu */}
                                {approval.suggestedAlternative?.calories}
                              </div>
                            </div>
                            <div className="bg-background-light rounded-lg p-2 text-center border border-divider">
                              <div className="text-xs text-text-medium">Protein</div>
                              <div className="font-bold text-primary"> {/* Yeşil */}
                                {approval.suggestedAlternative?.protein}g
                              </div>
                            </div>
                            <div className="bg-background-light rounded-lg p-2 text-center border border-divider">
                              <div className="text-xs text-text-medium">Karb</div>
                              <div className="font-bold text-tertiary"> {/* Turuncu */}
                                {approval.suggestedAlternative?.carbs}g
                              </div>
                            </div>
                            <div className="bg-background-light rounded-lg p-2 text-center border border-divider">
                              <div className="text-xs text-text-medium">Yağ</div>
                              <div className="font-bold text-secondary"> {/* Sarı */}
                                {approval.suggestedAlternative?.fat}g
                              </div>
                            </div>
                          </div>
                          {approval.suggestedAlternative?.ingredients && (
                            <div className="text-xs text-text-dark bg-background-light rounded-lg p-2 border border-divider">
                              <span className="font-medium">Malzemeler: </span>
                              {approval.suggestedAlternative.ingredients.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Açıklama */}
                    {approval.suggestedAlternative?.aiReason && (
                      <div className="bg-background-light rounded-xl p-4 mb-6 border-2 border-secondary/50"> {/* Sarımsı arka plan */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-tertiary rounded-lg flex items-center justify-center flex-shrink-0"> {/* Turuncu ikon arka planı */}
                            <span className="text-background-white font-bold">🤖</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-tertiary mb-1">AI AÇIKLAMA</div>
                            <p className="text-sm text-text-dark leading-relaxed">
                              {approval.suggestedAlternative.aiReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Butonlar */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-divider">
                      <button
                        onClick={() => handleApproval(client.id, approval.id, 'approve')}
                        className="bg-primary hover:bg-primary/90 text-text-dark py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Check size={24} strokeWidth={3} />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleApproval(client.id, approval.id, 'reject')}
                        className="bg-error hover:bg-error/90 text-background-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <X size={24} strokeWidth={3} />
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-background-white rounded-2xl shadow-md border-2 border-divider p-12 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4"> {/* Yeşil arka plan */}
            <Check size={48} className="text-primary" strokeWidth={2.5} /> {/* Yeşil ikon */}
          </div>
          <h3 className="text-2xl font-bold text-text-dark mb-2">Harika İş! 🎉</h3>
          <p className="text-text-medium text-lg">
            Onay bekleyen herhangi bir talep bulunmuyor.
          </p>
          <p className="text-sm text-text-medium/80 mt-2">
            Danışanlarınız alternatif talep ettiğinde burada görünecektir.
          </p>
        </div>
      )}
    </div>
  );
}

export default OnayListesi;