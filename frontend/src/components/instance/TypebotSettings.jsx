// src/components/instance/TypebotSettings.jsx
import { useState } from 'react';
import { Bot, Save, Globe, Zap } from 'lucide-react';

export default function TypebotSettings({ settings, onSave }) {
  // Inicializa o estado com os dados vindos das props ou valores padrão
  const [data, setData] = useState({
    enabled: settings?.typebot_enabled || false, // Note: ajustado para snake_case se vier do banco, ou camelCase dependendo da sua API. Ajuste conforme necessário.
    url: settings?.typebot_url || '',
    botName: settings?.typebot_name || '',
    delay: settings?.typebot_delay || 1000,
  });

  // Função para enviar os dados ao pai
  const handleSubmit = () => {
    onSave(data);
  };

  return (
    <section className="animate-in fade-in duration-500">
      
      {/* CABEÇALHO DA SEÇÃO (Sem abas, apenas título e botão salvar) */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Integração Typebot</h3>
          <p className="text-slate-500 text-sm mt-1">Conecte seu fluxo do Typebot a esta instância.</p>
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Save size={18} /> Salvar Integração
        </button>
      </div>

      <div className="space-y-6">
        {/* Switch Principal de Ativação */}
        <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border border-slate-100 transition-colors hover:border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 shadow-sm">
              <Bot size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">Ativar Chatbot</p>
              <p className="text-xs text-slate-400 font-medium">Habilita as respostas automáticas via Typebot.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setData({ ...data, enabled: !data.enabled })}
            className={`w-14 h-8 rounded-full transition-all duration-300 relative ${data.enabled ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-all duration-300 shadow-sm ${data.enabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Campos do Formulário (Só aparecem se ativado) */}
        {data.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
            
            <div className="space-y-3 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} /> URL do Typebot
              </label>
              <input 
                type="text" 
                placeholder="Ex: https://typebot.co/meu-bot"
                className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm shadow-sm"
                value={data.url}
                onChange={e => setData({...data, url: e.target.value})}
              />
            </div>

            <div className="space-y-3 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider flex items-center gap-2">
                <Bot size={14} /> Nome do Bot (Slug)
              </label>
              <input 
                type="text" 
                placeholder="Ex: atendimento-vendas"
                className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm shadow-sm"
                value={data.botName}
                onChange={e => setData({...data, botName: e.target.value})}
              />
            </div>

            <div className="space-y-3 col-span-2">
              <label className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} /> Delay de Resposta (ms)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="1000"
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm shadow-sm"
                  value={data.delay}
                  onChange={e => setData({...data, delay: e.target.value})}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">ms</span>
              </div>
              <p className="text-xs text-slate-400 ml-2">Tempo de "digitando..." antes de enviar a resposta.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}