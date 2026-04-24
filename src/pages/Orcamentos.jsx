import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Plus, Loader2, AlertTriangle, Save, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Orcamentos = () => {
  const { user } = useAuth();
  const { transactions } = useFinancialStats();
  const { categories } = useCategories('expense');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchBudgets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase.from('budgets').select('*').eq('user_id', user.id);
    setBudgets(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBudgets();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBudgets]);

  // Calculate consumption for each budget
  const budgetStatus = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.category_id);
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category_id === budget.category_id && t.date.startsWith(currentMonth))
        .reduce((s, t) => s + Number(t.amount), 0);
      
      const percent = (spent / budget.amount) * 100;
      
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
    if (!confirm('Eliminar este orçamento?')) return;
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) {
      toast.success('Orçamento eliminado');
      fetchBudgets();
    }
  };

  return (
    <Layout title="Orçamentos">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary">Orçamentos</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Defina limites para as suas categorias de gasto.</p>
          </div>
          <button 
            onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] md:hover:scale-105 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus size={20} />
            Definir Orçamento
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : budgetStatus.length === 0 ? (
          <div className="px-4">
            <div className="bento-card py-20 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <PieChart size={40} />
              </div>
              <div>
                <p className="font-bold text-secondary text-lg">Ainda não definiu orçamentos</p>
                <p className="text-sm text-slate-400">Crie limites mensais para controlar melhor os seus gastos.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
            {budgetStatus.map(b => (
              <div key={b.id} className={`bento-card group hover:border-primary/30 transition-all ${b.isDanger ? 'border-negative/30 bg-negative/5' : ''} p-6 md:p-8`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-secondary truncate">{b.categoryName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{b.month}</p>
                  </div>
                  <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingBudget(b); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-negative hover:bg-white rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xl md:text-2xl font-bold text-secondary truncate">{b.spent.toLocaleString('pt-BR')} <span className="text-xs md:text-sm font-normal text-slate-400">Kz</span></p>
                    <p className="text-[10px] md:text-sm font-bold text-slate-500 shrink-0 ml-2">alvo: {b.amount.toLocaleString('pt-BR')} Kz</p>
                  </div>

                  <div className="h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        b.isDanger ? 'bg-negative' : b.isWarning ? 'bg-amber-400' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(b.percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${b.isDanger ? 'text-negative' : b.isWarning ? 'text-amber-500' : 'text-primary'}`}>
                      {b.percent.toFixed(0)}% Utilizado
                    </span>
                    {b.isDanger && <AlertTriangle size={14} className="text-negative animate-pulse" />}
                  </div>
                </div>
              </div>
            ))}
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
    setLoading(true);
    
    const payload = { ...form, user_id: userId, amount: parseFloat(form.amount) };
    
    let error;
    if (editing) {
      ({ error } = await supabase.from('budgets').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('budgets').insert([payload]));
    }

    if (error) {
      if (error.code === '23505') toast.error('Já existe um orçamento para esta categoria este mês.');
      else toast.error('Erro: ' + error.message);
    } else {
      toast.success('Orçamento guardado!');
      onSave();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-secondary mb-6">{editing ? 'Editar Orçamento' : 'Definir Orçamento'}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 px-1">Categoria</label>
            <select 
              required value={form.category_id}
              onChange={e => setForm({...form, category_id: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Escolher...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 px-1">Limite Mensal (Kz)</label>
            <input 
              type="number" required value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              placeholder="0,00"
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 px-1">Mês de Referência</label>
            <input 
              type="month" required value={form.month}
              onChange={e => setForm({...form, month: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-[2] py-3 text-sm font-bold text-white bg-primary rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Orcamentos;
