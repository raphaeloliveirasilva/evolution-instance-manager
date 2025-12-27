// src/components/instance/InstanceHeader.jsx
import React from 'react';
// O import do ArrowLeft pode ser removido pois não é mais usado
// import { ArrowLeft } from 'lucide-react'; 

export default function InstanceHeader({ instance }) {
  return (
    <header className="mb-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Info da Instância */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-indigo-100 border-4 border-white">
               {instance?.profile_picture ? (
                 <img src={instance.profile_picture} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                 instance?.name?.substring(0,1).toUpperCase()
               )}
            </div>
            {/* Status flutuante */}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
              instance?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{instance?.name}</h2>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {instance?.number ? `+${instance.number}` : 'Aguardando conexão'}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}