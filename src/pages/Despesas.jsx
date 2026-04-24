import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownCircle, Search, Trash2, Calendar, Edit3, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const Despesas = ({ onEdit }) => {
  const { transactions, totalExpense, loading, refetch } = useFinancialStats();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  const despesas = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.categories?.name?.toLowerCase().includes(search.toLowerCase());
        const matchMonth = monthFilter ? t.date.startsWith(monthFilter) : true;
        return (search ? matchSearch : true) && matchMonth;
      });
  }, [transactions, search, monthFilter]);

  const handleDelete = async (id) => {
    toast.promise(async () => {
      setDeleting(id);
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      setDeleting(null);
    }, {
      loading: 'Eliminando despesa...',
      success: 'Despesa eliminada com sucesso!',
      error: (err) => `Erro ao eliminar: ${err.message}`
    });
  };

  return (
    <Layout title="Despesas">
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Despesas</h1>
            <p className="text-slate-500 mt-1">Controle total sobre os seus gastos e saídas.</p>
          </div>
          <div className="bg-negative/5 border border-negative/10 px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-negative/10 text-negative rounded-xl flex items-center justify-center">
              <ArrowDownCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Total Despendido</p>
              <p className="text-2xl font-bold text-secondary">{totalExpense.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">Kz</span></p>
            </div>
          </div>
        </div>

        <div className="bento-card mb-6 flex flex-col lg:flex-row gap-4 p-4">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-negative/60 transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar descrição ou categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-negative/20 focus:ring-4 focus:ring-negative/5 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="month"
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-negative/20 focus:ring-4 focus:ring-negative/5 transition-all"
              />
            </div>
            {(search || monthFilter) && (
              <button
                onClick={() => { setSearch(''); setMonthFilter(''); }}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-secondary bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="bento-card !p-0 overflow-hidden border-none shadow-xl shadow-slate-200/40">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-12 gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-2">Data</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-5">Descrição</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-2">Categoria</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-2 text-right">Valor</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Ações</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : despesas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ArrowDownCircle size={40} strokeWidth={1} />
              </div>
              <div className="text-center">
                <p className="font-bold text-secondary">Nenhuma despesa encontrada</p>
                <p className="text-sm">Aumente os filtros ou registe um novo gasto.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {despesas.map(t => (
                <div key={t.id} className="px-8 py-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/80 transition-colors group">
                  <span className="text-sm font-medium text-slate-500 col-span-2">
                    {format(parseISO(t.date), "dd MMM, yyyy", { locale: ptBR })}
                  </span>
                  <span className="text-sm font-bold text-secondary col-span-5 truncate">
                    {t.description || '—'}
                  </span>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                      {t.categories?.name || 'Diversos'}
                    </span>
                  </div>
                  <span className="text-base font-bold text-negative col-span-2 text-right">
                    -{Number(t.amount).toLocaleString('pt-BR')} <span className="text-[10px] font-normal">Kz</span>
                  </span>
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="p-2 text-slate-400 hover:text-negative hover:bg-negative/5 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      {deleting === t.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {despesas.length > 0 && (
            <div className="px-8 py-6 bg-slate-50/30 flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-400">Total de {despesas.length} registos</p>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Filtrado</p>
                <p className="text-xl font-bold text-negative">
                  -{despesas.reduce((s, t) => s + Number(t.amount), 0).toLocaleString('pt-BR')} Kz
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Despesas;
