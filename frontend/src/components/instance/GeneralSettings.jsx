// src/components/instance/GeneralSettings.jsx
import React from 'react';

function ConfigRow({ title, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-slate-100 last:border-0 transition-colors">
      <div className="pr-4">
        <h4 className="font-bold text-slate-800 text-base tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${enabled ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );
}

export default function GeneralSettings({ settings, onToggle, onUpdateMsg, onSave }) {
  return (
    <section className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Configurações Gerais</h3>
          <p className="text-slate-500 text-sm mt-1">Configure o comportamento automático da sua conta.</p>
        </div>
        <button 
          onClick={onSave}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Salvar Alterações
        </button>
      </div>
      
      <div className="divide-y divide-slate-100">
        <ConfigRow 
          title="Rejeitar Chamadas"
          description="Bloqueia automaticamente todas as chamadas recebidas."
          enabled={settings.rejectCall}
          onChange={() => onToggle('rejectCall')}
        />

        {settings.rejectCall && (
          <div className="py-6 px-4 bg-slate-50/50 rounded-2xl my-2">
            <label className="block text-xs font-bold text-indigo-500 mb-2 ml-1">Mensagem de rejeição automática</label>
            <input 
              type="text"
              className="w-full bg-white p-4 rounded-xl border border-slate-200 outline-none text-sm"
              value={settings.msgCall || ""}
              onChange={(e) => onUpdateMsg(e.target.value)}
            />
          </div>
        )}

        <ConfigRow 
          title="Sempre Online"
          description="Mantém sua conta com status 'Online' ininterruptamente."
          enabled={settings.alwaysOnline}
          onChange={() => onToggle('alwaysOnline')}
        />

        <ConfigRow 
          title="Visualizar Mensagens"
          description="Envia o recibo de leitura (check azul) de forma automática."
          enabled={settings.readMessages}
          onChange={() => onToggle('readMessages')}
        />

        <ConfigRow 
          title="Visualizar Status"
          description="Marca as atualizações de status dos contatos como lidas."
          enabled={settings.readStatus}
          onChange={() => onToggle('readStatus')}
        />

        <ConfigRow 
          title="Ignorar Grupos"
          description="Desativa as automações para qualquer mensagem vinda de grupos."
          enabled={settings.groupsIgnore}
          onChange={() => onToggle('groupsIgnore')}
        />
      </div>
    </section>
  );
}