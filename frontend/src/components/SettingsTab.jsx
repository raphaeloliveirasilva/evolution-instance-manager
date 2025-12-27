// src/components/SettingsTab.jsx
import React from 'react';
import SettingsContent from './SettingsContent';

export default function SettingsTab() {
  return (
    <section className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Configurações do Sistema</h2>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Gerencie chaves e preferências globais.</p>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
        <SettingsContent />
      </div>
    </section>
  );
}