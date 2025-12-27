import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function SettingsContent() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => {
      const exists = prev.find(s => s.key === key);
      if (exists) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      }
      return [...prev, { key, value, group: 'system' }];
    });
  };

  const getSetting = (key) => settings.find(s => s.key === key)?.value || '';

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-slate-400">Carregando...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      {/* MENU DE ABAS - Estilo pílula igual ao seu sistema */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {['general', 'evolution', 'payment'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'general' && 'Geral'}
            {tab === 'evolution' && 'Evolution API'}
            {tab === 'payment' && 'Pagamento'}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 block mb-2">Nome do Sistema</label>
                <input 
                  className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
                  value={getSetting('app_name')} 
                  onChange={(e) => handleChange('app_name', e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 block mb-2">Link Suporte (WhatsApp)</label>
                <input 
                  className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
                  value={getSetting('support_link')} 
                  onChange={(e) => handleChange('support_link', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">Modo Manutenção</p>
                  <p className="text-xs text-slate-500">Bloqueia o acesso de usuários comuns.</p>
                </div>
                <button
                  onClick={() => handleChange('maintenance_mode', getSetting('maintenance_mode') === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    getSetting('maintenance_mode') === 'true' ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    getSetting('maintenance_mode') === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
               <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 block mb-2">URL Global da Evolution</label>
               <input 
                className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
                placeholder="https://api.seusistema.com"
                value={getSetting('evolution_api_url')} 
                onChange={(e) => handleChange('evolution_api_url', e.target.value)} 
              />
            </div>
            <div className="md:col-span-2 relative">
               <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 block mb-2">Global API Key (Master Key)</label>
               <input 
                type={showSecrets['evo'] ? 'text' : 'password'}
                className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm font-mono"
                value={getSetting('evolution_global_key')} 
                onChange={(e) => handleChange('evolution_global_key', e.target.value)} 
              />
              <button 
                onClick={() => setShowSecrets(p => ({...p, evo: !p.evo}))}
                className="absolute right-4 top-10 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showSecrets['evo'] ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-8">
             <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-900 text-lg">Modo Sandbox (Testes)</p>
                  <p className="text-sm text-indigo-600">Ative para testar pagamentos sem dinheiro real.</p>
                </div>
                <button
                  onClick={() => handleChange('asaas_sandbox', getSetting('asaas_sandbox') === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    getSetting('asaas_sandbox') === 'true' ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    getSetting('asaas_sandbox') === 'true' ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
             </div>

             <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 block mb-2">API Key Asaas</label>
                <input 
                  type="password"
                  className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 font-mono shadow-sm"
                  value={getSetting('asaas_api_key')} 
                  onChange={(e) => handleChange('asaas_api_key', e.target.value)} 
                />
             </div>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-300"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}