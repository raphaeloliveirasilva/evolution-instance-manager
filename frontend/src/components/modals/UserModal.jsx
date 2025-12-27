// src/components/modals/UserModal.jsx
export default function UserModal({
  isOpen,
  onClose,
  onSave,
  editingUser,
  newUserData,
  setNewUserData,
  plans // Lista de planos vinda do banco
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
        <h3 className="text-2xl font-bold mb-6">
          {editingUser ? 'Editar usuário' : 'Cadastrar novo usuário'}
        </h3>

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1">Nome Completo</label>
              <input 
                type="text" 
                placeholder="Ex: João Silva" 
                required 
                className="w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all" 
                value={newUserData.name} 
                onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} 
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1">E-mail</label>
              <input 
                type="email" 
                placeholder="joao@email.com" 
                required 
                className="w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all" 
                value={newUserData.email} 
                onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} 
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1">Senha</label>
              <input
                type="password"
                placeholder={editingUser ? "Manter atual" : "Definir senha"}
                required={!editingUser}
                className="w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all"
                value={newUserData.password}
                onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1">Nível de Acesso</label>
              <select 
                required 
                className="w-full bg-transparent outline-none text-sm text-slate-700 font-medium" 
                value={newUserData.role} 
                onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
              >
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1">Plano</label>
              <select 
                required 
                className="w-full bg-transparent outline-none text-sm text-slate-700 font-medium" 
                value={newUserData.plan_id} 
                onChange={e => setNewUserData({ ...newUserData, plan_id: e.target.value })}
              >
                <option value="">Selecionar...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
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
              {editingUser ? 'Salvar Alterações' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}