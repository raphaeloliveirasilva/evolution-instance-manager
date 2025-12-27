// src/components/modals/InstanceModal.jsx
import { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';

export default function InstanceModal({
  isOpen,
  onClose,
  onSave,
  newInstanceName,
  setNewInstanceName,
  selectedOwnerId,
  setSelectedOwnerId,
  users,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  // Filtra a lista de usuários para o dropdown
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user) => {
    setSelectedOwnerId(user.id);
    setSearchTerm(`${user.name} (${user.email})`);
    setShowDropdown(false);
  };

  const handleCancel = () => {
    setSearchTerm('');
    setShowDropdown(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-indigo-600" /> Nova instância
        </h3>

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1 text-slate-400">Nome da Instância</label>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Vendas Matriz"
              required
              className="w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              value={newInstanceName}
              onChange={e => setNewInstanceName(e.target.value)}
            />
          </div>

          {currentUser?.role === 'admin' && (
            <div className="relative space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 block mb-1">
                Atribuir ao Usuário
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm"
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
                </div>

                {showDropdown && (
                  <div className="absolute z-[60] mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-200">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-50"
                      onClick={() => {
                        setSelectedOwnerId('');
                        setSearchTerm('Minha conta (Admin)');
                        setShowDropdown(false);
                      }}
                    >
                      <p className="text-sm font-bold text-slate-700">Minha conta (Admin)</p>
                    </button>

                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                        onClick={() => handleSelectUser(user)}
                      >
                        <p className="text-sm font-bold text-slate-700">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </button>
                    ))}

                    {filteredUsers.length === 0 && searchTerm !== '' && (
                      <div className="p-4 text-center text-slate-400 text-sm italic">
                        Nenhum usuário encontrado...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}