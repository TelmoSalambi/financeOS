import React, { useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subMonths, isAfter, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, Loader2, Download, FileText, Share2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#10B981','#facc15','#fb7185','#8b5cf6','#3b82f6','#f97316','#14b8a6','#ec4899'];

const StatCard = ({ label, value, color }) => (
  <div className="bento-card text-center flex flex-col items-center justify-center py-8 hover:translate-y-[-4px] transition-all duration-300">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
    <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

const Relatorios = () => {
  const { transactions, balance, totalIncome, totalExpense, loading } = useFinancialStats();
  const reportRef = useRef();
  const isMobile = useIsMobile(640);
  
  // FIX #47: Filtro de Período para Relatórios Úteis
  const [period, setPeriod] = useState('6M'); // 1M, 3M, 6M, ALL

  const filteredByPeriod = useMemo(() => {
    if (period === 'ALL') return transactions;
    const now = new Date();
    let startDate;
    if (period === '1M') startDate = startOfMonth(now);
    else if (period === '3M') startDate = subMonths(now, 3);
    else if (period === '6M') startDate = subMonths(now, 6);
    
    return transactions.filter(t => isAfter(new Date(t.date), startDate));
  }, [transactions, period]);

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

  // Category pie chart data — FIX #47: Usa dados filtrados por período
  const categoryData = useMemo(() => {
    const map = {};
    filteredByPeriod.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.categories?.name || 'Outros';
      map[cat] = (map[cat] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredByPeriod]);

  // FIX #45: Exportação CSV robusta (com aspas)
  const exportCSV = () => {
    try {
      const headers = ['Data', 'Tipo', 'Descricao', 'Categoria', 'Valor (Kz)'];
      const rows = transactions.map(t => [
        t.date,
        t.type === 'income' ? 'Receita' : 'Despesa',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.categories?.name || '').replace(/"/g, '""')}"`,
        t.amount
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_financeiro_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.click();
      toast.success('Ficheiro CSV exportado!');
    } catch {
      toast.error('Erro na exportação CSV');
    }
  };

  const exportPDF = async () => {
    const toastId = toast.loading('A preparar relatório premium...');
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc' 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`financeos_relatorio_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: toastId });
    } catch (err) {
      toast.error('Erro ao gerar PDF', { id: toastId });
    }
  };

  if (loading) return (
    <Layout title="Relatórios">
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <Loader2 className="animate-spin text-primary opacity-20" size={48} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Processando dados analíticos...</p>
      </div>
    </Layout>
  );

  return (
    <Layout title="Relatórios Analíticos">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-20">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 px-4 md:px-0">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Relatórios</h1>
            <p className="text-slate-500 mt-1 font-medium">Análise estratégica da sua performance.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all text-xs"
            >
              <Download size={18} /> CSV
            </button>
            <button 
              onClick={exportPDF}
              className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-secondary/20 text-xs"
            >
              <FileText size={18} /> PDF Premium
            </button>
          </div>
        </div>

        {/* Período Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] mb-8 w-fit mx-4 md:mx-0">
          {[
            { id: '1M', label: 'Este Mês' },
            { id: '3M', label: '3 Meses' },
            { id: '6M', label: '6 Meses' },
            { id: 'ALL', label: 'Tudo' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${period === p.id ? 'bg-white text-secondary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div ref={reportRef} className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-0">
            <StatCard label="Património Actual" value={`${balance.toLocaleString('pt-BR')} Kz`} color={balance >= 0 ? 'text-primary' : 'text-negative'} />
            <StatCard label="Entradas (Período)" value={`${totalIncome.toLocaleString('pt-BR')} Kz`} color="text-primary" />
            <StatCard label="Saídas (Período)" value={`${totalExpense.toLocaleString('pt-BR')} Kz`} color="text-negative" />
          </div>

          <div className="bento-card p-8 md:p-12 mx-4 md:mx-0">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-secondary">Comparativo Mensal</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fluxo de caixa nos últimos 6 meses</p>
              </div>
              <BarChart3 className="text-slate-100" size={32} />
            </div>
            
            {monthlyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic">Sem dados.</div>
            ) : (
              <div className="h-64 md:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={isMobile ? 4 : 10}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} width={35} />
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                      itemStyle={{ fontWeight: '900', fontSize: '13px' }}
                      formatter={v => [`${Number(v).toLocaleString('pt-BR')} Kz`]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '25px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar name="Receitas" dataKey="receitas" fill="#10B981" radius={[8,8,0,0]} barSize={isMobile ? 12 : 28} />
                    <Bar name="Despesas" dataKey="despesas" fill="#fb7185" radius={[8,8,0,0]} barSize={isMobile ? 12 : 28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-0">
            <div className="bento-card p-8 md:p-12">
              <h3 className="text-xl font-black text-secondary mb-1">Concentração</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">Proporção por categoria ({period})</p>
              
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-slate-400 italic">Sem despesas.</div>
              ) : (
                <div className="h-72 md:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={isMobile ? 60 : 90}
                        outerRadius={isMobile ? 90 : 130}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                        formatter={v => [`${Number(v).toLocaleString('pt-BR')} Kz`]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bento-card p-8 md:p-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-secondary tracking-tight">Performance</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ranking de gastos ({period})</p>
                </div>
                <Share2 className="text-slate-100" size={32} />
              </div>
              
              <div className="space-y-6 md:space-y-8">
                {categoryData.slice(0, 5).map((cat, i) => {
                  const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                  return (
                    <div key={cat.name} className="group">
                      <div className="flex justify-between mb-2 items-end">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-black text-secondary truncate max-w-[150px]">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-secondary">{cat.value.toLocaleString('pt-BR')} Kz</span>
                          <span className="text-[10px] font-bold text-slate-400 ml-2 tracking-widest">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
