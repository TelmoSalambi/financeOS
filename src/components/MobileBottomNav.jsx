import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowUpCircle, Clock, User, Plus } from 'lucide-react';

const tabs = [
  { icon: LayoutDashboard, label: 'Início', path: '/' },
  { icon: ArrowUpCircle, label: 'Carteira', path: '/receitas' },
  // Placeholder slot for the FAB
  { isFab: true },
  { icon: Clock, label: 'Extrato', path: '/historico' },
  { icon: User, label: 'Perfil', path: '/configuracoes' },
];

const MobileBottomNav = ({ onNewTransaction }) => {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab, i) => {
          if (tab.isFab) {
            return (
              <button
                key="fab"
                onClick={onNewTransaction}
                className="mobile-fab"
                aria-label="Nova Transação"
              >
                <Plus size={26} strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}`
              }
            >
              <tab.icon size={22} strokeWidth={1.8} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
