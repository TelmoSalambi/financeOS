import React from 'react';
import { Search, Bell, History, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Topbar = ({ title = 'Visão Geral', onSearchClick }) => {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || 'Usuário';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-8 z-30 transition-all">
      <div className="flex items-center gap-6">
        <h2 className="text-sm font-bold text-secondary uppercase tracking-widest">{title}</h2>
        
        <button 
          onClick={onSearchClick}
          className="flex items-center gap-3 px-4 py-1.5 bg-slate-100/50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-500 transition-all border border-transparent hover:border-slate-200 group"
        >
          <Search size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">Pesquisar...</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-bold text-slate-400 opacity-100">
            <span className="text-[8px]">Ctrl</span> K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all relative">
            <History size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-negative rounded-full border-2 border-white"></span>
          </button>
        </div>
        
        <div className="h-6 w-[1px] bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">{fullName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Conta Verificada</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shadow-sm group-hover:border-primary/30 transition-all">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={24} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
