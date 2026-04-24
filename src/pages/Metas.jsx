import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Target, Plus, Loader2, Edit3, Trash2, Calendar, TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Metas = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    const { data } = await supabase.from('goals').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta meta?')) return;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) {
      toast.success('Meta eliminada');
      fetchGoals();
    }
  };

  return (
    <Layout title="Metas Financeiras">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Metas</h1>
            <p className="text-slate-500 mt-1">Transforme os seus sonhos em objetivos alcançáveis.</p>
          </div>
          <button 
            onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} />
            Criar Nova Meta
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : goals.length === 0 ? (
          <div className="bento-card py-24 flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
              <Target size={56} strokeWidth={1} />
            </div>
            <div className="max-w-md">
              <p className="font-bold text-secondary text-xl">Dê um nome aos seus sonhos</p>
              <p className="text-sm text-slate-400 mt-2">Quer comprar uma casa, um carro ou fazer uma viagem? Crie uma meta e acompanhe o seu progresso mensalmente.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map(goal => {
              const percent = (goal.current_amount / goal.target_amount) * 100;
              const remaining = goal.target_amount - goal.current_amount;
              
              return (
                <div key={goal.id} className="bento-card group border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: goal.color }}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: goal.color }}>
                        <Target size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary text-lg">{goal.title}</h3>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            <Calendar size={10} />
                            Limite: {format(parseISO(goal.deadline), "dd MMM yyyy", { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(goal.id)} className="p-2 text-slate-400 hover:text-negative hover:bg-negative/5 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-secondary">{Number(goal.current_amount).toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">Kz</span></p>
                        <p className="text-xs text-slate-400 font-medium">acumulados de {Number(goal.target_amount).toLocaleString('pt-BR')} Kz</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-secondary" style={{ color: goal.color }}>{percent.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 shadow-lg"
                        style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: goal.color }}
                      />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">Faltam {remaining > 0 ? remaining.toLocaleString('pt-BR') : 0} Kz</span>
                      </div>
                      {percent >= 100 && (
                        <span className="text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full uppercase tracking-widest animate-bounce">Concluída!</span>
                      )}
                    </div>
                  </div>
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
    setLoading(true);
    
    const payload = { 
      ...form, 
      user_id: userId, 
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || 0)
    };
    
    let error;
    if (editing) {
      ({ error } = await supabase.from('goals').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('goals').insert([payload]));
    }

    if (error) {
      toast.error('Erro: ' + error.message);
    } else {
      toast.success('Meta guardada!');
      onSave();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 animate-in zoom-in duration-300">
        <h2 className="text-2xl font-bold text-secondary mb-8">{editing ? 'Editar Meta' : 'Nova Meta'}</h2>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">O que pretende conquistar?</label>
            <input 
              type="text" required value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Ex: Viagem às Maldivas"
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Valor Alvo (Kz)</label>
              <input 
                type="number" required value={form.target_amount}
                onChange={e => setForm({...form, target_amount: e.target.value})}
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Já Tenho (Kz)</label>
              <input 
                type="number" value={form.current_amount}
                onChange={e => setForm({...form, current_amount: e.target.value})}
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Prazo Estimado (Opcional)</label>
            <input 
              type="date" value={form.deadline}
              onChange={e => setForm({...form, deadline: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Cor de Identificação</label>
            <div className="flex gap-2.5">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({...form, color: c})}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-secondary scale-125' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-[2] py-4 text-sm font-bold text-white bg-primary rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar Meta</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Metas;
