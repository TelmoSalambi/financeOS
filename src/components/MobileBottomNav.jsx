import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowUpCircle, ArrowDownCircle,
  Plus, Users, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// FIX #6: Substituído pb-safe (classe inválida no Tailwind padrão)
// por style inline com env(safe-area-inset-bottom).
// Isto respeita o safe area do iPhone (home indicator / notch)
// sem depender de plugins externos.
//
// FIX #4: Modo business agora tem 3 itens simétricos em vez de 1,
// evitando o layout assimétrico e o espaço vazio do FAB.
// O botão FAB (+ flutuante) só aparece no modo pessoal onde faz sentido.

const MobileBottomNav = ({ onNewTransaction }) => {
  const { isBusiness } = useAuth();

  const linkClass = ({ isActive }) =>
    `p-2 flex flex-col items-center gap-1 transition-colors ${
      isActive ? 'text-primary' : 'text-slate-400'
    }`;

  const labelClass = "text-[9px] font-bold";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-40"
      // FIX #6: safe area via CSS nativo — funciona em todos os dispositivos
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {isBusiness ? (
        // FIX #4: 3 itens equilibrados para o modo profissional
        <>
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard size={20} />
            <span className={labelClass}>Painel</span>
          </NavLink>

          <NavLink to="/clientes" className={linkClass}>
            <Users size={20} />
            <span className={labelClass}>Clientes</span>
          </NavLink>

          <NavLink to="/relatorios" className={linkClass}>
            <BarChart3 size={20} />
            <span className={labelClass}>Relatórios</span>
          </NavLink>
        </>
      ) : (
        // Modo pessoal: Receitas | FAB central | Despesas
        <>
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard size={20} />
            <span className={labelClass}>Painel</span>
          </NavLink>

          <NavLink to="/receitas" className={linkClass}>
            <ArrowUpCircle size={20} />
            <span className={labelClass}>Ganhos</span>
          </NavLink>

          {/* FAB — Botão Flutuante Central */}
          <button
            onClick={onNewTransaction}
            className="w-12 h-12 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center -translate-y-4 border-4 border-white active:scale-90 transition-transform"
            aria-label="Nova transação"
          >
            <Plus size={24} strokeWidth={3} />
          </button>

          <NavLink to="/despesas" className={linkClass}>
            <ArrowDownCircle size={20} />
            <span className={labelClass}>Gastos</span>
          </NavLink>

          <NavLink to="/simuladores" className={linkClass}>
            <BarChart3 size={20} />
            <span className={labelClass}>Simular</span>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default MobileBottomNav;
