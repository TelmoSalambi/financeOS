import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Save, Loader2, CheckCircle2, Globe, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { user, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('AOA');
  
  // FIX #4: Estados para o Modal de Confirmação customizado (substitui window.prompt)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const canConfirmDelete = deleteInput === 'APAGAR';

  const handleDeleteAccount = async () => {
    if (!canConfirmDelete) return;
    
    setLoading(true);
    try {
      await deleteAccount();
      toast.success('Conta apagada com sucesso.');
    } catch (error) {
      toast.error('Erro ao apagar conta. Tente novamente.');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de salvamento
    setTimeout(() => {
      toast.success('Configurações guardadas com sucesso!');
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout title="Configurações">
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Definições</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Gira as suas preferências e segurança da conta.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 md:space-y-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-bold text-secondary">Perfil & Moeda</h3>
              <p className="text-xs text-slate-400 mt-1">Como o sistema deve exibir os seus dados.</p>
            </div>
            <div className="md:col-span-2 bento-card space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-16 h-16 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm overflow-hidden shrink-0">
                   {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : <User size={32} className="sm:w-7 sm:h-7" />}
                </div>
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <p className="font-bold text-secondary truncate w-full">{user?.user_metadata?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-slate-400 truncate w-full">{user?.email}</p>
                  <div className="mt-2 flex justify-center sm:justify-start">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verificado
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 px-1">Moeda Padrão</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 outline-none transition-all"
                    >
                      <option value="AOA">Kwanza (Kz)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 px-1">Idioma</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🇵🇹</div>
                    <select 
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm opacity-60 cursor-not-allowed"
                    >
                      <option>Português (AO)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-bold text-secondary">Segurança</h3>
              <p className="text-xs text-slate-400 mt-1">Proteja o seu acesso e dados financeiros.</p>
            </div>
            <div className="md:col-span-2 bento-card space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Shield size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-secondary truncate">Autenticação 2FA</h4>
                    <p className="text-[10px] text-slate-500 font-medium truncate">Camada extra de segurança.</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-primary hover:underline shrink-0 pl-2">Configurar</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Lock size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-secondary truncate">Palavra-passe</h4>
                    <p className="text-[10px] text-slate-500 font-medium truncate">Alterar credencial de acesso.</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-primary hover:underline shrink-0 pl-2">Atualizar</button>
              </div>
            </div>
          </div>

          {/* ZONA DE PERIGO — FIX #4: Confirmação Inline Segura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-bold text-negative">Zona de Perigo</h3>
              <p className="text-xs text-slate-400 mt-1">Ações irreversíveis na sua conta.</p>
            </div>
            <div className="md:col-span-2 bento-card border-negative/20 bg-negative/5">
              {!showDeleteConfirm ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold text-negative">Apagar Conta</h4>
                    <p className="text-[10px] text-negative/60 font-medium leading-relaxed">
                      Esta ação é permanente e removerá todos os seus dados.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white text-negative border border-negative/20 font-bold rounded-xl hover:bg-negative hover:text-white transition-all active:scale-95 text-xs shadow-sm"
                  >
                    Iniciar Processo
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in duration-200">
                  <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-negative/10">
                    <AlertTriangle className="text-negative shrink-0" size={18} />
                    <p className="text-xs text-negative font-medium leading-tight">
                      Para confirmar a eliminação permanente, escreva <span className="font-black">APAGAR</span> abaixo.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text"
                      placeholder="Escreva APAGAR aqui"
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-negative/20 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-negative/5 uppercase transition-all"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        disabled={!canConfirmDelete || loading}
                        onClick={handleDeleteAccount}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-negative text-white font-bold rounded-xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Apagar</>}
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                        className="px-4 py-2.5 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 md:py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] md:hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Configuracoes;
