import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 text-center animate-in zoom-in duration-500 border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-100/50">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-2xl font-black text-secondary mb-4 tracking-tight">Ups! Algo correu mal.</h1>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Ocorreu um erro inesperado na interface. Não se preocupe, os seus dados financeiros estão seguros.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <RefreshCcw size={18} />
                Tentar Novamente
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                <Home size={18} />
                Voltar ao Início
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-600 break-all">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
