import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('@manager:user'));

  // --- ESTADOS DA SIDEBAR ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('@manager:sidebar-collapsed');
    return saved === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('@manager:sidebar-collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  // --- LÓGICA DE ABA ATIVA ---
  const getActiveTab = () => {
    if (location.pathname.includes('/instances/')) return 'instances';
    return location.state?.targetTab || 'instances';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      
      {/* 1. OVERLAY MOBILE (Fundo escuro quando menu abre) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 2. SIDEBAR (Recebe os comandos de abrir/fechar) */}
      <Sidebar
        activeTab={getActiveTab()}
        onNavigate={(tab) => {
          navigate('/dashboard', { state: { targetTab: tab } });
          setIsSidebarOpen(false); // Fecha o menu ao clicar em algo no mobile
        }}
        currentUser={currentUser}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={() => { localStorage.clear(); window.location.href = '/'; }}
      />

      {/* 3. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 transition-all duration-300 ease-in-out">
        
        {/* --- AQUI ESTÁ O MENU MOBILE QUE FALTAVA --- */}
        {/* Só aparece em telas pequenas (md:hidden) */}
        <div className="md:hidden flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
          >
            {/* Ícone de Menu (Hambúrguer) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Título do App no Mobile */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">Evolution <span className="text-indigo-600">Manager</span></h1>
          </div>
        </div>
        {/* ------------------------------------------- */}

        {/* Onde o Dashboard ou InstanceDetails são renderizados */}
        <Outlet />
      </main>
    </div>
  );
}