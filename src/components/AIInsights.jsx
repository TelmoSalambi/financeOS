import React, { useMemo } from 'react';
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

// FIX #7: Threshold e textos isolados em constantes no topo do ficheiro.
// Facilita ajuste futuro sem ter de caçar valores espalhados pela lógica.
const EXPENSE_ALERT_THRESHOLD = 50_000; // Kz
const RESTAURANT_SAVING_RATE  = 0.10;   // 10%

// FIX #6: Keys baseadas em título estável em vez de índice do array.
// Índices como key causam re-renders incorretos quando a lista muda
// (reordenação, filtros) porque o React não consegue distinguir os elementos.

const AIInsights = ({ transactions }) => {
  const insights = useMemo(() => {
    if (!transactions?.length) return [];

    const results = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);

    // Alerta de gastos elevados
    if (totalExpenses > EXPENSE_ALERT_THRESHOLD) {
      results.push({
        id:    'alert-high-expenses',  // FIX #6: id estável como key
        title: 'Alerta de Gastos',
        text:  'Os seus gastos este mês estão 15% acima da média.',
        icon:  AlertTriangle,
        color: 'text-amber-500',
      });
    }

    // Calcular potencial poupança em Restaurantes
    const restaurantExpenses = expenses
      .filter(t => t.categories?.name?.toLowerCase().includes('restaurante'))
      .reduce((s, t) => s + Number(t.amount), 0);

    const potentialSaving = Math.round(restaurantExpenses * RESTAURANT_SAVING_RATE);

    results.push({
      id:    'tip-restaurant-saving',  // FIX #6: id estável como key
      title: 'Dica de Poupança',
      text:  potentialSaving > 0
        ? `Se reduzir ${Math.round(RESTAURANT_SAVING_RATE * 100)}% em Restaurantes, poupará ${potentialSaving.toLocaleString('pt-AO')} Kz/mês.`
        : 'Regista as tuas despesas regularmente para receberes dicas personalizadas.',
      icon:  Sparkles,
      color: 'text-primary',
    });

    // Tendência positiva — saldo crescente
    const incomes = transactions.filter(t => t.type === 'income');
    const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
    if (totalIncome > totalExpenses) {
      results.push({
        id:    'tip-positive-balance',
        title: 'Saldo Positivo',
        text:  'Estás a gastar menos do que ganhas. Considera investir o excedente.',
        icon:  TrendingUp,
        color: 'text-emerald-500',
      });
    } else if (totalExpenses > totalIncome && totalIncome > 0) {
      results.push({
        id:    'alert-negative-balance',
        title: 'Atenção ao Saldo',
        text:  'Os teus gastos superam as receitas. Revê as despesas fixas.',
        icon:  TrendingDown,
        color: 'text-negative',
      });
    }

    return results;
  }, [transactions]);

  if (!insights.length) return null;

  return (
    <div className="bento-card bg-secondary text-white border-none">
      <h3 className="flex items-center gap-2 font-bold mb-4">
        <Sparkles size={18} className="text-primary" />
        Insights IA
      </h3>

      <div className="space-y-4">
        {/* FIX #6: key={ins.id} em vez de key={i} — estável e sem warnings */}
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase mb-1 ${ins.color}`}>
              <ins.icon size={12} />
              {ins.title}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ins.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
