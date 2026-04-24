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
  Calculator
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onNewTransaction }) => {
  const { signOut, profile, isBusiness, isPersonal } = useAuth();

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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-secondary text-white flex flex-col p-6 z-40 transition-all duration-300">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
          <TrendingUp size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">FinanceOS</h1>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">Professional Edition</p>
        </div>
      </div>

      {/* Account Type Badge */}
      <div className="mb-8 px-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isBusiness ? 'border-amber-500/20 bg-amber-500/5 text-amber-400' : 'border-primary/20 bg-primary/5 text-primary'}`}>
          {isBusiness ? <Briefcase size={14} /> : <Target size={14} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isBusiness ? 'Modo Profissional' : 'Modo Pessoal'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-3">Menu Principal</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group
              ${isActive 
                ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Actions / Bottom */}
      <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
        {isPersonal && (
          <button 
            onClick={onNewTransaction}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-secondary font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-black/10"
          >
            <Plus size={20} />
            Nova Transação
          </button>
        )}

        <NavLink
          to="/configuracoes"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all
            ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
          `}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </NavLink>

        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-negative hover:bg-negative/5 transition-all"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
