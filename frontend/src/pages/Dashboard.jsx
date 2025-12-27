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
import InstancesContent from '../components/InstancesContent';
import UsersContent from '../components/UsersContent';
import PlansContent from '../components/PlansContent';
import SettingsTab from '../components/SettingsTab';

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

        {/* ABA INSTÂNCIAS REFATORADA */}
        {activeTab === 'instances' && (
          <InstancesContent
            instances={filteredInstances}
            instanceSearchTerm={instanceSearchTerm}
            setInstanceSearchTerm={setInstanceSearchTerm}
            onNewInstance={() => {
              setNewInstanceName('');
              setSelectedOwnerId('');
              setSearchTerm('');
              setIsModalOpen(true);
            }}
            currentUser={currentUser}
            navigate={navigate}
            handleCheckStatus={handleCheckStatus}
            handleLogoutInstance={handleLogoutInstance}
            handleConnect={handleConnect}
            handleDeleteInstance={handleDeleteInstance}
            toggleTokenVisibility={toggleTokenVisibility}
            visibleTokens={visibleTokens}
          />
        )}

        {/* ABA USUÁRIOS REFATORADA */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <UsersContent
            users={filteredUsers}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            onNewUser={() => {
              setEditingUser(null);
              setNewUserData({ name: '', email: '', password: '', plan_id: '', role: 'user' });
              setIsUserModalOpen(true);
            }}
            openEditUserModal={openEditUserModal}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {/* ABA PLANOS REFATORADA */}
        {activeTab === 'plans' && currentUser?.role === 'admin' && (
          <PlansContent
            plans={plans}
            onNewPlan={() => {
              setEditingPlan(null);
              setNewPlanData({ name: '', max_instances: '', price: '' });
              setIsPlanModalOpen(true);
            }}
            openEditPlanModal={openEditPlanModal}
            handleDeletePlan={handleDeletePlan}
          />
        )}

        {/* ABA CONFIGURAÇÕES REFATORADA */}
        {activeTab === 'settings' && currentUser?.role === 'admin' && (
          <SettingsTab />
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