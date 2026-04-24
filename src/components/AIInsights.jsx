import React, { useMemo } from 'react';
import { Lightbulb, TrendingDown, TrendingUp, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { subDays, isAfter, parseISO } from 'date-fns';

const AIInsights = ({ transactions }) => {
  const insights = useMemo(() => {
    if (transactions.length < 5) return null;

    const now = new Date();
    const last30Days = subDays(now, 30);
    const prev30Days = subDays(last30Days, 30);

    const currentSpent = transactions
      .filter(t => t.type === 'expense' && isAfter(parseISO(t.date), last30Days))
      .reduce((s, t) => s + Number(t.amount), 0);

    const previousSpent = transactions
      .filter(t => t.type === 'expense' && isAfter(parseISO(t.date), prev30Days) && !isAfter(parseISO(t.date), last30Days))
      .reduce((s, t) => s + Number(t.amount), 0);

    const diff = currentSpent - previousSpent;
    const diffPercent = previousSpent > 0 ? (diff / previousSpent) * 100 : 0;

    const results = [];

    // Trend Insight
    if (diff > 0) {
      results.push({
        type: 'warning',
        title: 'Aumento nos Gastos',
        text: `Os seus gastos subiram ${diffPercent.toFixed(1)}% (mais ${diff.toLocaleString('pt-BR')} Kz) em relação ao mês passado.`,
        icon: TrendingUp,
        color: 'text-negative',
        bg: 'bg-negative/5'
      });
    } else {
      results.push({
        type: 'success',
        title: 'Economia Detetada',
        text: `Parabéns! Gastou menos ${Math.abs(diffPercent).toFixed(1)}% do que no mês anterior.`,
        icon: TrendingDown,
        color: 'text-primary',
        bg: 'bg-primary/5'
      });
    }

    // Category Insight (Example logic)
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const name = t.categories?.name || 'Outros';
      catMap[name] = (catMap[name] || 0) + Number(t.amount);
    });

    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      results.push({
        type: 'info',
        title: `Foco em ${topCat[0]}`,
        text: `Esta categoria representa o seu maior volume de despesas (${topCat[1].toLocaleString('pt-BR')} Kz).`,
        icon: Lightbulb,
        color: 'text-amber-500',
        bg: 'bg-amber-500/5'
      });
    }

    return results;
  }, [transactions]);

  if (!insights) return (
    <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
      <Sparkles size={32} className="mx-auto mb-4 opacity-20" />
      <p className="text-sm font-medium italic">A carregar análise inteligente...</p>
      <p className="text-[10px] mt-1 uppercase tracking-widest font-bold">Mais transações necessárias</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sparkles size={18} className="text-primary animate-pulse" />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Insights por IA</h3>
      </div>
      
      {insights.map((insight, i) => (
        <div key={i} className={`p-5 rounded-3xl border border-transparent hover:border-slate-100 transition-all group ${insight.bg}`}>
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-white ${insight.color}`}>
              <insight.icon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-secondary text-sm group-hover:text-primary transition-colors">{insight.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">{insight.text}</p>
            </div>
          </div>
        </div>
      ))}

      <button className="w-full mt-4 flex items-center justify-between p-4 bg-secondary text-white rounded-2xl hover:bg-slate-800 transition-all group overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Próximo Passo</p>
          <p className="text-sm font-bold mt-1">Ver Plano de Poupança Completo</p>
        </div>
        <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
      </button>
    </div>
  );
};

export default AIInsights;
