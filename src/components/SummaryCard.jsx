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
    <div className="bento-card flex flex-col justify-between h-48 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-secondary tracking-tight">
            {amount} <span className="text-sm font-normal text-slate-400">Kz</span>
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[colorClass] || colors.neutral}`}>
          <IconComp size={20} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-primary' : 'text-negative'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(percentage)}%</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">em relação ao mês passado</span>
      </div>

      {/* Decorative gradient background hover effect */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
};

export default SummaryCard;
