import React, { useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { BarChart3, Loader2, Download, FileText, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#10B981','#facc15','#fb7185','#8b5cf6','#3b82f6','#f97316','#14b8a6','#ec4899'];

const StatCard = ({ label, value, color }) => (
  <div className="bento-card text-center flex flex-col items-center justify-center py-8 hover:translate-y-[-4px] transition-all duration-300">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Relatorios = () => {
  const { transactions, balance, totalIncome, totalExpense, loading } = useFinancialStats();
  const reportRef = useRef();

  // Monthly bar chart data
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const key = t.date.slice(0, 7);
      if (!map[key]) map[key] = { month: key, receitas: 0, despesas: 0 };
      if (t.type === 'income') map[key].receitas += Number(t.amount);
      else map[key].despesas += Number(t.amount);
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(d => ({
        ...d,
        name: format(new Date(d.month + '-01'), 'MMM yy', { locale: ptBR }).toUpperCase()
      }));
  }, [transactions]);

  // Category pie chart data
  const categoryData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.categories?.name || 'Outros';
      map[cat] = (map[cat] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const exportCSV = () => {
    try {
      const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (Kz)'];
      const rows = transactions.map(t => [
        t.date,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.description || '',
        t.categories?.name || '',
        t.amount
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_financeiro_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.click();
      toast.success('CSV exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar CSV');
    }
  };

  const exportPDF = async () => {
    const toastId = toast.loading('A gerar relatório PDF...');
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio_financeiro_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF exportado com sucesso!', { id: toastId });
    } catch {
      toast.error('Erro ao exportar PDF', { id: toastId });
    }
  };


  if (loading) return (
    <Layout title="Relatórios">
      <div className="flex items-center justify-center h-80">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    </Layout>
  );

  return (
    <Layout title="Relatórios Analíticos">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-700">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary">Relatórios</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Análise inteligente da sua saúde financeira.</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button 
              onClick={exportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-xs md:text-sm"
            >
              <Download size={16} />
              CSV
            </button>
            <button 
              onClick={exportPDF}
              className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-secondary text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-secondary/10 text-xs md:text-sm"
            >
              <FileText size={16} />
              Relatório PDF
            </button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard label="Património Actual" value={`${balance.toLocaleString('pt-BR')} Kz`} color={balance >= 0 ? 'text-primary' : 'text-negative'} />
            <StatCard label="Total Entradas" value={`${totalIncome.toLocaleString('pt-BR')} Kz`} color="text-primary" />
            <StatCard label="Total Saídas" value={`${totalExpense.toLocaleString('pt-BR')} Kz`} color="text-negative" />
          </div>

          <div className="bento-card p-6 md:p-10">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-secondary">Comparativo Mensal</h3>
                <p className="text-xs text-slate-400 mt-1">Fluxo de caixa (6 meses)</p>
              </div>
              <BarChart3 className="text-slate-200" size={32} />
            </div>
            
            {monthlyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 md:h-64 text-slate-400 gap-3">
                <p className="text-sm">Sem dados suficientes.</p>
              </div>
            ) : (
              <div className="h-64 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={window.innerWidth < 640 ? 4 : 8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                      formatter={v => [`${Number(v).toLocaleString('pt-BR')} Kz`]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                    <Bar name="Entradas" dataKey="receitas" fill="#10B981" radius={[8,8,0,0]} barSize={window.innerWidth < 640 ? 12 : 24} />
                    <Bar name="Saídas" dataKey="despesas" fill="#fb7185" radius={[8,8,0,0]} barSize={window.innerWidth < 640 ? 12 : 24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bento-card p-6 md:p-10">
              <h3 className="text-lg md:text-xl font-bold text-secondary mb-1">Concentração</h3>
              <p className="text-xs text-slate-400 mb-8 md:mb-10">Proporção por categoria</p>
              
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Sem despesas.</div>
              ) : (
                <div className="h-64 md:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} innerRadius={window.innerWidth < 640 ? 60 : 80} outerRadius={window.innerWidth < 640 ? 90 : 110} paddingAngle={4} dataKey="value" stroke="none">
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                        formatter={v => [`${Number(v).toLocaleString('pt-BR')} Kz`]} 
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bento-card p-6 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-secondary">Performance</h3>
                  <p className="text-xs text-slate-400 mt-1">Maiores volumes financeiros</p>
                </div>
                <Share2 className="text-slate-200" size={24} />
              </div>
              
              <div className="space-y-5 md:space-y-6">
                {categoryData.slice(0, 6).map((cat, i) => {
                  const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                  return (
                    <div key={cat.name} className="group">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs md:text-sm font-bold text-secondary truncate max-w-[100px] md:max-w-none">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs md:text-sm font-black text-secondary">{cat.value.toLocaleString('pt-BR')} Kz</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 ml-1 md:ml-2">({pct.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
