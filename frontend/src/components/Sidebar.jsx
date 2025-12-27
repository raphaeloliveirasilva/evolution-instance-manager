import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Bot, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onNavigate, 
  currentUser, 
  isCollapsed, 
  toggleSidebar, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  onLogout 
}) {
  
  // ESTRUTURA DO MENU: Basta adicionar novos itens aqui
  const menuConfig = [
    {
      group: "Principal",
      items: [
        { id: 'instances', label: 'Instâncias', icon: <LayoutDashboard size={20} />, roles: ['admin', 'user'] }
      ]
    },
    {
      group: "Gestão",
      roles: ['admin'],
      items: [
        { id: 'users', label: 'Usuários', icon: <Users size={20} />, roles: ['admin'] },
        { id: 'plans', label: 'Planos', icon: <CreditCard size={20} />, roles: ['admin'] },
      ]
    },
    {
      group: "Sistema",
      roles: ['admin'],
      items: [
        { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, roles: ['admin'] },
      ]
    }
  ];

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity" />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col shadow-2xl transition-all duration-300 ease-in-out
        w-[280px] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        
        {/* CABEÇALHO / LOGO */}
        <div className={`p-4 flex items-center mb-6 relative ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-indigo-500/20">
              E
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2">
                <h1 className="text-white font-bold text-lg leading-none">EvoManager</h1>
                <p className="text-[10px] text-slate-500 font-medium">Gestão De Instâncias</p>
              </div>
            )}
          </div>

          <button onClick={toggleSidebar} className="hidden md:flex absolute -right-4 top-7 w-8 h-8 rounded-full bg-indigo-600 text-white border-4 border-slate-50 items-center justify-center shadow-md hover:scale-110 transition-all">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* LINKS DE NAVEGAÇÃO */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar">
          {menuConfig.map((group, idx) => {
            // Só renderiza o grupo se o usuário tiver permissão
            if (group.roles && !group.roles.includes(currentUser?.role)) return null;

            return (
              <div key={idx} className="space-y-2">
                {!isCollapsed && (
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    if (item.roles && !item.roles.includes(currentUser?.role)) return null;
                    
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        title={isCollapsed ? item.label : ""}
                        className={`flex items-center w-full gap-3 p-3 rounded-xl transition-all duration-200 group
                          ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'hover:bg-slate-800 text-slate-400'}
                          ${isCollapsed ? 'md:justify-center md:px-0 md:w-12 md:h-12 mx-auto' : ''}
                        `}
                      >
                        {item.icon}
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* RODAPÉ DO USUÁRIO */}
        <div className={`mt-auto border-t border-slate-800 ${isCollapsed ? 'p-2' : 'p-6'}`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-4' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                {currentUser?.name?.substring(0, 2).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-200 truncate w-32 uppercase">{currentUser?.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser?.role}</span>
                </div>
              )}
            </div>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}