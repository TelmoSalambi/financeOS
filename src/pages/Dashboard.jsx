import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../contexts/AuthContext';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus,
  ShoppingBag,
  Briefcase,
  Utensils,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  eachDayOfInterval, 
  endOfMonth, 
  isSameDay, 
  subDays, 
  startOfWeek, 
  startOfYear, 
  isAfter 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AIInsights from '../components/AIInsights';

const Dashboard = () => {
  const { user } = useAuth();
  const { balance: totalBalance, transactions, loading, error } = useFinancialStats();
  const [period, setPeriod] = useState('1M'); // 1S, 1M, 3M, 1Y

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '1S': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case '1M': startDate = startOfMonth(now); break;
      case '3M': startDate = subDays(now, 90); break;
      case '1Y': startDate = startOfYear(now); break;
      default: startDate = startOfMonth(now);
    }

    return (transactions || []).filter(t => isAfter(parseISO(t.date), startDate) || isSameDay(parseISO(t.date), startDate));
  }, [transactions, period]);

  // Recalculate stats for the period
  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense };
  }, [filteredTransactions]);

  // Prepare Chart Data
  const evolutionData = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    const now = new Date();
    let start;
    switch (period) {
      case '1S': start = startOfWeek(now, { weekStartsOn: 1 }); break;
      case '1M': start = startOfMonth(now); break;
      case '3M': start = subDays(now, 90); break;
      case '1Y': start = startOfYear(now); break;
      default: start = startOfMonth(now);
    }
    
    const days = eachDayOfInterval({ start, end: now });
    let runningBalance = 0; 
    
    return days.map(day => {
      const dayTransactions = filteredTransactions.filter(t => isSameDay(parseISO(t.date), day));
      const dayNet = dayTransactions.reduce((acc, t) => 
        t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount)
      , 0);
      
      runningBalance += dayNet;
      
      return {
        name: format(day, period === '1S' ? 'eee' : 'dd MMM', { locale: ptBR }),
        val: runningBalance
      };
    }).filter((_, i, arr) => {
      if (period === '1Y') return i % 30 === 0;
      if (period === '3M') return i % 10 === 0;
      return true;
    });
  }, [filteredTransactions, period]);

  // Prepare Category Data
  const categoryData = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const categories = {};
    
    expenseTransactions.forEach(t => {
      const catName = t.categories?.name || 'Outros';
      categories[catName] = (categories[catName] || 0) + Number(t.amount);
    });

    const colors = ['#10B981', '#facc15', '#fb7185', '#94a3b8', '#8b5cf6', '#3b82f6'];
    
    return Object.entries(categories).map(([name, val], index) => ({
      name,
      value: Math.round((val / (stats.expense || 1)) * 100) || 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredTransactions, stats.expense]);

  if (loading && !(transactions || []).length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">A carregar o seu universo financeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Visão Geral Financeira">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-negative/10 border border-negative/20 text-negative rounded-xl flex items-center gap-3 animate-in shake">
            <AlertCircle size={20} />
            <span>Erro ao carregar dados: {error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <section>
            <h1 className="text-3xl font-bold text-secondary">Olá, {user?.user_metadata?.full_name || 'Usuário'}</h1>
            <p className="text-slate-500 mt-1 font-medium">Bem-vindo de volta ao seu painel financeiro.</p>
          </section>

          <div className="flex bg-slate-100 p-1 rounded-xl items-center shadow-inner">
            {[
              { id: '1S', label: '7D' },
              { id: '1M', label: '1M' },
              { id: '3M', label: '3M' },
              { id: '1Y', label: '1A' }
            ].map(p => (
              <button 
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  period === p.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-secondary text-white p-8 rounded-[2rem] shadow-2xl shadow-secondary/20 relative overflow-hidden flex flex-col justify-between h-60 border border-white/10 group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Património Total</p>
              <h3 className="text-4xl font-bold tracking-tight">
                {(totalBalance || 0).toLocaleString('pt-BR')} <span className="text-lg font-normal opacity-50">Kz</span>
              </h3>
            </div>
            
            <div className="relative z-10 flex justify-between items-end">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                  <Wallet size={20} className="text-primary" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Status</p>
                <span className="text-xs font-bold text-primary flex items-center gap-1 justify-end">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div> Seguro
                </span>
              </div>
            </div>
            
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors duration-700"></div>
          </div>

          <SummaryCard 
            title={`Receitas (${period})`} 
            amount={stats.income.toLocaleString('pt-BR')} 
            percentage={0} 
            icon={ArrowUpCircle} 
            colorClass="primary"
          />
          
          <SummaryCard 
            title={`Despesas (${period})`} 
            amount={stats.expense.toLocaleString('pt-BR')} 
            percentage={0} 
            icon={ArrowDownCircle} 
            colorClass="negative"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bento-card">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-secondary">Evolução do Saldo</h3>
                <p className="text-xs text-slate-400 mt-1">Tendência líquida no período selecionado</p>
              </div>
              <Calendar size={20} className="text-slate-300" />
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    formatter={(v) => [`${v.toLocaleString()} Kz`, 'Saldo']}
                  />
                  <Area type="monotone" dataKey="val" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-card flex flex-col">
            <h3 className="text-xl font-bold text-secondary mb-1">Distribuição</h3>
            <p className="text-xs text-slate-400 mb-8">Principais categorias de gastos</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <span className="text-xs font-black text-secondary">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bento-card overflow-hidden !p-0 border-none shadow-xl shadow-slate-200/40">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-bold text-secondary">Atividade Recente</h3>
              <Link to="/historico" className="text-primary text-sm font-bold hover:underline">Ver Histórico</Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {(filteredTransactions || []).slice(0, 5).map((t) => (
                <ActivityItem 
                  key={t.id}
                  icon={t.type === 'income' ? Briefcase : (t.categories?.icon || ShoppingBag)} 
                  title={t.description || t.categories?.name} 
                  date={format(parseISO(t.date), "dd 'de' MMM", { locale: ptBR })} 
                  category={t.categories?.name} 
                  amount={`${t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString('pt-BR')}`} 
                  isNegative={t.type === 'expense'} 
                />
              ))}
              {(filteredTransactions || []).length === 0 && (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Plus size={32} />
                  </div>
                  <p className="font-semibold text-slate-400">Nenhuma transação encontrada no período.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <AIInsights transactions={transactions} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ActivityItem = ({ icon: Icon, title, date, category, amount, isNegative }) => {
  const IconComp = typeof Icon === 'string' ? Utensils : Icon;

  return (
    <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-primary">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isNegative ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary shadow-sm'}`}>
          <IconComp size={24} />
        </div>
        <div>
          <p className="font-bold text-secondary leading-tight">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{date}</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{category}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-base font-bold ${isNegative ? 'text-negative' : 'text-primary'}`}>
          {amount} <span className="text-[10px] font-normal opacity-70 ml-0.5">Kz</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
