import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Save, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { toast } from 'sonner';

const Importar = () => {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // FIX #30 & #31: Parser de CSV robusto
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    // Tentar detectar o delimitador (vírgula ou ponto-e-vírgula)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';
    
    const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));
    
    return lines.slice(1).map(line => {
      // Regex simples para lidar com valores entre aspas que contêm o delimitador
      const values = line.split(new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`)).map(v => v.trim().replace(/["']/g, ''));
      
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i];
      });
      
      const rawAmount = (obj.valor || obj.amount || '0').replace(/[^\d.,-]/g, '').replace(',', '.');
      
      return {
        date: obj.data || obj.date || new Date().toISOString().split('T')[0],
        description: obj.descricao || obj.description || 'Transação Importada',
        amount: Math.abs(parseFloat(rawAmount)) || 0,
        type: (obj.tipo || obj.type || (parseFloat(rawAmount) >= 0 ? 'income' : 'expense')).toLowerCase().includes('rec') || (obj.tipo || obj.type || '').toLowerCase().includes('inc') ? 'income' : 'expense',
        category_name: obj.categoria || obj.category || 'Outros'
      };
    });
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = parseCSV(event.target.result);
        if (data.length === 0) throw new Error('Ficheiro vazio ou formato inválido.');
        setPreview(data);
        toast.success(`Detectadas ${data.length} transações.`);
      } catch (err) {
        toast.error(err.message || 'Erro ao processar CSV.');
        setFile(null);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleSaveAll = async () => {
    if (!preview.length || !user?.id) return;
    setIsSaving(true);

    try {
      const transactionsToInsert = preview.map(p => {
        const cat = categories.find(c => c.name.toLowerCase() === p.category_name.toLowerCase()) || 
                    categories.find(c => c.name === 'Outros');
        
        return {
          user_id: user.id,
          date: p.date,
          description: p.description,
          amount: p.amount,
          type: p.type,
          category_id: cat?.id || categories[0]?.id
        };
      });

      // FIX #32: Inserção em blocos de 50 para evitar timeouts e facilitar debug
      const chunkSize = 50;
      for (let i = 0; i < transactionsToInsert.length; i += chunkSize) {
        const chunk = transactionsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('transactions').insert(chunk);
        if (error) throw error;
      }

      toast.success('Importação concluída com sucesso!');
      setPreview([]);
      setFile(null);
      window.dispatchEvent(new CustomEvent('finance-stats-updated'));
    } catch (error) {
      toast.error('Erro na importação: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // FIX #34: Preview limitado para performance
  const displayPreview = useMemo(() => preview.slice(0, 100), [preview]);

  return (
    <Layout title="Importação Profissional">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-black text-secondary tracking-tight">Importar Dados</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">Migre os seus extratos bancários para o FinanceOS em segundos.</p>
        </div>

        {!file ? (
          <div className="px-4">
            <div className="bento-card py-20 md:py-28 flex flex-col items-center border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary transition-all cursor-pointer relative text-center group">
              <input 
                type="file" accept=".csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform">
                <Upload size={40} />
              </div>
              <h3 className="text-xl font-black text-secondary">Selecione o seu ficheiro CSV</h3>
              <p className="text-sm text-slate-400 mt-2 font-medium">Arraste ou clique para explorar</p>
              
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <CheckCircle2 size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Delimitador</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <CheckCircle2 size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">UTF-8 Ready</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="font-black text-secondary text-lg truncate max-w-[200px] md:max-w-md">{file.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{preview.length} registos identificados</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => { setFile(null); setPreview([]); }}
                  className="flex-1 md:flex-none px-6 py-4 text-sm font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancelar
                </button>
                <button 
                  onClick={handleSaveAll}
                  disabled={isSaving || preview.length === 0}
                  className="flex-[2] md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Importar Dados</>}
                </button>
              </div>
            </div>

            <div className="bento-card !p-0 overflow-hidden shadow-2xl shadow-slate-200/40 border-none">
              <div className="hidden md:grid px-8 py-5 border-b border-slate-100 bg-slate-50/50 grid-cols-12 gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 col-span-2">Data</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 col-span-5">Descrição</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 col-span-2">Categoria</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 col-span-3 text-right">Valor</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                {displayPreview.map((p, i) => (
                  <div key={i} className="px-5 md:px-8 py-5 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 md:items-center hover:bg-slate-50/50 transition-colors relative group">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 md:text-slate-500 col-span-2 uppercase tracking-tighter">
                      {p.date}
                    </span>
                    <div className="md:col-span-5 min-w-0">
                      <span className="text-sm font-black text-secondary truncate block">{p.description}</span>
                      <span className="md:hidden text-[9px] font-bold text-primary uppercase tracking-widest mt-1 block">{p.category_name}</span>
                    </div>
                    <span className="hidden md:block text-[10px] font-black text-primary col-span-2 uppercase truncate tracking-widest">{p.category_name}</span>
                    <div className="flex md:block items-center justify-between md:col-span-3 md:text-right">
                      <span className="md:hidden text-[9px] font-black text-slate-300 uppercase">Quantia</span>
                      <span className={`text-base md:text-sm font-black ${p.type === 'income' ? 'text-primary' : 'text-negative'}`}>
                        {p.type === 'income' ? '+' : '-'}{Number(p.amount).toLocaleString('pt-BR')} <span className="text-[10px] font-normal">Kz</span>
                      </span>
                    </div>
                  </div>
                ))}
                
                {preview.length > 100 && (
                  <div className="p-8 text-center bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Exibindo as primeiras 100 de {preview.length} linhas. TUDO será importado ao clicar em "Guardar".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Importar;
