// src/components/InstancesContent.jsx
import React from 'react';
import InstanceCard from './InstanceCard';
import { Search, Plus, Info } from 'lucide-react';

export default function InstancesContent({
  instances,
  instanceSearchTerm,
  setInstanceSearchTerm,
  onNewInstance,
  currentUser,
  navigate,
  handleCheckStatus,
  handleLogoutInstance,
  handleConnect,
  handleDeleteInstance,
  toggleTokenVisibility,
  visibleTokens
}) {
  return (
    <section className="animate-in fade-in duration-500">
      {/* --- CABEÇALHO --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Instâncias</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Gerencie suas conexões e veja os números ativos.</p>
        </div>
        <button
          onClick={onNewInstance}
          className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nova instância
        </button>
      </header>

      {/* --- BARRA DE PESQUISA --- */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar por instância ou nome do dono..."
          className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
          value={instanceSearchTerm}
          onChange={(e) => setInstanceSearchTerm(e.target.value)}
        />
      </div>

      {/* --- GRID DE CARDS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {instances?.map(instance => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            currentUser={currentUser}
            onNavigate={navigate}
            onCheckStatus={handleCheckStatus}
            onLogout={handleLogoutInstance}
            onConnect={handleConnect}
            onDelete={handleDeleteInstance}
            toggleTokenVisibility={toggleTokenVisibility}
            isVisible={visibleTokens[instance.id]}
          />
        ))}
      </div>

      {/* FEEDBACK CASO NÃO HAJA RESULTADOS */}
      {instances?.length === 0 && instanceSearchTerm && (
        <div className="py-20 text-center animate-in zoom-in duration-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium">Nenhuma instância encontrada para "{instanceSearchTerm}"</p>
          <button
            onClick={() => setInstanceSearchTerm('')}
            className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
          >
            Limpar busca
          </button>
        </div>
      )}
    </section>
  );
}