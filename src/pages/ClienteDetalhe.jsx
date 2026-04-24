import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  User, 
  TrendingUp, 
  TrendingDown, 
  History, 
  MessageSquare, 
  Save, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { toast } from 'sonner';

const ClienteDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, balance, totalIncome, totalExpense, loading } = useFinancialStats(id);
  
  const [clientInfo, setClientInfo] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchClientInfo = async () => {
      const { data, error } = await supabase
        .from('client_relationships')
        .select('*')
        .eq('client_id', id)
        .single();
      
      if (data) {
        setClientInfo(data);
        setNotes(data.notes || '');
      }
    };
    if (id) fetchClientInfo();
  }, [id]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('client_relationships')
        .update({ notes })
        .eq('client_id', id);
      
      if (error) throw error;
      toast.success('Notas actualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao guardar notas.');
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = transactions.slice(0, 10).reverse().map(t => ({
    name: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    valor: Number(t.amount),
    tipo: t.type
  }));

  if (loading) return (
    <Layout title="A carregar...">
      <div className="flex items-center justify-center h-80">
        <Loader2 className="animate-spin text-secondary" size={40} />
      </div>
    </Layout>
  );

  return (
    <Layout title={`Gestão: ${clientInfo?.client_name || 'Cliente'}`}>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
        
        <button 
          onClick={() => navigate('/clientes')}
          className="flex items-center gap-2 text-slate-400 hover:text-secondary font-bold text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:translate-x-[-4px] transition-transform" />
          Voltar ao Portfólio
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dashboard Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bento-card p-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Saldo do Cliente</p>
                <h3 className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {balance.toLocaleString('pt-BR')} Kz
                </h3>
              </div>
              <div className="bento-card p-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Entradas Totais</p>
                <h3 className="text-2xl font-black text-secondary">{totalIncome.toLocaleString('pt-BR')} Kz</h3>
              </div>
              <div className="bento-card p-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Saídas Totais</p>
                <h3 className="text-2xl font-black text-secondary">{totalExpense.toLocaleString('pt-BR')} Kz</h3>
              </div>
            </div>

            {/* Recent Activity Chart */}
            <div className="bento-card p-10 h-[400px]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-secondary">Histórico de Fluxo</h3>
                <FileText size={24} className="text-slate-100" />
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    formatter={(v) => [`${v.toLocaleString()} Kz`]}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.tipo === 'income' ? '#10B981' : '#fb7185'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Transactions List */}
            <div className="bento-card p-0 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="font-bold text-secondary">Últimas Movimentações</h3>
                <History size={18} className="text-slate-300" />
              </div>
              <div className="divide-y divide-slate-50">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary">{t.description || t.categories?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString('pt-BR')} Kz
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accountant Workspace Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bento-card p-8 bg-secondary text-white border-none shadow-2xl shadow-secondary/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{clientInfo?.client_name}</h4>
                  <p className="text-xs text-white/50">{clientInfo?.client_email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 font-bold uppercase tracking-widest">Status da Relação</span>
                  <span className="font-black text-emerald-400 uppercase tracking-widest">Ativa</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 font-bold uppercase tracking-widest">Membro Desde</span>
                  <span className="font-black">{new Date(clientInfo?.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="bento-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-secondary flex items-center gap-2">
                  <MessageSquare size={18} className="text-secondary" /> Notas de Gestão
                </h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Privado</span>
              </div>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Escreva aqui observações estratégicas para este cliente..."
                rows={10}
                className="w-full p-5 bg-slate-50 border border-transparent rounded-[2rem] text-sm font-medium focus:bg-white focus:border-slate-100 outline-none transition-all resize-none leading-relaxed"
              />
              <button 
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="w-full py-4 bg-secondary text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-secondary/10"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar Observações</>}
              </button>
            </div>

            <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-4 items-start">
              <AlertCircle size={24} className="text-amber-500 shrink-0" />
              <div>
                <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest">Alerta Estratégico</h4>
                <p className="text-xs text-amber-700/70 mt-1 font-medium leading-relaxed">
                  Os gastos em categorias "Não Essenciais" deste cliente subiram 14% nos últimos 15 dias. Recomenda-se reunião de revisão.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ClienteDetalhe;
