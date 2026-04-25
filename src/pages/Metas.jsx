import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Target, Plus, Loader2, Edit3, Trash2, Calendar, TrendingUp, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Metas = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // FIX #36: Estado para confirmação de eliminação segura
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      toast.error('Erro ao carregar metas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Meta eliminada com sucesso');
      setGoals(prev => prev.filter(g => g.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error('Erro ao eliminar meta.');
    }
  };

  return (
    <Layout title="Metas Financeiras">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Metas</h1>
            <p className="text-slate-500 mt-1 font-medium">Transforme os seus sonhos em objetivos alcançáveis.</p>
          </div>
          <button 
            onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={22} />
            Criar Nova Meta
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-primary opacity-20" size={48} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando objetivos...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bento-card py-24 flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/30">
              <Target size={56} strokeWidth={1} />
            </div>
            <div className="max-w-md px-4">
              <p className="font-black text-secondary text-xl">Dê um nome aos seus sonhos</p>
              <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                Quer comprar uma casa, um carro ou fazer uma viagem? Crie uma meta e acompanhe o seu progresso mensalmente.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => {
              // FIX #35: Cálculo seguro contra divisão por zero
              const target = Number(goal.target_amount) || 1;
              const current = Number(goal.current_amount) || 0;
              const percent = (current / target) * 100;
              const remaining = target - current;
              
              const isDeleting = confirmDeleteId === goal.id;

              return (
                <div key={goal.id} className="bento-card group border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all p-8 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: goal.color }}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ backgroundColor: goal.color }}>
                        <Target size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-secondary text-lg truncate pr-2">{goal.title}</h3>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            <Calendar size={10} />
                            Prazo: {format(parseISO(goal.deadline), "dd MMM yyyy", { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }} 
                        className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(goal.id)} 
                        className="p-2 text-slate-300 hover:text-negative hover:bg-negative/5 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-black text-secondary tracking-tighter">
                            {current.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">Kz</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            De {target.toLocaleString('pt-BR')} Kz
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black" style={{ color: goal.color }}>{Math.floor(percent)}%</span>
                        </div>
                      </div>

                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 shadow-lg"
                          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: goal.color }}
                        />
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Faltam {remaining > 0 ? remaining.toLocaleString('pt-BR') : 0} Kz
                          </span>
                        </div>
                        {percent >= 100 && (
                          <span className="text-[9px] font-black text-white bg-primary px-3 py-1 rounded-full uppercase tracking-widest animate-bounce">Concluída!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FIX #36: Overlay de Confirmação Inline */}
                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200 z-10">
                      <div className="w-12 h-12 bg-negative/10 text-negative rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle size={24} />
                      </div>
                      <h4 className="font-black text-secondary mb-2">Eliminar Meta?</h4>
                      <p className="text-xs text-slate-500 font-medium mb-6">Esta ação não pode ser desfeita.</p>
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => handleDelete(goal.id)}
                          className="flex-1 py-3 bg-negative text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors"
                        >
                          Eliminar
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isModalOpen && (
          <GoalModal 
            onClose={() => setIsModalOpen(false)} 
            onSave={() => { setIsModalOpen(false); fetchGoals(); }}
            editing={editingGoal}
            userId={user?.id}
          />
        )}
      </div>
    </Layout>
  );
};

const GoalModal = ({ onClose, onSave, editing, userId }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: editing?.title || '',
    target_amount: editing?.target_amount || '',
    current_amount: editing?.current_amount || '',
    deadline: editing?.deadline || '',
    color: editing?.color || '#10B981'
  });

  const colors = ['#10B981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#f59e0b', '#0ea5e9'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FIX #37: Validação numérica estrita
    const target = parseFloat(form.target_amount);
    const current = parseFloat(form.current_amount || 0);

    if (isNaN(target) || target <= 0) {
      toast.error('O valor alvo deve ser um número positivo.');
      return;
    }

    setLoading(true);
    
    const payload = { 
      ...form, 
      user_id: userId, 
      target_amount: target,
      current_amount: isNaN(current) ? 0 : current
    };
    
    try {
      let result;
      if (editing) {
        result = await supabase.from('goals').update(payload).eq('id', editing.id);
      } else {
        result = await supabase.from('goals').insert([payload]);
      }

      if (result.error) throw result.error;

      toast.success(editing ? 'Meta atualizada!' : 'Meta criada com sucesso!');
      onSave();
    } catch (error) {
      toast.error('Erro ao guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300 relative">
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black text-secondary mb-8 tracking-tight">
          {editing ? 'Editar Objetivo' : 'Novo Objetivo'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1 ml-1">O que pretende conquistar?</label>
            <input 
              type="text" required value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Ex: Viagem às Maldivas"
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1 ml-1">Valor Alvo (Kz)</label>
              <input 
                type="number" step="0.01" required value={form.target_amount}
                onChange={e => setForm({...form, target_amount: e.target.value})}
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-black text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1 ml-1">Já Tenho (Kz)</label>
              <input 
                type="number" step="0.01" value={form.current_amount}
                onChange={e => setForm({...form, current_amount: e.target.value})}
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-secondary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1 ml-1">Prazo Estimado (Opcional)</label>
            <input 
              type="date" value={form.deadline}
              onChange={e => setForm({...form, deadline: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Cor de Identificação</label>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({...form, color: c})}
                  className={`w-9 h-9 rounded-2xl border-4 transition-all ${form.color === c ? 'border-white ring-4 ring-slate-100 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 text-sm font-black text-white bg-primary rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar Meta</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Metas;
