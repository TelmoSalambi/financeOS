import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, Shield, Wallet, Save, Loader2, CheckCircle2, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('AOA');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating save
    setTimeout(() => {
      toast.success('Configurações guardadas com sucesso!');
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout title="Configurações">
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-secondary">Definições</h1>
          <p className="text-slate-500 mt-1">Gira as suas preferências e segurança da conta.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-bold text-secondary">Perfil & Moeda</h3>
              <p className="text-xs text-slate-400 mt-1">Como o sistema deve exibir os seus dados.</p>
            </div>
            <div className="md:col-span-2 bento-card space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm overflow-hidden">
                   {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : <User size={28} />}
                </div>
                <div>
                  <p className="font-bold text-secondary">{user?.user_metadata?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verificado
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 px-1">Moeda Padrão</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 outline-none"
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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-secondary">Autenticação 2FA</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Adicione uma camada extra de segurança.</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-primary hover:underline">Configurar</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-secondary">Palavra-passe</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Alterar a sua credencial de acesso.</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-primary hover:underline">Atualizar</button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
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
