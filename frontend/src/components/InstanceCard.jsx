// src/components/InstanceCard.jsx
import { Settings, RefreshCw, Eye, EyeOff, Copy, LogOut, Trash2, Smartphone } from 'lucide-react';

export default function InstanceCard({ 
  instance, 
  currentUser, 
  onNavigate, 
  onCheckStatus, 
  onLogout, 
  onConnect, 
  onDelete, 
  toggleTokenVisibility, 
  isVisible 
}) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group text-slate-800">
      
      {/* CABEÇALHO DO CARD */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h3 className="font-bold text-xl text-slate-800 tracking-tight leading-none">
            {instance.name}
          </h3>
          {currentUser?.role === 'admin' && instance.owner && (
            <p className="text-sm text-indigo-500 font-bold flex items-center gap-2 mt-3 capitalize">
              dono: {instance.owner.name}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(`/instances/${instance.id}`)} 
            className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
            title="Configurações"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => onCheckStatus(instance.id)} 
            className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
            title="Atualizar Status"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* STATUS DA CONEXÃO */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`w-2.5 h-2.5 rounded-full ${instance.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
        <span className="text-[10px] font-bold capitalize text-slate-400 uppercase">{instance.status}</span>
      </div>

      {/* INFO DO NÚMERO / PERFIL */}
      <div className={`mb-4 p-4 rounded-2xl flex items-center gap-4 border transition-all ${instance.number ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
        <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-200 flex-shrink-0">
          {instance.profile_picture ? (
            <img src={instance.profile_picture} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Perfil" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
              <Smartphone size={24} />
            </div>
          )}
        </div>
        <div>
          <p className={`text-[10px] font-bold uppercase ${instance.number ? 'text-emerald-600' : 'text-slate-400'}`}>
            {instance.number ? 'Ativo' : 'Pendente'}
          </p>
          <p className="text-sm font-bold text-slate-700">+{instance.number || '---'}</p>
        </div>
      </div>

      {/* TOKEN DA INSTÂNCIA */}
      <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100 text-slate-800">
        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Token da Instância</label>
        <div className="flex justify-between items-center gap-2 overflow-hidden">
          <code className="text-xs text-indigo-600 font-mono truncate">
            {isVisible ? instance.token : '••••••••••••••••••••'}
          </code>
          <div className="flex gap-1">
            <button 
              type="button" 
              onClick={() => toggleTokenVisibility(instance.id)} 
              className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
            >
              {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button 
              type="button" 
              onClick={() => { navigator.clipboard.writeText(instance.token); alert('Copiado!') }} 
              className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO PRINCIPAL */}
      <div className="flex gap-3">
        {instance.status === 'connected' ? (
          <button 
            onClick={() => onLogout(instance.id)} 
            className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-sm font-bold hover:bg-red-600 transition shadow-md flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Desconectar
          </button>
        ) : (
          <button 
            onClick={() => onConnect(instance)} 
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-slate-800 transition shadow-md"
          >
            Conectar
          </button>
        )}
        <button 
          onClick={() => onDelete(instance.id)} 
          className="px-5 bg-red-50 text-red-500 rounded-2xl border border-red-100 transition-colors hover:bg-red-100"
          title="Excluir Instância"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}