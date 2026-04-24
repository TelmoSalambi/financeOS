import React, { useState, useEffect, useCallback, Children, isValidElement, cloneElement } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TransactionModal from './TransactionModal';
import CommandPalette from './CommandPalette';

const MOBILE_BREAKPOINT = 1024;

const Layout = ({ children, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Track screen size
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  // Mobile: controls drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop: controls expanded (full) vs collapsed (icons only)
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Close mobile drawer when resizing to desktop
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Desktop: toggle collapsed/expanded
  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  // Mobile: toggle drawer
  const toggleMobileDrawer = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Calculate main content margin for desktop
  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 256); // 72px = w-[72px], 256px = w-64

  return (
    <div className="flex min-h-screen bg-background font-inter selection:bg-primary/30">
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileDrawer}
        />
      )}

      <Sidebar
        onNewTransaction={openNew}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCloseMobile={closeMobileDrawer}
        onToggleCollapse={toggleCollapse}
      />

      <main
        className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Topbar
          title={title}
          onSearchClick={() => setIsPaletteOpen(true)}
          isMobile={isMobile}
          onMenuClick={toggleMobileDrawer}
          sidebarWidth={sidebarWidth}
        />

        <div className="px-4 md:px-6 lg:px-8 pt-20 pb-8 w-full max-w-[1600px] mx-auto">
          {Children.map(children, child => {
            if (isValidElement(child)) {
              return cloneElement(child, { onEdit: openEdit });
            }
            return child;
          })}
        </div>
      </main>

      <TransactionModal
        key={editingTransaction?.id || (isModalOpen ? 'open' : 'closed')}
        isOpen={isModalOpen}
        onClose={handleClose}
        editingTransaction={editingTransaction}
      />

      <CommandPalette
        open={isPaletteOpen}
        setOpen={setIsPaletteOpen}
        onNewTransaction={openNew}
      />
    </div>
  );
};

export default Layout;
