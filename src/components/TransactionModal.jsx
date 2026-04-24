import React, { useState } from 'react';
import { X, Save, Calendar, Tag, FileText, Loader2, RefreshCw, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { toast } from 'sonner';

const TransactionModal = ({ isOpen, onClose, editingTransaction = null, isMobile = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState(editingTransaction?.type || 'expense');
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories(type);
  
  const [formData, setFormData] = useState({
    amount: editingTransaction?.amount?.toString() || '',
    date: editingTransaction?.date || new Date().toISOString().split('T')[0],
    category_id: editingTransaction?.category_id || '',
    description: editingTransaction?.description || '',
    recurrence: editingTransaction?.recurrence || 'once'
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Sessão inválida. Por favor, recarregue a página.');
      return;
    }
    
    if (!formData.amount || !formData.category_id) {
      toast.error('Preencha todos os campos obrigatórios (Valor e Categoria).');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        user_id: user.id,
        type,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        description: formData.description || '',
        date: formData.date,
      };

      // Promise race with 8-second timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tempo de resposta excedido. Verifique a sua internet.')), 8000)
      );

      let dbPromise;
      if (editingTransaction) {
        dbPromise = supabase.from('transactions').update(payload).eq('id', editingTransaction.id);
      } else {
        dbPromise = supabase.from('transactions').insert([payload]);
      }

      const result = await Promise.race([dbPromise, timeoutPromise]);

      if (result.error) {
        throw new Error(result.error.message || 'Erro ao comunicar com a base de dados.');
      }
      
      // Dispatch custom event for instant UI update
      window.dispatchEvent(new CustomEvent('finance-stats-updated'));
      
      toast.success(editingTransaction ? 'Transação atualizada!' : 'Transação guardada com sucesso!');
      
      // Reset form and close
      onClose();

      if (location.pathname !== '/' && !editingTransaction) {
        navigate('/');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ─── MOBILE: Full-screen layout ───────────────────────────
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
          <h2 className="text-base font-bold text-secondary">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
          {/* Type Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center mb-6 max-w-xs mx-auto">
            <button 
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${type === 'expense' ? 'bg-white text-negative shadow-sm' : 'text-slate-500'}`}
            >
              {type === 'expense' && <Check size={14} strokeWidth={3} />}
              Despesa
            </button>
            <button 
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${type === 'income' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              {type === 'income' && <Check size={14} strokeWidth={3} />}
              Receita
            </button>
          </div>

          {/* Amount — large, centered */}
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Valor da Transação</p>
            <div className="relative inline-flex items-baseline gap-2">
              <span className="text-sm font-bold text-primary">Kz</span>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0,00"
                inputMode="decimal"
                className="text-4xl font-bold text-secondary bg-transparent border-none outline-none text-center w-48 placeholder:text-slate-200"
              />
            </div>
            <div className="w-32 h-0.5 bg-slate-100 mx-auto mt-2 rounded-full" />
          </div>

          {/* Category — horizontal scroll pills */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Categoria</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({...formData, category_id: cat.id})}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                    formData.category_id === cat.id 
                      ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                      : 'border-slate-100 text-slate-500 bg-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
              <Calendar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Data</p>
              <input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-secondary mt-0.5"
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
              <RefreshCw size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Repetição</p>
              <select 
                value={formData.recurrence}
                onChange={(e) => setFormData({...formData, recurrence: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-secondary mt-0.5 appearance-none"
              >
                <option value="once">Única</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Descrição</p>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3.5 text-slate-300" />
              <input 
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Almoço com a família"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-primary/20 focus:ring-2 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Fixed bottom save button */}
        <div className="shrink-0 px-5 pb-6 pt-3 bg-white border-t border-slate-100" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button 
            onClick={handleSubmit}
            disabled={loading} 
            className="w-full py-4 font-bold text-white bg-primary rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] transition-all text-base"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Check size={20} strokeWidth={2.5} /> Guardar Transação</>}
          </button>
        </div>
      </div>
    );
  }

  // ─── DESKTOP: Centered modal layout ───────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h2>
            <p className="text-sm text-slate-400">{editingTransaction ? 'Atualize os detalhes do registo' : 'Registe uma nova movimentação financeira'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button 
              type="button"
              onClick={() => { setType('expense'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white text-negative shadow-sm' : 'text-slate-500'}`}
            >
              Despesa
            </button>
            <button 
              type="button"
              onClick={() => { setType('income'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Receita
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 block px-1">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Kz</span>
              <input 
                type="number" step="0.01" required value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-border rounded-xl text-3xl font-bold text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 block px-1">Data</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" required value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 block px-1">Categoria</label>
              <div className="relative">
                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  required value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  <option value="">Selecionar...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 block px-1">Repetição</label>
            <div className="relative">
              <RefreshCw size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={formData.recurrence}
                onChange={(e) => setFormData({...formData, recurrence: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
              >
                <option value="once">Única</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 block px-1">Descrição</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-4 text-slate-400" />
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Almoço de domingo"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none h-20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> {editingTransaction ? 'Atualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
