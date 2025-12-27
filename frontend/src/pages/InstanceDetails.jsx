import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GeneralSettings from '../components/instance/GeneralSettings';
import TypebotSettings from '../components/instance/TypebotSettings';
import InstanceHeader from '../components/instance/InstanceHeader';

// REMOVIDO: import Sidebar from '../components/Sidebar';

export default function InstanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');

  // REMOVIDO: Estados da Sidebar (isSidebarOpen, isCollapsed, toggleSidebar)
  // O Layout pai já cuida disso.

  useEffect(() => {
    loadInstanceData();
  }, [id]);

  async function loadInstanceData() {
    try {
      const response = await api.get(`/instances/${id}`);
      const data = response.data;
      if (typeof data.settings === 'string') {
        try { data.settings = JSON.parse(data.settings); } catch (e) { data.settings = {}; }
      }
      setInstance(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  // --- LÓGICA DE SALVAMENTO ---
  async function handleSaveGeneral() {
    try {
      const payload = {
        reject_call: instance.settings?.rejectCall,
        msg_call: instance.settings?.msgCall,
        groups_ignore: instance.settings?.groupsIgnore,
        always_online: instance.settings?.alwaysOnline,
        read_messages: instance.settings?.readMessages,
        read_status: instance.settings?.readStatus
      };
      await api.put(`/instances/${id}/settings`, payload);
      alert("Configurações aplicadas!");
    } catch (err) { alert("Erro ao salvar configurações gerais."); }
  }

  async function handleSaveTypebot(typebotData) {
    try {
      const payload = {
        typebot_enabled: typebotData.enabled,
        typebot_url: typebotData.url,
        typebot_name: typebotData.botName,
        typebot_delay: typebotData.delay
      };
      await api.put(`/instances/${id}/settings`, payload);
      alert("Typebot configurado!");
      loadInstanceData();
    } catch (err) { alert("Erro ao salvar Typebot."); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <>
      {/* REMOVIDO: 
         - Wrapper div (flex min-h-screen...)
         - <Sidebar />
         - Botão Mobile
         - Overlay
         
         Agora retornamos APENAS o conteúdo da página, 
         pois o MainLayout já fornece a estrutura em volta.
      */}

      <InstanceHeader 
        instance={instance} 
        onBack={() => navigate('/dashboard')} 
      />

      <div className="max-w-7xl bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* NAVEGAÇÃO DE ABAS INTERNA */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl inline-flex gap-1 mb-10">
          {[
            { id: 'geral', label: 'Geral' },
            { id: 'typebot', label: 'Typebot' },
            { id: 'webhook', label: 'Webhooks' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* RENDERIZAÇÃO DINÂMICA DAS CONFIGURAÇÕES */}
        <div className="animate-in fade-in duration-500">
          {activeTab === 'geral' && (
            <GeneralSettings 
              settings={instance.settings || {}}
              onToggle={(key) => setInstance({
                ...instance, 
                settings: { ...instance.settings, [key]: !instance.settings[key] }
              })}
              onUpdateMsg={(txt) => setInstance({
                ...instance, 
                settings: { ...instance.settings, msgCall: txt }
              })}
              onSave={handleSaveGeneral}
            />
          )}

          {activeTab === 'typebot' && (
            <TypebotSettings 
              settings={instance.settings || {}} 
              onSave={handleSaveTypebot} 
            />
          )}

          {activeTab === 'webhook' && (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="text-slate-400 font-medium tracking-tight">Módulo de Webhooks em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}