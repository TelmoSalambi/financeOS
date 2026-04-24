import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  ArrowUpRight, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ClientModal from '../components/ClientModal';
import { useNavigate } from 'react-router-dom';

const MeusClientes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_relationships')
        .select('*')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  const filteredClients = (clients || []).filter(c => 
    c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.client_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Portal Profissional">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                <Briefcase size={18} className="md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Escritório de Contabilidade</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">Meus Clientes</h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg font-medium">Faça a gestão financeira estratégica do seu portfólio.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-secondary text-white font-extrabold rounded-2xl shadow-2xl shadow-secondary/20 hover:scale-105 hover:bg-slate-800 transition-all active:scale-95 shrink-0 w-full lg:w-auto"
          >
            <Plus size={22} />
            Convidar Novo Cliente
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
          <div className="bento-card bg-slate-50 border-none p-6 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total de Clientes</p>
            <h3 className="text-2xl md:text-3xl font-black text-secondary">{clients.length}</h3>
          </div>
          <div className="bento-card bg-emerald-50 border-none p-6 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Clientes Ativos</p>
            <h3 className="text-2xl md:text-3xl font-black text-emerald-600">{clients.filter(c => c.status === 'active').length}</h3>
          </div>
          <div className="bento-card bg-amber-50 border-none p-6 md:p-8 sm:col-span-2 md:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">Convites Pendentes</p>
            <h3 className="text-2xl md:text-3xl font-black text-amber-600">{clients.filter(c => c.status === 'pending').length}</h3>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-secondary/5 focus:border-secondary/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="p-3.5 md:p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-secondary hover:border-slate-200 transition-all shadow-sm flex items-center justify-center">
            <Filter size={20} />
            <span className="sm:hidden ml-2 font-bold text-sm">Filtros</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={48} className="animate-spin text-secondary opacity-20" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">A carregar portfólio...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bento-card py-24 flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
              <Users size={48} strokeWidth={1} />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-secondary">Nenhum cliente encontrado</h3>
              <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                Comece a gerir as finanças de terceiros convidando o seu primeiro cliente hoje mesmo.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <div 
                key={client.id} 
                className="bento-card group hover:translate-y-[-4px] cursor-pointer"
                onClick={() => client.status === 'active' && navigate(`/clientes/${client.client_id}`)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                    <User size={28} />
                  </div>
                  <div className="flex gap-2">
                    {client.status === 'active' ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-emerald-100">
                        <CheckCircle2 size={10} /> Ativo
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-amber-100">
                        <Clock size={10} /> Pendente
                      </span>
                    )}
                    <button className="p-1 text-slate-300 hover:text-secondary"><MoreVertical size={16} /></button>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-black text-secondary group-hover:text-secondary transition-colors truncate">{client.client_name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                    <Mail size={12} />
                    {client.client_email}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-widest ${client.status === 'active' ? 'text-secondary' : 'text-slate-300'}`}>
                    Aceder <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:translate-y-[-1px] transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userId={user?.id}
          onRefresh={fetchClients}
        />
      </div>
    </Layout>
  );
};

export default MeusClientes;
