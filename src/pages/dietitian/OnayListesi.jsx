// src/pages/dietitian/OnayListesi.jsx

import React from 'react';
import { useClients } from '../../context/ClientContext';
import { Check, X, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { DAY_NAMES } from '../../data/weeklyMenuTemplate';

function OnayListesi() {
  // Veriyi ve fonksiyonları artık prop yerine context'ten alıyoruz
  const { clients, handleApproval } = useClients(); 

  const clientsWithPending = clients.filter(c => c.pendingApprovals && c.pendingApprovals.length > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="text-orange-500" size={28}/>
        <div>
            <h3 className="text-xl font-bold text-gray-800">Onay Bekleyen Talepler</h3>
        </div>
      </div>

      {clientsWithPending.length > 0 ? (
        <div className="space-y-8">
          {clientsWithPending.map(client => (
            <div key={client.id} className="border-t pt-6 first:border-t-0 first:pt-0">
              <h4 className="font-bold text-lg text-gray-800 mb-4">{client.name}'den Gelen İstekler:</h4>
              <div className="space-y-4">
                {client.pendingApprovals.map(approval => (
                  <div key={approval.id} className="bg-orange-50/50 rounded-xl p-4 border-2 border-orange-100">
                    {/* ... (Onay kartının içeriği aynı kalacak) ... */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApproval(client.id, approval.id, 'approve')} 
                        className="flex-1 bg-green-500 ...">
                        <Check size={18} />Onayla
                      </button>
                      <button 
                        onClick={() => handleApproval(client.id, approval.id, 'reject')} 
                        className="flex-1 bg-red-500 ...">
                        <X size={18} />Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Check size={40} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Harika İş!</h3>
          <p className="text-gray-600 mt-2">Onay bekleyen herhangi bir talep bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}

export default OnayListesi;