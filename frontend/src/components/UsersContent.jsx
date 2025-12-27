// src/components/UsersContent.jsx
import React from 'react';
import { Search, UserPlus, User, Pencil, Trash2 } from 'lucide-react';

export default function UsersContent({
  users,
  userSearchTerm,
  setUserSearchTerm,
  onNewUser,
  openEditUserModal,
  handleDeleteUser
}) {
  return (
    <section className="animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestão de usuários</h2>
          <p className="text-slate-500 mt-1">Gerencie os acessos e planos dos seus clientes.</p>
        </div>
        <button
          onClick={onNewUser}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Novo usuário
        </button>
      </header>

      {/* BARRA DE PESQUISA INTEGRADA */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
        />
      </div>

      {/* CONTAINER DA TABELA */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome / Email</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plano</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-all duration-200">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200/50">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                          user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border bg-indigo-50 text-indigo-600 border-indigo-200">
                    {user.subscription?.plan?.name || '---'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    {/* BOTÃO EDITAR */}
                    <button 
                      onClick={() => openEditUserModal(user)} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Editar Usuário"
                    >
                      <Pencil size={18} />
                    </button>
                    {/* BOTÃO EXCLUIR */}
                    <button 
                      onClick={() => handleDeleteUser(user.id)} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-20 text-center">
            <User size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </section>
  );
}