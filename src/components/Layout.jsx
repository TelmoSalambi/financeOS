import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TransactionModal from './TransactionModal';
import CommandPalette from './CommandPalette';

const Layout = ({ children, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-background font-inter selection:bg-primary/30">
      <Sidebar onNewTransaction={openNew} />
      
      <main className="flex-1 ml-64 transition-all duration-300">
        <Topbar title={title} onSearchClick={() => setIsPaletteOpen(true)} />
        
        <div className="p-8 mt-16 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <TransactionModal 
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
