import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Plus, ArrowRight, Save, Trash2 } from 'lucide-react';
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

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = values[i];
          });
          
          // Basic mapping and validation
          return {
            date: obj.data || obj.date || new Date().toISOString().split('T')[0],
            description: obj.descricao || obj.description || '',
            amount: parseFloat((obj.valor || obj.amount || '0').replace(',', '.')),
            type: (obj.tipo || obj.type || 'expense').toLowerCase().includes('rec') ? 'income' : 'expense',
            category_name: obj.categoria || obj.category || 'Outros',
            valid: true
          };
        });

        setPreview(data);
        toast.success(`Detectadas ${data.length} transações.`);
      } catch {
        toast.error('Erro ao processar ficheiro CSV. Verifique o formato.');
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleSaveAll = async () => {
    if (!preview.length) return;
    setIsSaving(true);

    try {
      const transactionsToInsert = preview.map(p => {
        const cat = categories.find(c => c.name.toLowerCase() === p.category_name.toLowerCase()) || 
                    categories.find(c => c.name === 'Outros');
        
        return {
          user_id: user?.id,
          date: p.date,
          description: p.description,
          amount: p.amount,
          type: p.type,
          category_id: cat?.id
        };
      });

      const { error } = await supabase.from('transactions').insert(transactionsToInsert);
      if (error) throw error;

      toast.success('Todas as transações foram importadas com sucesso!');
      setPreview([]);
      setFile(null);
    } catch (error) {
      toast.error('Erro ao guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const removeItem = (index) => {
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout title="Importação de Dados">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 md:mb-10 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Importar CSV</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Poupe tempo importando os seus extratos bancários ou planilhas diretamente para o sistema.</p>
        </div>

        {!file ? (
          <div className="px-4">
            <div className="bento-card py-16 md:py-20 flex flex-col items-center border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer relative text-center">
              <input 
                type="file" accept=".csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
                <Upload size={32} md:size={40} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-secondary">Arraste o seu ficheiro CSV aqui</h3>
              <p className="text-xs md:text-sm text-slate-400 mt-2">Ou clique para navegar no seu computador</p>
              <div className="mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Suporta UTF-8</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Delimitador Vírgula</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-secondary truncate">{file.name}</h3>
                  <p className="text-xs text-slate-400">{preview.length} registos detectados</p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button 
                  onClick={() => { setFile(null); setPreview([]); }}
                  className="flex-1 md:flex-none px-5 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveAll}
                  disabled={isSaving || preview.length === 0}
                  className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] md:hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Importar Tudo</>}
                </button>
              </div>
            </div>

            <div className="bento-card !p-0 overflow-hidden shadow-xl shadow-slate-200/40">
              {/* Desktop Header */}
              <div className="hidden md:grid px-8 py-4 border-b border-slate-100 bg-slate-50/50 grid-cols-12 gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-2">Data</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-4">Descrição</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-2">Categoria</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-1">Tipo</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 col-span-2 text-right">Valor</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Acção</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar">
                {preview.map((p, i) => (
                  <div key={i} className="px-5 md:px-8 py-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 md:items-center hover:bg-slate-50/50 transition-colors relative group">
                    {/* Mobile Row 1 */}
                    <div className="flex justify-between items-start md:hidden">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.date}</span>
                      <button onClick={() => removeItem(i)} className="p-1 text-slate-300 hover:text-negative">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {/* Desktop Content & Shared Content */}
                    <span className="hidden md:block text-xs font-semibold text-slate-500 col-span-2">{p.date}</span>
                    <div className="md:col-span-4 min-w-0">
                      <span className="text-sm font-bold text-secondary truncate block">{p.description}</span>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{p.category_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${p.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                          {p.type === 'income' ? 'REC' : 'DES'}
                        </span>
                      </div>
                    </div>
                    <span className="hidden md:block text-xs font-bold text-slate-400 col-span-2 uppercase truncate">{p.category_name}</span>
                    <div className="hidden md:block col-span-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${p.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                        {p.type === 'income' ? 'REC' : 'DES'}
                      </span>
                    </div>
                    <div className="flex md:block items-center justify-between md:col-span-2 md:text-right">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Valor</span>
                      <span className={`text-sm md:text-sm font-black md:font-bold ${p.type === 'income' ? 'text-primary' : 'text-negative'}`}>
                        {p.type === 'income' ? '+' : '-'}{Number(p.amount).toLocaleString('pt-BR')} Kz
                      </span>
                    </div>
                    <div className="hidden md:flex justify-center col-span-1">
                      <button onClick={() => removeItem(i)} className="p-2 text-slate-300 hover:text-negative hover:bg-negative/5 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="p-5 md:p-6 bg-primary/5 rounded-2xl flex gap-4 border border-primary/10">
                <CheckCircle2 size={24} className="text-primary shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-secondary">Verificação Automática</h4>
                  <p className="text-xs text-slate-500 mt-1">O sistema mapeia datas e categorias automaticamente.</p>
                </div>
              </div>
              <div className="p-5 md:p-6 bg-secondary/5 rounded-2xl flex gap-4 border border-secondary/10">
                <AlertCircle size={24} className="text-secondary shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-secondary">Categorias "Outros"</h4>
                  <p className="text-xs text-slate-500 mt-1">Categorias não identificadas podem ser editadas depois.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Importar;
