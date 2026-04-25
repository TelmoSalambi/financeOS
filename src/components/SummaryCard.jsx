import React from 'react';

// FIX #5: Adicionado fallback para amount undefined/null.
// Antes: {amount} renderizava "undefined Kz" ou ficava em branco
// sem nenhum indicador visual de que os dados ainda não chegaram.
// Agora: mostra '—' enquanto o valor não está disponível.

const SummaryCard = ({ title, amount, percentage, icon: Icon, colorClass }) => {
  const colors = {
    primary:  'bg-primary/10 text-primary',
    negative: 'bg-negative/10 text-negative',
    amber:    'bg-amber-500/10 text-amber-500',
  };

  // Formata o valor ou devolve placeholder
  const displayAmount = amount != null ? amount : '—';

  return (
    <div className="bento-card p-5 md:p-6 group hover:translate-y-[-2px] transition-all">
      <div className="flex justify-between items-start mb-4">

        {/* Ícone */}
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${colors[colorClass] ?? colors.primary}`}>
          {Icon && <Icon size={20} className="md:w-6 md:h-6" />}
        </div>

        {/* Badge de percentagem — só mostra se for diferente de 0 e existir */}
        {percentage != null && percentage !== 0 && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
            percentage > 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}>
            {percentage > 0 ? '+' : ''}{percentage}%
          </span>
        )}
      </div>

      {/* Título */}
      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>

      {/* Valor */}
      <h3 className="text-xl md:text-2xl font-black text-secondary">
        {displayAmount}
        {amount != null && (
          <span className="text-[10px] md:text-xs font-normal opacity-40 ml-1">Kz</span>
        )}
      </h3>
    </div>
  );
};

export default SummaryCard;
