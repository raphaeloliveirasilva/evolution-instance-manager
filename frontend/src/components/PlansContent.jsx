// src/components/PlansContent.jsx
import React from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

export default function PlansContent({
  plans,
  onNewPlan,
  openEditPlanModal,
  handleDeletePlan
}) {
  return (
    <section className="animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Planos do sistema</h2>
          <p className="text-slate-500 mt-1">Gerencie preços e limites das assinaturas.</p>
        </div>
        <button 
          onClick={onNewPlan} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo plano
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limite</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                <td className="px-8 py-5 font-bold">{plan.name}</td>
                <td className="px-8 py-5 text-sm">{plan.max_instances} instâncias</td>
                <td className="px-8 py-5 font-mono font-bold text-emerald-600">
                  R$ {Number(plan.price).toFixed(2)}
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openEditPlanModal(plan)} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Editar Plano"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)} 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir Plano"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {plans.length === 0 && (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Nenhum plano cadastrado</p>
          </div>
        )}
      </div>
    </section>
  );
}