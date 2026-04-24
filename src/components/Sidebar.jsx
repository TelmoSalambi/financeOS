import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PieChart, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  TrendingUp,
  Target,
  Upload,
  Users,
  Briefcase,
  Calculator,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onNewTransaction, isMobile, mobileOpen, collapsed, onCloseMobile, onToggleCollapse }) => {
  const { signOut, isBusiness, isPersonal } = useAuth();

  const personalMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Receitas', icon: ArrowUpCircle, path: '/receitas' },
    { name: 'Despesas', icon: ArrowDownCircle, path: '/despesas' },
    { name: 'Orçamentos', icon: PieChart, path: '/orcamentos' },
    { name: 'Metas', icon: Target, path: '/metas' },
    { name: 'Simuladores', icon: Calculator, path: '/simuladores' },
    { name: 'Relatórios', icon: BarChart3, path: '/relatorios' },
    { name: 'Importar', icon: Upload, path: '/importar' },
  ];

  const businessMenu = [
    { name: 'Painel Geral', icon: LayoutDashboard, path: '/' },
    { name: 'Meus Clientes', icon: Users, path: '/clientes' },
    { name: 'Relatórios Agregados', icon: BarChart3, path: '/relatorios' },
  ];

  const menuItems = isBusiness ? businessMenu : personalMenu;
  const isExpanded = !collapsed || isMobile;

  // Mobile: slides in/out via translate. Hidden off-screen by default.
  // Desktop: fixed, always visible, changes width between 72px and 256px.
  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `fixed inset-y-0 left-0 z-50 bg-secondary text-white flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-64'} shadow-xl`;

  return (
    <aside className={sidebarClasses}>
      {/* ── HEADER ── */}
      <div className={`shrink-0 flex items-center gap-3 p-4 ${collapsed && !isMobile ? 'justify-center px-2' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 relative overflow-hidden group">
            <BarChart3 size={20} className="text-white relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tighter truncate leading-none">Finance<span className="text-primary">OS</span></h1>
              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Inteligência Financeira</p>
            </div>
          )}
        </div>

        {/* Close / Collapse button */}
        {isMobile ? (
          <button 
            onClick={onCloseMobile} 
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        ) : (
          !collapsed && (
            <button 
              onClick={onToggleCollapse} 
              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              aria-label="Recolher menu"
            >
              <ChevronsLeft size={18} />
            </button>
          )
        )}
      </div>

      {/* Expand button when collapsed (desktop only) */}
      {!isMobile && collapsed && (
        <button 
          onClick={onToggleCollapse}
          className="mx-auto mb-2 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Expandir menu"
        >
          <ChevronsRight size={18} />
        </button>
      )}

      {/* ── BADGE ── */}
      {isExpanded && (
        <div className="shrink-0 px-4 mb-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
            isBusiness ? 'border-amber-500/20 bg-amber-500/5 text-amber-400' : 'border-primary/20 bg-primary/5 text-primary'
          }`}>
            {isBusiness ? <Briefcase size={14} className="shrink-0" /> : <Target size={14} className="shrink-0" />}
            <span className="truncate">{isBusiness ? 'Modo Profissional' : 'Modo Pessoal'}</span>
          </div>
        </div>
      )}

      {/* ── NAVIGATION (scrollable middle) ── */}
      <nav className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 space-y-1">
        {isExpanded && (
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 px-3">Menu Principal</p>
        )}
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => { if (isMobile) onCloseMobile(); }}
            title={!isExpanded ? item.name : undefined}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-2xl font-bold transition-all group
              ${collapsed && !isMobile ? 'justify-center p-3' : 'px-4 py-2.5'}
              ${isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            {isExpanded && <span className="text-sm truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── FOOTER (pinned to bottom, no gap) ── */}
      <div className={`shrink-0 border-t border-white/5 p-3 space-y-1.5 ${collapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
        {isPersonal && (
          <button 
            onClick={() => {
              onNewTransaction();
              if (isMobile) onCloseMobile();
            }}
            title={!isExpanded ? 'Nova Transação' : undefined}
            className={`flex items-center justify-center gap-2 bg-white text-secondary font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-lg ${
              collapsed && !isMobile ? 'w-11 h-11 p-0' : 'w-full py-3'
            }`}
          >
            <Plus size={20} className="shrink-0" />
            {isExpanded && <span className="text-sm">Nova Transação</span>}
          </button>
        )}

        <NavLink
          to="/configuracoes"
          onClick={() => { if (isMobile) onCloseMobile(); }}
          title={!isExpanded ? 'Configurações' : undefined}
          className={({ isActive }) => `
            flex items-center gap-3 rounded-2xl text-sm font-bold transition-all
            ${collapsed && !isMobile ? 'justify-center p-2.5' : 'px-4 py-2.5'}
            ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
          `}
        >
          <Settings size={20} className="shrink-0" />
          {isExpanded && <span>Configurações</span>}
        </NavLink>

        <button 
          onClick={() => signOut()}
          title={!isExpanded ? 'Sair' : undefined}
          className={`flex items-center gap-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-negative hover:bg-negative/5 transition-all ${
            collapsed && !isMobile ? 'justify-center p-2.5' : 'w-full px-4 py-2.5'
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {isExpanded && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
