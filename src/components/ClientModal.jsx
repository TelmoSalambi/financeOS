import React, { useState } from 'react';
import { X, UserPlus, Mail, User, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const ClientModal = ({ isOpen, onClose, userId, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create a relationship record (pending status)
      const { error: relError } = await supabase
        .from('client_relationships')
        .insert([{
          business_id: userId,
          client_name: form.name,
          client_email: form.email,
          notes: form.notes,
          status: 'pending'
        }]);

      if (relError) throw relError;

      // 2. Create an invite record
      const { error: invError } = await supabase
        .from('client_invites')
        .insert([{
          business_id: userId,
          email: form.email
        }]);

      if (invError) throw invError;

      toast.success('Convite enviado para ' + form.email);
      onRefresh();
      onClose();
    } catch (error) {
      if (error.code === '23505') {
        toast.error('Este email já está na sua lista de clientes.');
      } else {
        toast.error('Erro ao convidar: ' + error.message);
      }
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

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0">
            <UserPlus size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-secondary tracking-tight">Novo Cliente</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Portal Profissional</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Cliente / Empresa</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors" />
              <input
                type="text" required value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Ex: João Silva ou Mercearia Central"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-secondary/5 focus:border-secondary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço de Email</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors" />
              <input
                type="email" required value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="cliente@exemplo.com"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-secondary/5 focus:border-secondary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notas Internas (Opcional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Ex: Cliente premium, focar em redução de custos fixos."
              rows={3}
              className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-secondary/5 focus:border-secondary/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={loading}
              className="flex-[2] py-4 bg-secondary text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-secondary/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={18} /> Convidar Cliente</>}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
          O cliente receberá um convite por email para confirmar a relação de gestão financeira.
        </p>
      </div>
    </div>
  );
};

export default ClientModal;
