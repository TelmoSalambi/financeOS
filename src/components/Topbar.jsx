import { Search, Bell, History, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Topbar = ({ title = 'Visão Geral', onSearchClick, isMobile, onMenuClick, sidebarWidth }) => {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || 'Usuário';

  return (
    <header 
      className="fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-4 md:px-6 lg:px-8 z-30 transition-all duration-300 ease-in-out"
      style={{ left: isMobile ? 0 : `${sidebarWidth}px` }}
    >
      <div className="flex items-center gap-2 md:gap-5 flex-1 min-w-0 pr-2">
        {/* Hamburger — ONLY on mobile */}
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-1 text-slate-500 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all shrink-0"
            aria-label="Abrir Menu"
          >
            <Menu size={22} />
          </button>
        )}

        <h2 className="text-[10px] sm:text-sm font-bold text-secondary uppercase tracking-widest truncate shrink min-w-0">{title}</h2>
        
        {/* Desktop search bar */}
        <button 
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-slate-100/50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-500 transition-all border border-transparent hover:border-slate-200 group"
        >
          <Search size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">Pesquisar...</span>
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-bold text-slate-400">
            <span className="text-[8px]">Ctrl</span> K
          </kbd>
        </button>

        {/* Mobile search — icon only */}
        <button 
          onClick={onSearchClick}
          className="sm:hidden p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <button className="hidden md:flex p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all relative">
          <History size={20} />
        </button>
        <button className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all relative">
          <Bell size={18} className="sm:w-5 sm:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-negative rounded-full border-2 border-white"></span>
        </button>
        
        <div className="hidden sm:block h-6 w-px bg-slate-100 mx-1"></div>

        <div className="flex items-center gap-2 sm:gap-3 pl-1 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-secondary group-hover:text-primary transition-colors truncate max-w-[140px]">{fullName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Conta Verificada</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shadow-sm group-hover:border-primary/30 transition-all shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
