import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Search, Filter, Briefcase, ShoppingBag, Utensils, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Historico = () => {
  const { transactions, loading } = useFinancialStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, income, expense
  const navigate = useNavigate();

  const filteredTransactions = (transactions || []).filter(t => {
    const matchesSearch = (t.description || t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const ActivityItem = ({ icon: Icon, title, date, category, amount, isNegative }) => {
    const IconComp = typeof Icon === 'string' ? Utensils : Icon;
    return (
      <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isNegative ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary shadow-sm'}`}>
            <IconComp size={24} />
          </div>
          <div>
            <p className="font-bold text-secondary leading-tight">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{date}</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{category}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-base font-bold ${isNegative ? 'text-negative' : 'text-primary'}`}>
            {amount} <span className="text-[10px] font-normal opacity-70 ml-0.5">Kz</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Histórico Completo">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary flex items-center gap-3">
              <History className="text-primary" size={32} />
              Histórico de Transações
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Veja todas as suas movimentações financeiras num só lugar.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por descrição ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm shrink-0">
            <button 
              onClick={() => setTypeFilter('all')}
              className={`px-6 py-3 text-sm font-bold rounded-xl transition-all ${typeFilter === 'all' ? 'bg-slate-100 text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setTypeFilter('income')}
              className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${typeFilter === 'income' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary'}`}
            >
              <ArrowUpCircle size={16} /> Receitas
            </button>
            <button 
              onClick={() => setTypeFilter('expense')}
              className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${typeFilter === 'expense' ? 'bg-negative/10 text-negative' : 'text-slate-400 hover:text-negative'}`}
            >
              <ArrowDownCircle size={16} /> Despesas
            </button>
          </div>
        </div>

        <div className="bento-card p-0 overflow-hidden shadow-xl shadow-slate-200/40">
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="font-semibold">A carregar histórico...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Filter size={32} />
                </div>
                <p className="font-semibold text-slate-400">Nenhuma transação encontrada com estes filtros.</p>
              </div>
            ) : (
              filteredTransactions.map(t => (
                <ActivityItem 
                  key={t.id}
                  icon={t.type === 'income' ? Briefcase : (t.categories?.icon || ShoppingBag)} 
                  title={t.description || t.categories?.name} 
                  date={format(parseISO(t.date), "dd 'de' MMMM, yyyy", { locale: ptBR })} 
                  category={t.categories?.name} 
                  amount={`${t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString('pt-BR')}`} 
                  isNegative={t.type === 'expense'} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Historico;
