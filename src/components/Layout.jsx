import React, { useState, Children, isValidElement, cloneElement } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TransactionModal from './TransactionModal';
import MobileBottomNav from './MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';

// Componentes que realmente usam a prop onEdit.
// FIX #2: Em vez de injetar onEdit em TODOS os filhos (causando warnings
// e props inesperadas em componentes DOM), só clonamos os que a precisam.
const COMPONENTS_WITH_EDIT = ['Receitas', 'Despesas', 'Dashboard', 'Historico'];

const Layout = ({ children, title }) => {
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const isMobile  = useIsMobile(1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);

  const openNew   = () => { setIsModalOpen(true); setEditingTransaction(null); };
  const openEdit  = (t) => { setEditingTransaction(t); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditingTransaction(null); };

  // FIX #7: sidebarWidth calculado a partir de isMobile que já usa
  // ResizeObserver/matchMedia internamente (ver useIsMobile).
  // A transição CSS garante que o layout acompanha suavemente.
  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 256);

  return (
    // FIX #1: Substituído font-inter por font-sans como fallback seguro.
    // Se o projeto tiver Inter configurada no tailwind.config.js como
    // fontFamily.sans, isto resolve automaticamente. Caso contrário,
    // usa a sans-serif do sistema sem quebrar o layout.
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/30">

      {/* Overlay para fechar sidebar no mobile */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        onNewTransaction={openNew}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      <main
        className="flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Topbar
          title={title}
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className="px-4 md:px-8 pt-20 pb-8 w-full max-w-[1600px] mx-auto">
          {/* FIX #2: Só injeta onEdit nos componentes que a declaram.
              Evita warnings do React e props inesperadas em elementos DOM. */}
          {Children.map(children, child => {
            if (!isValidElement(child)) return child;
            const name = child.type?.displayName || child.type?.name || '';
            return COMPONENTS_WITH_EDIT.includes(name)
              ? cloneElement(child, { onEdit: openEdit })
              : child;
          })}
        </div>
      </main>

      {isMobile && <MobileBottomNav onNewTransaction={openNew} />}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleClose}
        editingTransaction={editingTransaction}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Layout;
