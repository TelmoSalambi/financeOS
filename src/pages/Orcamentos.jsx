import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Plus, Loader2, AlertTriangle, Save, Edit3, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const Orcamentos = () => {
  const { user } = useAuth();
  const { transactions } = useFinancialStats();
  const { categories } = useCategories('expense');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  // FIX #40: Estado para confirmação inline
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchBudgets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('budgets').select('*').eq('user_id', user.id);
      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      toast.error('Erro ao carregar orçamentos.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // FIX #41: Otimização O(N) — Agrupar gastos por categoria uma única vez
  const budgetStatus = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    
    // Passo 1: Pré-calcular gastos totais por categoria (O(T))
    const expensesByCategory = {};
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        const catId = t.category_id;
        expensesByCategory[catId] = (expensesByCategory[catId] || 0) + Number(t.amount);
      }
    });

    // Passo 2: Mapear orçamentos com lookup O(1) nos gastos (O(B))
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.category_id);
      const spent = expensesByCategory[budget.category_id] || 0;
      
      // FIX #39: Divisão segura
      const target = Number(budget.amount) || 1;
      const percent = (spent / target) * 100;
      
      return {
        ...budget,
        categoryName: category?.name || 'Categoria Desconhecida',
        spent,
        percent,
        isWarning: percent >= 80 && percent < 100,
        isDanger: percent >= 100
      };
    });
  }, [budgets, categories, transactions]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Orçamento eliminado');
      setBudgets(prev => prev.filter(b => b.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error('Erro ao eliminar orçamento.');
    }
  };

  return (
    <Layout title="Controlo de Orçamentos">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6 px-4 md:px-0">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Orçamentos</h1>
            <p className="text-slate-500 mt-1 font-medium">Controle os seus limites de gastos mensais.</p>
          </div>
          <button 
            onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus size={22} />
            Definir Novo Limite
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-primary opacity-20" size={48} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculando limites...</p>
          </div>
        ) : budgetStatus.length === 0 ? (
          <div className="px-4">
            <div className="bento-card py-24 flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                <PieChart size={56} strokeWidth={1} />
              </div>
              <div className="max-w-md">
                <p className="font-black text-secondary text-xl">Nenhum orçamento definido</p>
                <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                  Crie limites mensais por categoria para garantir que o seu dinheiro é gasto com inteligência.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
            {budgetStatus.map(b => {
              const isDeleting = confirmDeleteId === b.id;
              
              return (
                <div key={b.id} className={`bento-card group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col h-full ${b.isDanger ? 'ring-2 ring-negative/20 bg-negative/5' : ''}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-black text-secondary text-lg truncate">{b.categoryName}</h3>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{b.month}</p>
                    </div>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => { setEditingBudget(b); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-primary hover:bg-white rounded-xl transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => setConfirmDeleteId(b.id)} className="p-2 text-slate-300 hover:text-negative hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <p className="text-2xl font-black text-secondary tracking-tighter truncate">
                          {b.spent.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">Kz</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 ml-2 mb-1">
                          alvo: {Number(b.amount).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 shadow-md ${
                            b.isDanger ? 'bg-negative' : b.isWarning ? 'bg-amber-400' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(b.percent, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-slate-50">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${b.isDanger ? 'text-negative' : b.isWarning ? 'text-amber-500' : 'text-primary'}`}>
                          {Math.floor(b.percent)}% Utilizado
                        </span>
                        {b.isDanger && <AlertTriangle size={16} className="text-negative animate-pulse" />}
                      </div>
                    </div>
                  </div>

                  {/* Overlay de Confirmação Inline */}
                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 z-10">
                      <h4 className="font-black text-secondary mb-4">Eliminar Orçamento?</h4>
                      <div className="flex gap-2 w-full">
                        <button onClick={() => handleDelete(b.id)} className="flex-1 py-3 bg-negative text-white font-bold rounded-xl text-xs">Sim</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs">Não</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isModalOpen && (
          <BudgetModal 
            onClose={() => setIsModalOpen(false)} 
            categories={categories} 
            onSave={() => { setIsModalOpen(false); fetchBudgets(); }}
            editing={editingBudget}
            userId={user?.id}
          />
        )}
      </div>
    </Layout>
  );
};

const BudgetModal = ({ onClose, categories, onSave, editing, userId }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category_id: editing?.category_id || '',
    amount: editing?.amount || '',
    month: editing?.month || new Date().toISOString().slice(0, 7)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FIX #42: Validação numérica
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('O valor deve ser um número positivo.');
      return;
    }

    setLoading(true);
    const payload = { ...form, user_id: userId, amount };
    
    try {
      let result;
      if (editing) {
        result = await supabase.from('budgets').update(payload).eq('id', editing.id);
      } else {
        result = await supabase.from('budgets').insert([payload]);
      }

      if (result.error) {
        if (result.error.code === '23505') throw new Error('Já existe um orçamento para esta categoria este mês.');
        throw result.error;
      }

      toast.success('Configurações guardadas!');
      onSave();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300 relative">
        <button onClick={onClose} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black text-secondary mb-8 tracking-tight">{editing ? 'Editar Limite' : 'Novo Orçamento'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Categoria de Gasto</label>
            <select 
              required value={form.category_id}
              onChange={e => setForm({...form, category_id: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione uma categoria...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Limite Mensal (Kz)</label>
            <input 
              type="number" step="0.01" required value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              placeholder="0,00"
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-black text-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Mês de Referência</label>
            <input 
              type="month" required value={form.month}
              onChange={e => setForm({...form, month: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Orcamentos;
