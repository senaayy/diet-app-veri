// src/pages/dietitian/OnayListesi.jsx - ÇOK GÜZEL GÖRÜNÜM

import React from 'react';
import { useClients } from '../../context/ClientContext';
import { Check, X, Calendar, Clock, AlertCircle, ChefHat } from 'lucide-react';
import { DAY_NAMES } from '../../data/weeklyMenuTemplate';

function OnayListesi() {
  const { clients, handleApproval } = useClients();

  // Onay bekleyen danışanları bul
  const clientsWithPending = clients.filter(c => c.pendingApprovals && c.pendingApprovals.length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle size={32} />
          <div>
            <h3 className="text-3xl font-bold">Onay Bekleyen Talepler</h3>
            <p className="text-orange-100 mt-1">
              Danışanların AI önerilerini buradan yönetin.
            </p>
          </div>
        </div>
      </div>

      {clientsWithPending.length > 0 ? (
        <div className="space-y-8">
          {clientsWithPending.map(client => (
            <div key={client.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              {/* Danışan Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-800">{client.name}</h4>
                    <p className="text-sm text-gray-600">
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
                    className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Üst Bilgi */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar size={16} className="text-blue-500" />
                          <span className="font-medium">{DAY_NAMES[approval.day] || approval.day}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-gray-400" />
                          <span>{new Date(approval.timestamp).toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'long', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      </div>
                      <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                        {approval.originalMeal?.mealType || 'Öğün'}
                      </div>
                    </div>

                    {/* Orijinal vs Alternatif */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Orijinal */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 font-bold text-lg">❌</span>
                          </div>
                          <h5 className="font-bold text-gray-800">ORİJİNAL</h5>
                        </div>
                        <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-sm">
                          <div className="font-bold text-gray-900 mb-3 text-lg">
                            {approval.originalMeal?.items || 'Öğün bilgisi yok'}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Kalori</span>
                              <span className="font-bold text-blue-600">
                                {approval.originalMeal?.calories || 0} kcal
                              </span>
                            </div>
                            {approval.originalMeal?.portion && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <ChefHat size={14} />
                                <span>{approval.originalMeal.portion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Alternatif */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold text-lg">✨</span>
                          </div>
                          <h5 className="font-bold text-gray-800">AI ÖNERİSİ</h5>
                        </div>
                        <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
                          <div className="font-bold text-gray-900 mb-3 text-lg">
                            {approval.suggestedAlternative?.name || 'Yeni Tarif'}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                              <div className="text-xs text-gray-600">Kalori</div>
                              <div className="font-bold text-blue-600">
                                {approval.suggestedAlternative?.calories}
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                              <div className="text-xs text-gray-600">Protein</div>
                              <div className="font-bold text-green-600">
                                {approval.suggestedAlternative?.protein}g
                              </div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-2 text-center border border-orange-200">
                              <div className="text-xs text-gray-600">Karb</div>
                              <div className="font-bold text-orange-600">
                                {approval.suggestedAlternative?.carbs}g
                              </div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-2 text-center border border-red-200">
                              <div className="text-xs text-gray-600">Yağ</div>
                              <div className="font-bold text-red-600">
                                {approval.suggestedAlternative?.fat}g
                              </div>
                            </div>
                          </div>
                          {approval.suggestedAlternative?.ingredients && (
                            <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-2">
                              <span className="font-medium">Malzemeler: </span>
                              {approval.suggestedAlternative.ingredients.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Açıklama */}
                    {approval.suggestedAlternative?.aiReason && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">🤖</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-purple-700 mb-1">AI AÇIKLAMA</div>
                            <p className="text-sm text-purple-900 leading-relaxed">
                              {approval.suggestedAlternative.aiReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Butonlar */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleApproval(client.id, approval.id, 'approve')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Check size={24} strokeWidth={3} />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleApproval(client.id, approval.id, 'reject')}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-12 text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <Check size={48} className="text-green-500" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Harika İş! 🎉</h3>
          <p className="text-gray-600 text-lg">
            Onay bekleyen herhangi bir talep bulunmuyor.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Danışanlarınız alternatif talep ettiğinde burada görünecektir.
          </p>
        </div>
      )}
    </div>
  );
}

export default OnayListesi;