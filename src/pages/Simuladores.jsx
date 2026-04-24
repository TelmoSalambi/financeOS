import React, { useState, useMemo } from 'react';
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
  Percent
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
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-secondary tracking-tight">Simuladores de Futuro</h1>
          <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed">
            Planeie a sua liberdade financeira com as ferramentas de simulação mais avançadas do mercado.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border-2 ${
                activeTab === tab.id 
                  ? `border-transparent shadow-xl shadow-slate-200/50 ${tab.bg} ${tab.color}` 
                  : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
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

  const data = useMemo(() => {
    let balance = 0;
    const years = [];
    const monthlyContribution = (inputs.salary * (inputs.savingsRate / 100));
    const monthlyRate = (inputs.returnRate / 100) / 12;

    for (let i = 0; i <= (inputs.retirementAge - inputs.age); i++) {
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
      <div className="lg:col-span-1 space-y-6">
        <div className="bento-card p-8">
          <h3 className="font-bold text-secondary mb-6 flex items-center gap-2">
            <Calculator size={18} className="text-emerald-500" /> Parâmetros
          </h3>
          <div className="space-y-5">
            <InputRange label="Idade Actual" value={inputs.age} min={18} max={80} onChange={v => setInputs({...inputs, age: v})} suffix="anos" />
            <InputRange label="Idade de Reforma" value={inputs.retirementAge} min={inputs.age + 1} max={100} onChange={v => setInputs({...inputs, retirementAge: v})} suffix="anos" />
            <InputAmount label="Salário Mensal" value={inputs.salary} onChange={v => setInputs({...inputs, salary: v})} />
            <InputRange label="% de Poupança" value={inputs.savingsRate} min={1} max={90} onChange={v => setInputs({...inputs, savingsRate: v})} suffix="%" />
            <InputRange label="Retorno Anual Esperado" value={inputs.returnRate} min={1} max={25} onChange={v => setInputs({...inputs, returnRate: v})} suffix="%" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bento-card p-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-2xl shadow-emerald-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Património Acumulado na Reforma</p>
            <h2 className="text-5xl font-black">{finalBalance.toLocaleString('pt-BR')} <span className="text-xl font-normal opacity-60">Kz</span></h2>
            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Tempo de Acumulação</p>
                <p className="text-xl font-bold">{inputs.retirementAge - inputs.age} Anos</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Poupança Mensal</p>
                <p className="text-xl font-bold">{(inputs.salary * (inputs.savingsRate/100)).toLocaleString('pt-BR')} Kz</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
        </div>

        <div className="bento-card p-8 h-[350px]">
          <h3 className="font-bold text-secondary mb-6">Projecção de Crescimento</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`${v.toLocaleString()} Kz`, 'Património']}
              />
              <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
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
      <div className="lg:col-span-1 bento-card p-8">
        <h3 className="font-bold text-secondary mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" /> Variáveis
        </h3>
        <div className="space-y-6">
          <InputAmount label="Capital Inicial" value={inputs.initial} onChange={v => setInputs({...inputs, initial: v})} />
          <InputAmount label="Aporte Mensal" value={inputs.monthly} onChange={v => setInputs({...inputs, monthly: v})} />
          <InputRange label="Período (Anos)" value={inputs.years} min={1} max={50} onChange={v => setInputs({...inputs, years: v})} suffix="anos" />
          <InputRange label="Taxa Anual (%)" value={inputs.rate} min={1} max={40} onChange={v => setInputs({...inputs, rate: v})} suffix="%" />
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bento-card p-10 bg-blue-600 text-white border-none shadow-2xl shadow-blue-200/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Valor Estimado após {inputs.years} anos</p>
          <h2 className="text-5xl font-black">{total.toLocaleString('pt-BR')} <span className="text-xl font-normal opacity-60">Kz</span></h2>
          <div className="mt-8 flex gap-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Total Investido</p>
              <p className="text-xl font-bold">{(inputs.initial + (inputs.monthly * 12 * inputs.years)).toLocaleString('pt-BR')} Kz</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Ganhos em Juros</p>
              <p className="text-xl font-bold text-emerald-300">{(total - (inputs.initial + (inputs.monthly * 12 * inputs.years))).toLocaleString('pt-BR')} Kz</p>
            </div>
          </div>
        </div>

        <div className="bento-card p-8 h-[350px]">
          <h3 className="font-bold text-secondary mb-6">Aceleração de Capital</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip formatter={v => [`${v.toLocaleString()} Kz`]} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} dot={false} />
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
  const fireNumber = expense * 12 * 25; // Rule of 25 (4% rule)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bento-card p-10 text-center">
        <Flame size={48} className="mx-auto text-orange-500 mb-6" />
        <h3 className="text-2xl font-bold text-secondary mb-2">Qual o seu Número FIRE?</h3>
        <p className="text-slate-500 text-sm mb-10">O montante necessário para viver dos seus investimentos para sempre.</p>
        
        <div className="max-w-sm mx-auto mb-10">
          <InputAmount label="Despesa Mensal Desejada" value={expense} onChange={setExpense} />
        </div>

        <div className="p-8 bg-orange-50 border-2 border-orange-100 rounded-[2.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">O Seu Número de Independência</p>
          <h2 className="text-6xl font-black text-orange-600">{fireNumber.toLocaleString('pt-BR')} <span className="text-2xl font-bold opacity-60">Kz</span></h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-secondary flex items-center gap-2 mb-2"><Info size={16} /> Regra dos 4%</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Baseia-se na teoria de que se retirar 4% do seu património anualmente, o dinheiro durará pelo menos 30 anos (ou eternamente se o retorno for superior à inflação).
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-secondary flex items-center gap-2 mb-2"><TrendingUp size={16} /> Acelere o Processo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quanto mais baixa for a sua despesa mensal, mais rápido atingirá o seu número FIRE. O foco deve ser aumentar o aporte e reduzir o estilo de vida.
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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bento-card p-10">
        <h3 className="text-xl font-bold text-secondary mb-8">Defina o Objetivo</h3>
        <div className="space-y-6">
          <InputAmount label="Valor da Meta (ex: Carro, Viagem)" value={inputs.target} onChange={v => setInputs({...inputs, target: v})} />
          <InputAmount label="Valor que já tem guardado" value={inputs.current} onChange={v => setInputs({...inputs, current: v})} />
          <InputAmount label="Quanto consegue guardar p/ mês" value={inputs.monthly} onChange={v => setInputs({...inputs, monthly: v})} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bento-card p-10 flex-1 bg-primary text-white flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Tempo Estimado</p>
          <h2 className="text-6xl font-black">{months} <span className="text-2xl font-bold opacity-60">meses</span></h2>
          <p className="mt-4 font-bold text-white/80">ou cerca de {years} anos</p>
        </div>
        
        <div className="bento-card p-8 bg-slate-900 text-white">
          <h4 className="font-bold mb-4">Análise de Progresso</h4>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Necessário</span>
              <span className="font-bold">{inputs.target.toLocaleString()} Kz</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Falta Acumular</span>
              <span className="font-bold text-rose-400">{remaining.toLocaleString()} Kz</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${(inputs.current / inputs.target) * 100}%` }}
              />
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
    while (balance > 0 && m < 360) { // Max 30 years
      const interestPayment = balance * monthlyRate;
      if (payment <= interestPayment) return Infinity; // Cannot pay off
      balance = balance + interestPayment - payment;
      m++;
    }
    return m;
  }, [debt, interest, payment]);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bento-card p-10">
        <h3 className="text-xl font-bold text-secondary mb-8">Detalhes da Dívida</h3>
        <div className="space-y-6">
          <InputAmount label="Saldo Devedor Total" value={debt} onChange={setDebt} />
          <InputRange label="Taxa de Juro Anual (%)" value={interest} min={1} max={60} onChange={setInterest} suffix="%" />
          <InputAmount label="Pagamento Mensal" value={payment} onChange={setPayment} />
        </div>
      </div>

      <div className={`bento-card p-10 flex flex-col justify-center items-center text-center transition-colors ${months === Infinity ? 'bg-rose-50 border-rose-200' : 'bg-rose-600 text-white'}`}>
        {months === Infinity ? (
          <>
            <ShieldAlert size={48} className="text-rose-500 mb-4" />
            <h4 className="text-rose-600 font-bold text-xl">Atenção!</h4>
            <p className="text-rose-500 text-sm mt-2">O seu pagamento mensal não cobre sequer os juros. A dívida está a crescer.</p>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Libertação Total em</p>
            <h2 className="text-6xl font-black">{months} <span className="text-2xl font-bold opacity-60">meses</span></h2>
            <div className="mt-8 pt-8 border-t border-white/10 w-full">
              <p className="text-xs font-medium text-white/70">Pagará um total de <span className="font-bold text-white">{(months * payment).toLocaleString()} Kz</span> até ao fim.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* --- Utility Components --- */
const InputRange = ({ label, value, min, max, onChange, suffix }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <span className="text-sm font-black text-secondary">{value} {suffix}</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

const InputAmount = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase">Kz</div>
      <input 
        type="number" value={value} 
        onChange={e => onChange(parseFloat(e.target.value || 0))}
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-slate-200 outline-none transition-all"
      />
    </div>
  </div>
);

export default Simuladores;
