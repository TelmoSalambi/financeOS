import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Palmtree, 
  TrendingUp, 
  Flame, 
  Target, 
  ShieldAlert, 
  Calculator, 
  ArrowRight, 
  Info,
  DollarSign,
  Calendar,
  Percent,
  X,
  Plus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const Simuladores = () => {
  const [activeTab, setActiveTab] = useState('reforma');

  const tabs = [
    { id: 'reforma', label: 'Reforma', icon: Palmtree, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'juros', label: 'Juros Compostos', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'fire', label: 'Número FIRE', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'meta', label: 'Tempo p/ Meta', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'divida', label: 'Libertação Dívida', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <Layout title="Simuladores de Futuro">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-24">
        
        <div className="mb-8 md:mb-14 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Simuladores</h1>
          <p className="text-slate-500 mt-3 text-sm md:text-lg font-medium leading-relaxed">
            Ferramentas matemáticas para projetar o seu futuro financeiro com precisão.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="relative mb-8 md:mb-12">
          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center gap-3 px-4 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all border-2 shrink-0 text-xs md:text-sm ${
                  activeTab === tab.id 
                    ? `border-transparent shadow-2xl shadow-slate-200/50 ${tab.bg} ${tab.color}` 
                    : 'border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Simulator Content */}
        <div className="min-h-[600px]">
          {activeTab === 'reforma' && <RetirementSimulator />}
          {activeTab === 'juros' && <CompoundInterestSimulator />}
          {activeTab === 'fire' && <FireSimulator />}
          {activeTab === 'meta' && <GoalTimeSimulator />}
          {activeTab === 'divida' && <DebtSimulator />}
        </div>
      </div>
    </Layout>
  );
};

/* --- 1. Retirement Simulator --- */
const RetirementSimulator = () => {
  const [inputs, setInputs] = useState({ age: 25, retirementAge: 65, salary: 250000, savingsRate: 20, returnRate: 8 });

  // FIX #55: Sincronização de idade para evitar valores impossíveis
  useEffect(() => {
    if (inputs.retirementAge <= inputs.age) {
      setInputs(prev => ({ ...prev, retirementAge: prev.age + 1 }));
    }
  }, [inputs.age, inputs.retirementAge]);

  const data = useMemo(() => {
    let balance = 0;
    const years = [];
    const monthlyContribution = (inputs.salary * (inputs.savingsRate / 100));
    const monthlyRate = (inputs.returnRate / 100) / 12;

    const diff = Math.max(1, inputs.retirementAge - inputs.age);

    for (let i = 0; i <= diff; i++) {
      years.push({ year: inputs.age + i, balance: Math.round(balance) });
      for (let m = 0; m < 12; m++) {
        balance = (balance + monthlyContribution) * (1 + monthlyRate);
      }
    }
    return years;
  }, [inputs]);

  const finalBalance = data[data.length - 1]?.balance || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bento-card p-8 space-y-8">
        <h3 className="font-black text-secondary flex items-center gap-2 uppercase tracking-widest text-[10px]">
          <Calculator size={16} className="text-emerald-500" /> Parâmetros de Reforma
        </h3>
        <div className="space-y-6">
          <InputRange label="Idade Atual" value={inputs.age} min={18} max={80} onChange={v => setInputs({...inputs, age: v})} suffix="anos" />
          <InputRange label="Idade de Reforma" value={inputs.retirementAge} min={inputs.age + 1} max={100} onChange={v => setInputs({...inputs, retirementAge: v})} suffix="anos" />
          <InputAmount label="Salário Mensal" value={inputs.salary} onChange={v => setInputs({...inputs, salary: v})} />
          <InputRange label="% de Poupança" value={inputs.savingsRate} min={1} max={90} onChange={v => setInputs({...inputs, savingsRate: v})} suffix="%" />
          <InputRange label="Retorno Anual Esperado" value={inputs.returnRate} min={1} max={25} onChange={v => setInputs({...inputs, returnRate: v})} suffix="%" />
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bento-card p-10 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-2xl shadow-emerald-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">Património Estimado aos {inputs.retirementAge} anos</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter truncate">
              {finalBalance.toLocaleString('pt-BR')} <span className="text-lg md:text-2xl font-normal opacity-50">Kz</span>
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Anos de Acumulação</p>
                <p className="text-xl font-black">{Math.max(0, inputs.retirementAge - inputs.age)} Anos</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Aporte Mensal</p>
                <p className="text-xl font-black truncate">{(inputs.salary * (inputs.savingsRate/100)).toLocaleString('pt-BR')} Kz</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
        </div>

        <div className="bento-card p-8 h-[350px]">
          <h3 className="font-black text-secondary mb-8 text-[10px] uppercase tracking-widest">Crescimento do Património</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                itemStyle={{ fontWeight: 'black', fontSize: '13px' }}
                formatter={(v) => [`${v.toLocaleString()} Kz`, 'Total']}
              />
              <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* --- 2. Compound Interest Simulator --- */
const CompoundInterestSimulator = () => {
  const [inputs, setInputs] = useState({ initial: 1000000, monthly: 50000, years: 10, rate: 12 });

  const data = useMemo(() => {
    let balance = inputs.initial;
    const results = [];
    const monthlyRate = (inputs.rate / 100) / 12;

    for (let i = 0; i <= inputs.years; i++) {
      results.push({ year: i, total: Math.round(balance) });
      for (let m = 0; m < 12; m++) {
        balance = (balance + inputs.monthly) * (1 + monthlyRate);
      }
    }
    return results;
  }, [inputs]);

  const total = data[data.length - 1]?.total || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bento-card p-8 space-y-8">
        <h3 className="font-black text-secondary flex items-center gap-2 uppercase tracking-widest text-[10px]">
          <TrendingUp size={16} className="text-blue-500" /> Matemática do Juro
        </h3>
        <div className="space-y-6">
          <InputAmount label="Capital Inicial" value={inputs.initial} onChange={v => setInputs({...inputs, initial: v})} />
          <InputAmount label="Aporte Mensal" value={inputs.monthly} onChange={v => setInputs({...inputs, monthly: v})} />
          <InputRange label="Período de Tempo" value={inputs.years} min={1} max={50} onChange={v => setInputs({...inputs, years: v})} suffix="anos" />
          <InputRange label="Taxa de Rentabilidade Anual" value={inputs.rate} min={1} max={40} onChange={v => setInputs({...inputs, rate: v})} suffix="%" />
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bento-card p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl shadow-blue-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Estimativa Total em {inputs.years} anos</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter truncate">
              {total.toLocaleString('pt-BR')} <span className="text-lg md:text-2xl font-normal opacity-50">Kz</span>
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Investido</p>
                <p className="text-xl font-black truncate">{(inputs.initial + (inputs.monthly * 12 * inputs.years)).toLocaleString('pt-BR')} Kz</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Lucro de Juros</p>
                <p className="text-xl font-black text-blue-300 truncate">{(total - (inputs.initial + (inputs.monthly * 12 * inputs.years))).toLocaleString('pt-BR')} Kz</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
        </div>

        <div className="bento-card p-8 h-[350px]">
          <h3 className="font-black text-secondary mb-8 text-[10px] uppercase tracking-widest">Aceleração Composta</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                formatter={v => [`${v.toLocaleString()} Kz`, 'Montante']} 
              />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={5} dot={false} animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* --- 3. Fire Simulator --- */
const FireSimulator = () => {
  const [expense, setExpense] = useState(300000);
  const [swr, setSwr] = useState(4); // Safe Withdrawal Rate (4% rule)
  
  // FIX #56: Tornar o SWR parametrizável
  const fireNumber = useMemo(() => {
    return (expense * 12) / (swr / 100);
  }, [expense, swr]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bento-card p-10 md:p-16 text-center">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-100">
          <Flame size={40} />
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-secondary mb-3 tracking-tight">Qual o seu Número FIRE?</h3>
        <p className="text-slate-500 text-sm mb-12 max-w-lg mx-auto font-medium">Calcule o património necessário para viver apenas dos rendimentos dos seus investimentos.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
          <InputAmount label="Despesa Mensal Desejada" value={expense} onChange={setExpense} />
          <InputRange label="Taxa de Levantamento (SWR)" value={swr} min={2} max={10} step={0.5} onChange={setSwr} suffix="%" />
        </div>

        <div className="p-10 md:p-14 bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-[3rem] shadow-2xl shadow-orange-200">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3">Liberdade Financeira Total</p>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter truncate">
            {Math.round(fireNumber).toLocaleString('pt-BR')} <span className="text-lg md:text-3xl font-bold opacity-50">Kz</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-secondary flex items-center gap-2 mb-3 text-sm uppercase tracking-widest"><Info size={16} /> A Regra Clássica</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              A regra dos 4% (SWR) sugere que se o seu património for 25x a sua despesa anual, pode retirar dinheiro indefinidamente.
            </p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-secondary flex items-center gap-2 mb-3 text-sm uppercase tracking-widest"><TrendingUp size={16} /> Inflação</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Em economias com inflação alta, considere uma taxa de levantamento (SWR) mais conservadora (Ex: 3% ou 3.5%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 4. Goal Time Simulator --- */
const GoalTimeSimulator = () => {
  const [inputs, setInputs] = useState({ target: 5000000, current: 500000, monthly: 150000 });
  
  const remaining = Math.max(0, inputs.target - inputs.current);
  const months = Math.ceil(remaining / (inputs.monthly || 1));
  const years = (months / 12).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 bento-card p-10 space-y-8">
        <h3 className="text-xl font-black text-secondary tracking-tight">Definir Objetivo</h3>
        <div className="space-y-8">
          <InputAmount label="Valor Total da Meta" value={inputs.target} onChange={v => setInputs({...inputs, target: v})} />
          <InputAmount label="Montante Já Acumulado" value={inputs.current} onChange={v => setInputs({...inputs, current: v})} />
          <InputAmount label="Capacidade Mensal de Poupança" value={inputs.monthly} onChange={v => setInputs({...inputs, monthly: v})} />
        </div>
      </div>

      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bento-card p-10 flex-1 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group flex flex-col justify-center items-center text-center">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Estimativa de Tempo</p>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter">{months} <span className="text-xl md:text-3xl font-bold opacity-30 uppercase">meses</span></h2>
            <p className="mt-6 font-black text-primary text-lg md:text-2xl uppercase tracking-widest">~ {years} Anos</p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
        </div>
        
        <div className="bento-card p-8 bg-white border border-slate-100">
          <h4 className="font-black text-secondary mb-6 text-[10px] uppercase tracking-widest">Análise de Progresso Real</h4>
          <div className="space-y-5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase">Ainda Falta</span>
              <span className="text-negative truncate ml-4 tracking-tighter text-sm">{remaining.toLocaleString()} Kz</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 shadow-lg shadow-primary/20" 
                style={{ width: `${Math.min(100, (inputs.current / (inputs.target || 1)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{Math.floor((inputs.current / (inputs.target || 1)) * 100)}% Concluído</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 5. Debt Simulator --- */
const DebtSimulator = () => {
  const [debt, setDebt] = useState(1500000);
  const [interest, setInterest] = useState(15);
  const [payment, setPayment] = useState(100000);

  const months = useMemo(() => {
    let balance = debt;
    const monthlyRate = (interest / 100) / 12;
    let m = 0;
    while (balance > 0 && m < 600) { // Max 50 years
      const interestPayment = balance * monthlyRate;
      if (payment <= interestPayment) return Infinity; // Cannot pay off
      balance = balance + interestPayment - payment;
      m++;
    }
    return m;
  }, [debt, interest, payment]);

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bento-card p-10 space-y-8">
        <h3 className="text-xl font-black text-secondary tracking-tight">Cenário de Dívida</h3>
        <div className="space-y-8">
          <InputAmount label="Montante Total em Dívida" value={debt} onChange={setDebt} />
          <InputRange label="Taxa de Juro Efetiva (Anual)" value={interest} min={1} max={60} onChange={setInterest} suffix="%" />
          <InputAmount label="Pagamento Mensal Previsto" value={payment} onChange={setPayment} />
        </div>
      </div>

      <div className={`bento-card p-10 md:p-14 flex flex-col justify-center items-center text-center relative overflow-hidden group transition-all duration-700 ${months === Infinity ? 'bg-rose-50 border-rose-200' : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-2xl'}`}>
        {months === Infinity ? (
          <div className="animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
            </div>
            <h4 className="text-rose-600 font-black text-2xl tracking-tight mb-3">Dívida Infinita!</h4>
            <p className="text-rose-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
              O seu pagamento mensal é inferior aos juros acumulados. Aumente o valor mensal para sair desta situação.
            </p>
          </div>
        ) : (
          <div className="relative z-10 w-full animate-in fade-in duration-700">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Libertação Total em</p>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter">{months} <span className="text-xl md:text-3xl font-bold opacity-30 uppercase">meses</span></h2>
            <div className="mt-12 pt-10 border-t border-white/10 w-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Custo Total (Capital + Juros)</p>
              <p className="text-2xl font-black text-emerald-400 tracking-tighter truncate">{(months * payment).toLocaleString()} <span className="text-sm font-normal opacity-50 uppercase ml-1">Kz</span></p>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Utility Components --- */
const InputRange = ({ label, value, min, max, step = 1, onChange, suffix }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <span className="text-sm font-black text-secondary bg-slate-100 px-3 py-1 rounded-lg">{value}{suffix}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

const InputAmount = ({ label, value, onChange }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px] uppercase tracking-widest">Kz</div>
      <input 
        type="number" value={value} 
        onChange={e => onChange(Math.max(0, parseFloat(e.target.value || 0)))}
        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-secondary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-slate-200 outline-none transition-all"
      />
    </div>
  </div>
);

export default Simuladores;
