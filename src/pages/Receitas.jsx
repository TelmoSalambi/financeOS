import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, Search, TrendingUp, Calendar, Edit3, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const Receitas = ({ onEdit }) => {
  const { transactions, totalIncome, loading, refetch } = useFinancialStats();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  // FIX #3: Estado para confirmação inline — substitui window.confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const receitas = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .filter(t => {
        const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.categories?.name?.toLowerCase().includes(search.toLowerCase());
        const matchMonth = monthFilter ? t.date.startsWith(monthFilter) : true;
        return (search ? matchSearch : true) && matchMonth;
      });
  }, [transactions, search, monthFilter]);

  // FIX #3: Eliminação sem window.confirm — usa confirmação inline.
  // FIX #7: try/finally garante que setDeleting(null) corre sempre,
  //         mesmo em caso de erro — evita loading infinito no botão.
  const handleDelete = async (id) => {
    toast.promise(async () => {
      setDeleting(id);
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await refetch();
      } finally {
        setDeleting(null);
        setConfirmDeleteId(null);
      }
    }, {
      loading: 'Eliminando receita...',
      success: 'Receita eliminada com sucesso!',
      error: (err) => `Erro ao eliminar: ${err.message}`
    });
  };

  return (
    <Layout title="Receitas">
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Receitas</h1>
            <p className="text-slate-500 mt-1">Gestão detalhada de todos os seus ganhos.</p>
          </div>
          <div className="bg-primary/5 border border-primary/10 px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Total Acumulado</p>
              <p className="text-2xl font-bold text-secondary">{totalIncome.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">Kz</span></p>
            </div>
          </div>
        </div>

        <div className="bento-card mb-8 flex flex-col md:flex-row gap-4 p-4 md:p-6">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar descrição ou categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="month"
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
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
          {/* Header - Hidden on Mobile */}
          <div className="hidden md:block px-8 py-5 border-b border-slate-100 bg-slate-50/50">
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
          ) : receitas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ArrowUpCircle size={40} strokeWidth={1} />
              </div>
              <div className="text-center">
                <p className="font-bold text-secondary">Nenhuma receita encontrada</p>
                <p className="text-sm">Ajuste os filtros ou adicione um novo registo.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {receitas.map(t => (
                <div key={t.id} className="px-4 md:px-8 py-5 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center hover:bg-slate-50/80 transition-colors group relative">
                  {/* Mobile Date & Category */}
                  <div className="flex md:hidden items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {format(parseISO(t.date), "dd MMM, yyyy", { locale: ptBR })}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary uppercase">
                      {t.categories?.name || 'Geral'}
                    </span>
                  </div>

                  {/* Desktop Date */}
                  <span className="hidden md:block text-sm font-medium text-slate-500 col-span-2">
                    {format(parseISO(t.date), "dd MMM, yyyy", { locale: ptBR })}
                  </span>

                  {/* Description */}
                  <span className="text-sm font-bold text-secondary md:col-span-5 truncate w-full md:w-auto">
                    {t.description || '—'}
                  </span>

                  {/* Desktop Category */}
                  <div className="hidden md:block md:col-span-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                      {t.categories?.name || 'Geral'}
                    </span>
                  </div>

                  {/* Value */}
                  <span className="text-lg md:text-base font-bold text-primary md:col-span-2 md:text-right w-full md:w-auto flex justify-between md:block">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">Valor</span>
                    <span>+{Number(t.amount).toLocaleString('pt-BR')} <span className="text-[10px] font-normal">Kz</span></span>
                  </span>

                  {/* Actions — FIX #3: Confirmação inline */}
                  <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity w-full md:w-auto md:justify-center border-t md:border-none pt-3 md:pt-0 mt-2 md:mt-0">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-2.5 md:p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all bg-slate-50 md:bg-transparent"
                      title="Editar"
                    >
                      <Edit3 size={18} className="md:w-4 md:h-4" />
                    </button>

                    {confirmDeleteId === t.id ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deleting === t.id}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-negative rounded-lg hover:bg-negative/90 transition-colors disabled:opacity-50"
                        >
                          {deleting === t.id ? <Loader2 size={12} className="animate-spin" /> : 'Sim'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="p-2.5 md:p-2 text-slate-400 hover:text-negative hover:bg-negative/5 rounded-xl transition-all bg-slate-50 md:bg-transparent"
                        title="Eliminar"
                      >
                        <Trash2 size={18} className="md:w-4 md:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {receitas.length > 0 && (
            <div className="px-4 md:px-8 py-6 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs font-semibold text-slate-400 order-2 md:order-1">Total de {receitas.length} registos</p>
              <div className="text-center md:text-right order-1 md:order-2 w-full md:w-auto">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Filtrado</p>
                <p className="text-2xl md:text-xl font-bold text-primary">
                  +{receitas.reduce((s, t) => s + Number(t.amount), 0).toLocaleString('pt-BR')} Kz
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Receitas;
