import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SettingsContent from '../components/SettingsContent';
import Sidebar from '../components/Sidebar';
import PlanModal from '../components/modals/PlanModal';
import UserModal from '../components/modals/UserModal';
import InstanceModal from '../components/modals/InstanceModal';
import ConnectModal from '../components/modals/ConnectModal';
import InstanceCard from '../components/InstanceCard';

export default function Dashboard() {
  const [instances, setInstances] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('instances');
  const currentUser = JSON.parse(localStorage.getItem('@manager:user'));
  const navigate = useNavigate();

  // --- 1. ESTADOS PARA MODAIS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- 2. ESTADOS PARA BUSCA E FILTROS ---
  const [userSearchTerm, setUserSearchTerm] = useState(''); // Busca na tabela de usuários
  const [instanceSearchTerm, setInstanceSearchTerm] = useState(''); // Busca na grid de instâncias
  const [searchTerm, setSearchTerm] = useState(''); // Busca de usuários NO DROPDOWN do modal

  // --- 3. ESTADOS PARA CRIAÇÃO / EDIÇÃO ---
  const [newInstanceName, setNewInstanceName] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', plan_id: '', role: 'user' });
  const [newPlanData, setNewPlanData] = useState({ name: '', max_instances: '', price: '' });
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // --- 4. ESTADOS DE INTERFACE E CONEXÃO ---
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState({});

  // --- 5. LÓGICAS DE FILTRO (Sempre após os UseStates) ---

  // Filtra os usuários baseado no termo de busca (Nome ou Email)
  const filteredUsers = (users || []).filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Filtra as instâncias baseado no nome da instância OU no nome do dono
  const filteredInstances = (instances || []).filter(instance => {
    const term = instanceSearchTerm.toLowerCase();
    const instanceNameMatch = instance.name?.toLowerCase().includes(term);
    const ownerNameMatch = instance.owner?.name?.toLowerCase().includes(term);

    return instanceNameMatch || ownerNameMatch;
  });

  // --- ESTADOS PARA SIDEBAR RETRÁTIL ---
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('@manager:sidebar-collapsed');
    return saved === 'true'; // Inicializa com o valor salvo ou false
  });

  // Função para alternar e salvar no LocalStorage
  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('@manager:sidebar-collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  // --- 6. FUNÇÕES DE NAVEGAÇÃO E CARREGAMENTO ---
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (activeTab === 'instances') {
      loadInstances();
      if (currentUser?.role === 'admin') {
        loadUsers();
      }
    }

    if (activeTab === 'users' && currentUser?.role === 'admin') {
      loadUsers();
      loadPlans();
    }

    if (activeTab === 'plans' && currentUser?.role === 'admin') {
      loadPlans();
    }
  }, [activeTab]);

  // ... (restante das suas funções loadInstances, loadUsers, etc)

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
      // --- ATUALIZAÇÃO: Agora enviamos o dono junto com o nome ---
      await api.post('/instances', {
        name: newInstanceName,
        owner_id: selectedOwnerId
      });

      // Limpar os campos
      setNewInstanceName('');
      setSelectedOwnerId(''); // Importante limpar para não ficar selecionado na próxima 

      setSearchTerm(''); // Limpa o texto que ficou escrito na busca
      setShowDropdown(false); // Garante que o dropdown feche

      setIsModalOpen(false);
      loadInstances();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao criar instância");
    }
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
    if (confirm("Deseja realmente excluir esta instância?")) {
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
      plan_id: user.subscription?.plan?.id || user.subscription?.plan_id || '',
      role: user.role
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 relative">

      {/* OVERLAY MOBILE: Fundo escuro que fecha o menu ao clicar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR */}

      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigation}
        currentUser={currentUser}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />


      {/* Alterei o padding para p-6 no celular e md:p-10 no PC */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 transition-all duration-300 ease-in-out">

        {/* CABEÇALHO MOBILE (Botão Menu + Título) */}
        <div className="md:hidden flex items-center gap-4 mb-8">
          {/* Botão para abrir o menu */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          {/* Título Mobile */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">Evolution <span className="text-indigo-600">Manager</span></h1>
          </div>
        </div>

        {/* ABA INSTÂNCIAS */}
        {activeTab === 'instances' && (
          <section className="animate-in fade-in duration-500">
            {/* --- CABEÇALHO --- */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Instâncias</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Gerencie suas conexões e veja os números ativos.</p>
              </div>
              <button
                onClick={() => {
                  setNewInstanceName('');
                  setSelectedOwnerId('');
                  setSearchTerm(''); // Limpa a busca do DROPDOWN do modal
                  setIsModalOpen(true);
                }}
                className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Nova instância
              </button>
            </header>

            {/* --- BARRA DE PESQUISA (Ajustada para instanceSearchTerm) --- */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por instância ou nome do dono..."
                className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
                value={instanceSearchTerm}
                onChange={(e) => setInstanceSearchTerm(e.target.value)}
              />
            </div>

            {/* GRID DE CARDS REFATORADO */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredInstances?.map(instance => (
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
            {filteredInstances?.length === 0 && instanceSearchTerm && (
              <div className="py-20 text-center animate-in zoom-in duration-300">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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
        )}

        {/* ABA USUÁRIOS */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <section className="animate-in fade-in duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Gestão de usuários</h2>
                <p className="text-slate-500 mt-1">Gerencie os acessos e planos dos seus clientes.</p>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewUserData({ name: '', email: '', password: '', plan_id: '', role: 'user' });
                  setIsUserModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Novo usuário
              </button>
            </header>

            {/* BARRA DE PESQUISA INTEGRADA */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-600 shadow-sm"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>

            {/* CONTAINER DA TABELA COM ARREDONDAMENTO SUAVIZADO (rounded-2xl) */}
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
                  {/* MAPEANDO OS USUÁRIOS FILTRADOS PELA BUSCA */}
                  {filteredUsers.map(user => (
                    <tr
                      key={user.id}
                      className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-all duration-200"
                    >
                      {/* COLUNA 1: AVATAR + NOME + CARGO (Mantido intacto) */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200 border border-indigo-200/50">
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors duration-200">
                                {user.name}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${user.role === 'admin'
                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* COLUNA 2: PLANOS (Mantido intacto) */}
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border ${user.subscription?.plan?.name?.toLowerCase().includes('ouro')
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : user.subscription?.plan?.name?.toLowerCase().includes('prata')
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : user.subscription?.plan?.name?.toLowerCase().includes('bronze')
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}>
                          {user.subscription?.plan?.name || '---'}
                        </span>
                      </td>

                      {/* COLUNA 3: AÇÕES (Mantido intacto) */}
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 active:scale-90"
                            title="Editar Usuário"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-90"
                            title="Excluir Usuário"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* MENSAGEM DE BUSCA VAZIA */}
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 font-medium">Nenhum usuário encontrado para "{userSearchTerm}"</p>
                </div>
              )}
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

        {/* ABA CONFIGURAÇÕES */}
        {activeTab === 'settings' && currentUser?.role === 'admin' && (
          <section className="animate-in fade-in duration-500">
            <header className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Configurações do Sistema</h2>
              <p className="text-slate-500 mt-1 text-sm md:text-base">Gerencie chaves e preferências globais.</p>
            </header>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <SettingsContent />
            </div>
          </section>
        )}

      </main>

      {/* MODAL PLANO REFATORADO */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => { setIsPlanModalOpen(false); setEditingPlan(null); }}
        onSave={handleSavePlan}
        editingPlan={editingPlan}
        newPlanData={newPlanData}
        setNewPlanData={setNewPlanData}
      />

      {/* MODAL USUÁRIO REFATORADO */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        editingUser={editingUser}
        newUserData={newUserData}
        setNewUserData={setNewUserData}
        plans={plans}
      />

      {/* MODAL QR CODE REFATORADO */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          if (selectedInstance) handleCheckStatus(selectedInstance.id);
        }}
        qrCode={qrCode}
        isQrLoading={isQrLoading}
        instanceName={selectedInstance?.name}
      />

      {/* MODAL INSTÂNCIA REFATORADO */}
      <InstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateInstance}
        newInstanceName={newInstanceName}
        setNewInstanceName={setNewInstanceName}
        selectedOwnerId={selectedOwnerId}
        setSelectedOwnerId={setSelectedOwnerId}
        users={users}
        currentUser={currentUser}
      />


    </div>
  );
}