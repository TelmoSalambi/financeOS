import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  Target,
  PieChart,
  Upload,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CommandPalette = ({ open, setOpen, onNewTransaction }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  const filteredItems = useMemo(() => {
    const items = [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/', group: 'Navegação' },
      { id: 'receitas', name: 'Receitas', icon: ArrowUpCircle, path: '/receitas', group: 'Navegação' },
      { id: 'despesas', name: 'Despesas', icon: ArrowDownCircle, path: '/despesas', group: 'Navegação' },
      { id: 'relatorios', name: 'Relatórios', icon: BarChart3, path: '/relatorios', group: 'Navegação' },
      { id: 'nova', name: 'Nova Transação', icon: Plus, action: onNewTransaction, group: 'Ações' },
      { id: 'sair', name: 'Sair do Sistema', icon: LogOut, action: signOut, group: 'Ações' },
    ];

    if (!search) return items;
    return items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, onNewTransaction, signOut]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-secondary/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center px-6 py-5 border-b border-slate-100">
          <Search className="mr-4 h-6 w-6 text-slate-300" />
          <input 
            placeholder="O que procura hoje?" 
            className="flex-1 bg-transparent border-none outline-none text-lg text-secondary placeholder:text-slate-300 font-medium"
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Search className="mx-auto mb-4 opacity-20" size={48} />
              <p className="font-bold">Nenhum resultado encontrado.</p>
            </div>
          )}

          <div className="space-y-4">
            {['Navegação', 'Ações'].map(group => {
              const groupItems = filteredItems.filter(i => i.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} className="space-y-1">
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{group}</p>
                  {groupItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.path) navigate(item.path);
                        if (item.action) item.action();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-primary/10 hover:text-primary transition-all group text-left"
                    >
                      <item.icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                      <span className="font-bold text-sm">{item.name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-widest flex justify-between">
          <span>Dica: Use ⌘K para abrir rapidamente</span>
          <span>ESC para fechar</span>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)}></div>
    </div>
  );
};

export default CommandPalette;
