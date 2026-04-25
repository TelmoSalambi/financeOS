import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3,
  ArrowUpCircle, ArrowDownCircle, Calculator,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onNewTransaction, isMobile, mobileOpen, collapsed, onCloseMobile, onToggleCollapse }) => {
  // FIX #3: Extrair signOut do contexto e chamar de forma defensiva.
  // Antes: () => signOut() sem verificar se a função existe.
  // Se o AuthContext não estiver disponível ou a função for undefined,
  // o clique causava um crash silencioso. Agora usamos signOut?.() como
  // salvaguarda, e desativamos o botão se signOut não estiver disponível.
  const { signOut, isBusiness } = useAuth();

  const businessMenu = [
    { name: 'Painel Geral',          icon: LayoutDashboard, path: '/' },
    { name: 'Meus Clientes',         icon: Users,           path: '/clientes' },
    { name: 'Relatórios Agregados',  icon: BarChart3,       path: '/relatorios' },
  ];

  const personalMenu = [
    { name: 'Dashboard',   icon: LayoutDashboard,  path: '/' },
    { name: 'Receitas',    icon: ArrowUpCircle,     path: '/receitas' },
    { name: 'Despesas',    icon: ArrowDownCircle,   path: '/despesas' },
    { name: 'Simuladores', icon: Calculator,        path: '/simuladores' },
    { name: 'Relatórios',  icon: BarChart3,         path: '/relatorios' },
  ];

  const menuItems = isBusiness ? businessMenu : personalMenu;
  const isExpanded = !collapsed || isMobile;

  const sidebarClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-secondary flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `fixed inset-y-0 left-0 z-50 bg-secondary flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`;

  return (
    <aside className={sidebarClass}>

      {/* Logo + Toggle */}
      <div className="p-4 flex items-center gap-3 min-h-[64px]">
        {isExpanded && (
          <>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10 shrink-0 p-1.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter">
              Finance<span className="text-primary">OS</span>
            </h1>
          </>
        )}
        {collapsed && !isMobile && (
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10 mx-auto p-1.5">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white"
            aria-label="Fechar menu"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={isMobile ? onCloseMobile : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-2xl font-bold transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {isExpanded && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => signOut?.()}
          disabled={!signOut}
          className="flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:text-negative hover:bg-negative/10 transition-colors w-full disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Sair da conta"
        >
          <LogOut size={20} className="shrink-0" />
          {isExpanded && <span className="font-bold">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
