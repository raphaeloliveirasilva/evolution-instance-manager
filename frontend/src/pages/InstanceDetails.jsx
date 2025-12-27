// src/pages/InstanceDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GeneralSettings from '../components/instance/GeneralSettings';
import TypebotSettings from '../components/instance/TypebotSettings';
import InstanceHeader from '../components/instance/InstanceHeader'; // Importado com sucesso

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
      if (typeof data.settings === 'string') {
        try { data.settings = JSON.parse(data.settings); } catch (e) { data.settings = {}; }
      }
      setInstance(data);
    } catch (err) {
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
    } catch (err) { alert("Erro ao salvar."); }
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
      loadInstanceData(); // Atualiza o estado local com os novos dados do banco
    } catch (err) { alert("Erro ao salvar Typebot."); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
      
      {/* HEADER COMPONENTIZADO - Substituímos o <header> antigo por este */}
      <InstanceHeader 
        instance={instance} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onBack={() => navigate('/dashboard')} 
      />

      <main className="max-w-4xl mx-auto px-6">
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
          <div className="py-32 text-center border border-dashed border-slate-200 rounded-[2.5rem]">
            <p className="text-slate-400 font-medium">Módulo de Webhooks em desenvolvimento.</p>
          </div>
        )}
      </main>
    </div>
  );
}