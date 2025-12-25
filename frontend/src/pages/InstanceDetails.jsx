import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

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

export default function InstanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');

  useEffect(() => {
    loadInstanceData();
  }, [id]);

  async function loadInstanceData() {
    try {
      const response = await api.get(`/instances/${id}`);
      const data = response.data;
      
      // Proteção: Garante que settings seja um objeto válido
      if (typeof data.settings === 'string') {
        try { data.settings = JSON.parse(data.settings); } catch (e) { data.settings = {}; }
      }
      
      setInstance(data);
    } catch (err) {
      console.error("Erro ao carregar instância:", err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  // Ajustado para refletir a estrutura flat que o backend envia
  function handleToggleSetting(key) {
    setInstance(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings?.[key]
      }
    }));
  }

  function handleUpdateMsgCall(text) {
    setInstance(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        msgCall: text
      }
    }));
  }

  async function handleSaveSettings() {
    try {
      // Enviamos as chaves em snake_case para o backend converter
      const payload = {
        reject_call: instance.settings?.rejectCall,
        msg_call: instance.settings?.msgCall,
        groups_ignore: instance.settings?.groupsIgnore,
        always_online: instance.settings?.alwaysOnline,
        read_messages: instance.settings?.readMessages,
        read_status: instance.settings?.readStatus
      };

      await api.put(`/instances/${id}/settings`, payload);
      alert("Configurações aplicadas com sucesso!");
    } catch (err) {
      alert("Erro ao salvar. Verifique o console.");
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Fallback para evitar erro de 'undefined' antes de carregar
  const settings = instance?.settings || {};

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
      <header className="pt-12 pb-2 mb-10 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium capitalize mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Voltar ao painel
          </button>
          
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-50 bg-slate-100 shrink-0">
              {instance?.profile_picture ? (
                <img src={instance.profile_picture} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-2xl">
                  {instance?.name?.substring(0,1)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{instance?.name}</h2>
              <p className="text-sm font-medium text-slate-400 mt-1 capitalize">
                 {instance?.number ? `+${instance.number}` : 'WhatsApp não conectado'}
              </p>
            </div>
          </div>

          <nav className="flex gap-10">
            {[{ id: 'geral', label: 'Comportamento' }, { id: 'typebot', label: 'Typebot' }, { id: 'webhook', label: 'Webhooks' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        {activeTab === 'geral' && (
          <section className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Configurações Gerais</h3>
                <p className="text-slate-500 text-sm mt-1">Configure o comportamento automático da sua conta.</p>
              </div>
              <button 
                onClick={handleSaveSettings}
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
                onChange={() => handleToggleSetting('rejectCall')}
              />

              {settings.rejectCall && (
                <div className="py-6 px-4 bg-slate-50/50 rounded-2xl my-2">
                  <label className="block text-xs font-bold text-indigo-500 mb-2 ml-1">Mensagem de rejeição automática</label>
                  <input 
                    type="text"
                    className="w-full bg-white p-4 rounded-xl border border-slate-200 outline-none text-sm"
                    value={settings.msgCall || ""}
                    onChange={(e) => handleUpdateMsgCall(e.target.value)}
                  />
                </div>
              )}

              <ConfigRow 
                title="Sempre Online"
                description="Mantém sua conta com status 'Online' ininterruptamente."
                enabled={settings.alwaysOnline}
                onChange={() => handleToggleSetting('alwaysOnline')}
              />

              <ConfigRow 
                title="Visualizar Mensagens"
                description="Envia o recibo de leitura (check azul) de forma automática."
                enabled={settings.readMessages}
                onChange={() => handleToggleSetting('readMessages')}
              />

              <ConfigRow 
                title="Visualizar Status"
                description="Marca as atualizações de status dos contatos como lidas."
                enabled={settings.readStatus}
                onChange={() => handleToggleSetting('readStatus')}
              />

              <ConfigRow 
                title="Ignorar Grupos"
                description="Desativa as automações para qualquer mensagem vinda de grupos."
                enabled={settings.groupsIgnore}
                onChange={() => handleToggleSetting('groupsIgnore')}
              />
            </div>
          </section>
        )}

        {['typebot', 'webhook'].includes(activeTab) && (
          <div className="py-32 text-center border border-dashed border-slate-200 rounded-[2.5rem]">
            <p className="text-slate-400 font-medium">Módulo de {activeTab} em desenvolvimento.</p>
          </div>
        )}
      </main>
    </div>
  );
}