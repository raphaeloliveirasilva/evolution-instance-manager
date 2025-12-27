// src/components/modals/PlanModal.jsx
export default function PlanModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPlan, 
  newPlanData, 
  setNewPlanData 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
        <h3 className="text-2xl font-bold mb-6">
          {editingPlan ? 'Editar plano' : 'Criar novo plano'}
        </h3>
        
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-2">Nome</label>
            <input 
              type="text" 
              required 
              className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all" 
              value={newPlanData.name} 
              onChange={e => setNewPlanData({ ...newPlanData, name: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-2">Limite de Instâncias</label>
            <input 
              type="number" 
              required 
              className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all" 
              value={newPlanData.max_instances} 
              onChange={e => setNewPlanData({ ...newPlanData, max_instances: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-2">Preço Mensal (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              required 
              className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all" 
              value={newPlanData.price} 
              onChange={e => setNewPlanData({ ...newPlanData, price: e.target.value })} 
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              {editingPlan ? 'Atualizar' : 'Salvar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}