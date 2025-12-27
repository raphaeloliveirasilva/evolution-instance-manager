// src/components/instance/InstanceHeader.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function InstanceHeader({ instance, activeTab, setActiveTab, onBack }) {
  const tabs = [
    { id: 'geral', label: 'Comportamento' },
    { id: 'typebot', label: 'Typebot' },
    { id: 'webhook', label: 'Webhooks' }
  ];

  return (
    <header className="pt-12 pb-2 mb-10 border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        {/* Botão Voltar */}
        <button 
          onClick={onBack} 
          className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar ao painel
        </button>
        
        {/* Info da Instância */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-3xl overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-indigo-100 border-4 border-white">
             {instance?.profile_picture ? (
               <img src={instance.profile_picture} alt="Perfil" className="w-full h-full object-cover" />
             ) : (
               instance?.name?.substring(0,1).toUpperCase()
             )}
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{instance?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${instance?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <p className="text-sm font-medium text-slate-400">
                {instance?.number ? `+${instance.number}` : 'Aguardando conexão'}
              </p>
            </div>
          </div>
        </div>

        {/* Navegação de Abas */}
        <nav className="flex gap-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full animate-in fade-in zoom-in duration-300"></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}