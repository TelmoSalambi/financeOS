import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import Relatorios from './pages/Relatorios';
import Historico from './pages/Historico';
import Orcamentos from './pages/Orcamentos';
import Metas from './pages/Metas';
import Importar from './pages/Importar';
import Configuracoes from './pages/Configuracoes';
import Simuladores from './pages/Simuladores';
import MeusClientes from './pages/MeusClientes';
import ClienteDetalhe from './pages/ClienteDetalhe';

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
          <div className="w-16 h-16 bg-negative/10 text-negative rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="text-2xl font-black text-secondary mb-2">Ops! Algo correu mal.</h1>
          <p className="text-slate-500 max-w-md mb-8">
            Ocorreu um erro ao carregar esta página. Tente recarregar ou contacte o suporte se o problema persistir.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Recarregar Sistema
          </button>
          <pre className="mt-8 p-4 bg-slate-100 rounded-xl text-[10px] text-slate-400 overflow-auto max-w-xl text-left">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/**
 * Dynamic Home component that decides which dashboard to show
 * based on the user's account type.
 */
const Home = () => {
  const { isBusiness, loading, accountTypeReady } = useAuth();

  if (loading || !accountTypeReady) return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-xl shadow-primary/20"></div>
    </div>
  );

  return isBusiness ? <MeusClientes /> : <Dashboard />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/receitas" element={<ProtectedRoute><Receitas /></ProtectedRoute>} />
            <Route path="/despesas" element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/orcamentos" element={<ProtectedRoute><Orcamentos /></ProtectedRoute>} />
            <Route path="/metas" element={<ProtectedRoute><Metas /></ProtectedRoute>} />
            <Route path="/importar" element={<ProtectedRoute><Importar /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            
            <Route path="/simuladores" element={<ProtectedRoute><Simuladores /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><MeusClientes /></ProtectedRoute>} />
            <Route path="/clientes/:id" element={<ProtectedRoute><ClienteDetalhe /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          theme="light"
          toastOptions={{
            style: { borderRadius: '1.25rem', padding: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
