import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Search, Filter, Briefcase, ShoppingBag, Utensils, ArrowUpCircle, ArrowDownCircle, Edit3, ChevronDown } from 'lucide-react';

const ActivityItem = ({ icon: Icon, title, date, category, amount, isNegative, onEdit }) => {
  const IconComp = typeof Icon === 'string' ? Utensils : Icon;
  return (
    <div className="px-4 md:px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all duration-300 border-l-4 border-transparent hover:border-primary group cursor-pointer" onClick={onEdit}>
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isNegative ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary shadow-sm'}`}>
          <IconComp size={20} className="md:w-6 md:h-6" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-secondary leading-tight truncate">{title}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">{date}</span>
            <div className="hidden xs:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <span className="text-[9px] md:text-[10px] text-primary font-bold uppercase tracking-widest truncate">{category}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right shrink-0 pl-3">
          <p className={`text-sm md:text-base font-bold ${isNegative ? 'text-negative' : 'text-primary'}`}>
            {amount} <span className="text-[9px] md:text-[10px] font-normal opacity-70 ml-0.5">Kz</span>
          </p>
        </div>
        <button className="hidden md:flex p-2 text-slate-300 hover:text-primary transition-colors">
          <Edit3 size={16} />
        </button>
      </div>
    </div>
  );
};

const Historico = ({ onEdit }) => {
  const { transactions, loading } = useFinancialStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // FIX #27: Sistema de Paginação para Blindagem de Performance
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredTransactions = useMemo(() => {
    return (transactions || [])
      .filter(t => {
        const matchesSearch = (t.description || t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // FIX #28: Garantir ordenação por data
  }, [transactions, searchTerm, typeFilter]);

  const displayedTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = filteredTransactions.length > visibleCount;

  return (
    <Layout title="Histórico Completo">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary flex items-center gap-3">
              <History className="text-primary" size={28} />
              Histórico
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Veja todas as suas movimentações financeiras.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por descrição ou categoria..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(20); }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm overflow-x-auto no-scrollbar">
            <button 
              onClick={() => { setTypeFilter('all'); setVisibleCount(20); }}
              className={`px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${typeFilter === 'all' ? 'bg-slate-100 text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => { setTypeFilter('income'); setVisibleCount(20); }}
              className={`px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${typeFilter === 'income' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary'}`}
            >
              <ArrowUpCircle size={14} /> Receitas
            </button>
            <button 
              onClick={() => { setTypeFilter('expense'); setVisibleCount(20); }}
              className={`px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${typeFilter === 'expense' ? 'bg-negative/10 text-negative' : 'text-slate-400 hover:text-negative'}`}
            >
              <ArrowDownCircle size={14} /> Despesas
            </button>
          </div>
        </div>

        <div className="bento-card p-0 overflow-hidden shadow-xl shadow-slate-200/40">
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 md:p-16 text-center text-slate-400 flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-primary opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">A carregar registos...</p>
              </div>
            ) : displayedTransactions.length === 0 ? (
              <div className="p-12 md:p-16 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Filter size={24} />
                </div>
                <p className="font-semibold text-sm text-slate-400">Nenhuma transação encontrada.</p>
              </div>
            ) : (
              <>
                {displayedTransactions.map(t => (
                  <ActivityItem 
                    key={t.id}
                    onEdit={() => onEdit?.(t)}
                    icon={t.type === 'income' ? Briefcase : (t.categories?.icon || ShoppingBag)} 
                    title={t.description || t.categories?.name} 
                    date={format(parseISO(t.date), "dd 'de' MMM, yyyy", { locale: ptBR })} 
                    category={t.categories?.name} 
                    amount={`${t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString('pt-BR')}`} 
                    isNegative={t.type === 'expense'} 
                  />
                ))}
                
                {hasMore && (
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    className="w-full py-6 flex items-center justify-center gap-2 text-primary font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    <ChevronDown size={18} />
                    Carregar mais transações
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {filteredTransactions.length > 0 && !loading && (
          <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Exibindo {displayedTransactions.length} de {filteredTransactions.length} registos
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Historico;
