import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [instances, setInstances] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('instances'); 
  const currentUser = JSON.parse(localStorage.getItem('@manager:user'));
  const navigate = useNavigate();

  // Estados para Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Estados para Criação/Edição
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', plan_id: '' });
  const [newPlanData, setNewPlanData] = useState({ name: '', max_instances: '', price: '' });
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingUser, setEditingUser] = useState(null); 

  // Estados de Interface e Conexão
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState({});

  useEffect(() => {
    if (activeTab === 'instances') loadInstances();
    
    if (activeTab === 'users' && currentUser?.role === 'admin') {
      loadUsers();
      loadPlans();
    }

    if (activeTab === 'plans' && currentUser?.role === 'admin') {
      loadPlans();
    }
  }, [activeTab]);

  // --- CARREGAMENTO ---
  async function loadInstances() {
    try {
      const response = await api.get('/instances');
      setInstances(response.data);
    } catch (err) { console.error("Erro ao carregar instâncias:", err); }
  }

  async function loadUsers() {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) { console.error("Erro ao carregar usuários:", err); }
  }

  async function loadPlans() {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch (err) { console.error("Erro ao carregar planos:", err); }
  }

  // --- LOGICA DE PLANOS ---
  function openEditPlanModal(plan) {
    setEditingPlan(plan);
    setNewPlanData({ name: plan.name, max_instances: plan.max_instances, price: plan.price });
    setIsPlanModalOpen(true);
  }

  async function handleSavePlan(e) {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, newPlanData);
        alert("Plano atualizado!");
      } else {
        await api.post('/plans', newPlanData);
        alert("Plano criado!");
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      setNewPlanData({ name: '', max_instances: '', price: '' });
      loadPlans();
    } catch (err) { alert(err.response?.data?.error || "Erro ao salvar plano"); }
  }

  async function handleDeletePlan(id) {
    if (confirm("Tem certeza que deseja excluir este plano? Isso pode afetar usuários vinculados.")) {
      try {
        await api.delete(`/plans/${id}`);
        loadPlans();
      } catch (err) { alert(err.response?.data?.error || "Erro ao excluir plano"); }
    }
  }

  // --- LOGICA DE INSTÂNCIAS ---
  const toggleTokenVisibility = (id) => { 
    setVisibleTokens(prev => ({ ...prev, [id]: !prev[id] })); 
  };

  async function handleCheckStatus(id) { 
    try {
      await api.get(`/instances/${id}/status`); 
      await loadInstances(); 
    } catch (err) { console.error(err); }
  }

  async function handleLogoutInstance(id) {
    if (confirm("Deseja realmente desconectar este WhatsApp?")) {
      try {
        await api.get(`/instances/${id}/logout`);
        await loadInstances();
      } catch (err) { alert("Erro ao desconectar."); }
    }
  }

  async function handleCreateInstance(e) {
    e.preventDefault();
    try {
      await api.post('/instances', { name: newInstanceName });
      setNewInstanceName('');
      setIsModalOpen(false);
      loadInstances();
    } catch (err) { alert(err.response?.data?.error || "Erro ao criar instância"); }
  }

  async function handleConnect(instance) {
    setSelectedInstance(instance); 
    setIsConnectModalOpen(true); 
    setIsQrLoading(true); 
    setQrCode('');
    try {
      const response = await api.get(`/instances/${instance.id}/connect`);
      const code = response.data.base64 || response.data.code;
      if (code) setQrCode(code);
      else setIsConnectModalOpen(false);
    } catch (err) { alert("Erro ao gerar QR Code."); setIsConnectModalOpen(false); }
    finally { setIsQrLoading(false); }
  }

  async function handleDeleteInstance(id) { 
    if(confirm("Deseja realmente excluir esta instância?")) { 
      try {
        await api.delete(`/instances/${id}`); 
        loadInstances(); 
      } catch (err) { alert("Erro ao excluir."); }
    } 
  }

  // --- LOGICA DE USUÁRIO ---
  function openEditUserModal(user) {
    setEditingUser(user);
    setNewUserData({
      name: user.name,
      email: user.email,
      password: '', 
      plan_id: user.subscription?.plan?.id || user.subscription?.plan_id || ''
    });
    setIsUserModalOpen(true);
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, newUserData);
        alert("Usuário atualizado com sucesso!");
      } else {
        await api.post('/users', newUserData);
        alert("Usuário criado com sucesso!");
      }
      
      setNewUserData({ name: '', email: '', password: '', plan_id: '' });
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar usuário");
    }
  }

  async function handleDeleteUser(id) {
    if (confirm("Deseja realmente excluir este usuário?")) {
      try {
        await api.delete(`/users/${id}`);
        loadUsers();
      } catch (err) { alert("Erro ao excluir usuário"); }
    }
  }

  function handleLogout() { 
    localStorage.clear(); 
    window.location.href = '/'; 
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">G</div>
            Api
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 capitalize tracking-widest font-medium">Manager</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('instances')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-medium capitalize ${activeTab === 'instances' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Instâncias
          </button>

          {currentUser?.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-medium capitalize ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Usuários
              </button>
              <button onClick={() => setActiveTab('plans')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-medium capitalize ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Planos
              </button>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
              {currentUser?.name?.substring(0,2).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-slate-200 truncate w-32">{currentUser?.name}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-10">
        
        {/* ABA INSTÂNCIAS */}
        {activeTab === 'instances' && (
          <section className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Instâncias</h2>
                <p className="text-slate-500 mt-1">Gerencie suas conexões e veja os números ativos.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Nova instância
              </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {instances.map(instance => (
                <div key={instance.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight leading-none">{instance.name}</h3>
                        {currentUser?.role === 'admin' && instance.owner && (
                          <p className="text-sm text-indigo-500 font-bold flex items-center gap-2 mt-3 capitalize">
                            Dono: {instance.owner.name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {/* AJUSTE AQUI: Mudado para crases (`) para a rota funcionar */}
                        <button onClick={() => navigate(`/instances/${instance.id}`)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        <button onClick={() => handleCheckStatus(instance.id)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 mb-6">
                      <span className={`w-2.5 h-2.5 rounded-full ${instance.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <span className="text-[10px] font-bold capitalize text-slate-400 uppercase">{instance.status}</span>
                   </div>

                   <div className={`mb-4 p-4 rounded-2xl flex items-center gap-4 border transition-all ${instance.number ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-200">
                        {instance.profile_picture ? <img src={instance.profile_picture} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>}
                      </div>
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${instance.number ? 'text-emerald-600' : 'text-slate-400'}`}>{instance.number ? 'Ativo' : 'Pendente'}</p>
                        <p className="text-sm font-bold text-slate-700">+{instance.number || '---'}</p>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Token da Instância</label>
                      <div className="flex justify-between items-center gap-2 overflow-hidden">
                        <code className="text-xs text-indigo-600 font-mono truncate">{visibleTokens[instance.id] ? instance.token : '••••••••••••••••••••'}</code>
                        <div className="flex gap-1">
                          <button onClick={() => toggleTokenVisibility(instance.id)} className="p-1 text-slate-300 hover:text-indigo-600 transition-colors">{visibleTokens[instance.id] ? '🙈' : '👁️'}</button>
                          <button onClick={() => {navigator.clipboard.writeText(instance.token); alert('Copiado!')}} className="p-1 text-slate-300 hover:text-indigo-600 transition-colors">📄</button>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-3">
                      {instance.status === 'connected' ? (
                        <button onClick={() => handleLogoutInstance(instance.id)} className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-sm font-bold hover:bg-red-600 transition shadow-md">Desconectar</button>
                      ) : (
                        <button onClick={() => handleConnect(instance)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-slate-800 transition shadow-md">Conectar</button>
                      )}
                      <button onClick={() => handleDeleteInstance(instance.id)} className="px-5 bg-red-50 text-red-500 rounded-2xl border border-red-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABA USUÁRIOS */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <section className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Gestão de usuários</h2>
                <p className="text-slate-500 mt-1">Cadastre e gerencie seus clientes.</p>
              </div>
              <button onClick={() => { setEditingUser(null); setNewUserData({ name: '', email: '', password: '', plan_id: '' }); setIsUserModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">Novo usuário</button>
            </header>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Nome / Email</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Plano</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors text-slate-700 font-medium">
                      <td className="px-8 py-5">
                        <p className="font-bold">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight">
                          {user.subscription?.plan?.name || '---'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right flex justify-end gap-2">
                        {/* AJUSTE AQUI: Chamando a função para editar usuário */}
                        <button onClick={() => openEditUserModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        {/* AJUSTE AQUI: Chamando a função para excluir usuário */}
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ABA PLANOS */}
        {activeTab === 'plans' && currentUser?.role === 'admin' && (
          <section className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Planos do sistema</h2>
                <p className="text-slate-500 mt-1">Gerencie preços e limites das assinaturas.</p>
              </div>
              <button onClick={() => { setEditingPlan(null); setNewPlanData({ name: '', max_instances: '', price: '' }); setIsPlanModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                Novo plano
              </button>
            </header>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Plano</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Limite</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Preço</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map(plan => (
                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                      <td className="px-8 py-5 font-bold">{plan.name}</td>
                      <td className="px-8 py-5 text-sm">{plan.max_instances} instâncias</td>
                      <td className="px-8 py-5 font-mono font-bold text-emerald-600">R$ {Number(plan.price).toFixed(2)}</td>
                      <td className="px-8 py-5 text-right flex justify-end gap-2">
                        <button onClick={() => openEditPlanModal(plan)} className="p-2 text-slate-400 hover:text-indigo-600 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-slate-400 hover:text-red-500 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODAL PLANO */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingPlan ? 'Editar plano' : 'Criar novo plano'}</h3>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nome</label>
                <input type="text" required className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500" value={newPlanData.name} onChange={e => setNewPlanData({...newPlanData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Limite de Instâncias</label>
                <input type="number" required className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500" value={newPlanData.max_instances} onChange={e => setNewPlanData({...newPlanData, max_instances: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Preço Mensal (R$)</label>
                <input type="number" step="0.01" required className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-500" value={newPlanData.price} onChange={e => setNewPlanData({...newPlanData, price: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setIsPlanModalOpen(false); setEditingPlan(null); }} className="flex-1 text-slate-400 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">{editingPlan ? 'Atualizar' : 'Salvar Plano'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL USUÁRIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingUser ? 'Editar cliente' : 'Cadastrar cliente'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <input type="text" placeholder="Nome" required className="w-full border p-4 rounded-2xl outline-none" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full border p-4 rounded-2xl outline-none" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
              <input 
                type="password" 
                placeholder={editingUser ? "Deixe em branco para não alterar" : "Senha"} 
                required={!editingUser} 
                className="w-full border p-4 rounded-2xl outline-none" 
                value={newUserData.password} 
                onChange={e => setNewUserData({...newUserData, password: e.target.value})} 
              />
              <select required className="w-full border p-4 rounded-2xl bg-slate-50 outline-none" value={newUserData.plan_id} onChange={e => setNewUserData({...newUserData, plan_id: e.target.value})}>
                <option value="">Selecione um plano</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="flex-1 text-slate-400 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">{editingUser ? 'Salvar alterações' : 'Criar Conta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QR CODE */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl">
            <h3 className="text-2xl font-bold mb-8">Conectar WhatsApp</h3>
            <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-center min-h-[250px] border-4 border-dashed border-slate-100">
              {isQrLoading ? <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div> : <img src={qrCode} alt="QR Code" className="max-w-full rounded-lg" />}
            </div>
            <button onClick={() => { setIsConnectModalOpen(false); if (selectedInstance) handleCheckStatus(selectedInstance.id); }} className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all">Concluir</button>
          </div>
        </div>
      )}

      {/* MODAL NOVA INSTANCIA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Nova instância</h3>
            <form onSubmit={handleCreateInstance} className="space-y-4">
              <input autoFocus type="text" placeholder="Nome" required className="w-full border p-4 rounded-2xl outline-none" value={newInstanceName} onChange={e => setNewInstanceName(e.target.value)} />
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-slate-400 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}