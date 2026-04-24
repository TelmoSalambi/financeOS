import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCard = ({ title, amount, percentage, icon: Icon, colorClass = 'primary' }) => {
  // Using Icon as a component is standard, but the linter might be confused.
  // I'll ensure it's treated as used.
  const IconComp = Icon;
  const isPositive = percentage > 0;
  
  const colors = {
    primary: 'bg-primary/10 text-primary',
    negative: 'bg-negative/10 text-negative',
    neutral: 'bg-slate-100 text-slate-500'
  };

  return (
    <div className="bento-card flex flex-col justify-between h-32 md:h-48 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1 truncate">
            {title}
          </p>
          <h3 className="text-lg md:text-2xl font-bold text-secondary tracking-tight truncate">
            {amount} <span className="text-xs md:text-sm font-normal text-slate-400">Kz</span>
          </h3>
        </div>
        <div className={`p-1.5 md:p-2 rounded-lg ${colors[colorClass] || colors.neutral} shrink-0`}>
          <IconComp size={16} className="md:w-5 md:h-5" />
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-4">
        <div className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs font-bold ${isPositive ? 'text-primary' : 'text-negative'}`}>
          {isPositive ? <TrendingUp size={12} className="md:w-3.5 md:h-3.5" /> : <TrendingDown size={12} className="md:w-3.5 md:h-3.5" />}
          <span>{Math.abs(percentage)}%</span>
        </div>
        <span className="text-[8px] md:text-[10px] text-slate-400 font-medium truncate">vs mês passado</span>
      </div>

      {/* Decorative gradient background hover effect */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
};

export default SummaryCard;
