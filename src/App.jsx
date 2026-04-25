import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Páginas
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Receitas       from './pages/Receitas';
import Despesas       from './pages/Despesas';
import Relatorios     from './pages/Relatorios';
import Configuracoes  from './pages/Configuracoes';
import Simuladores    from './pages/Simuladores';
import Metas          from './pages/Metas';
import Orcamentos     from './pages/Orcamentos';
import Importar       from './pages/Importar';
import MeusClientes   from './pages/MeusClientes';
import ClienteDetalhe from './pages/ClienteDetalhe';
import Historico      from './pages/Historico';

// ─────────────────────────────────────────────
// Spinner reutilizável
// ─────────────────────────────────────────────
const Spinner = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-xl shadow-primary/20" />
  </div>
);

// ─────────────────────────────────────────────
// ProtectedRoute
// FIX #4: Agora espera também por accountTypeReady.
//
// PROBLEMA ANTERIOR: só verificava `loading`.
// Como `loading` pode tornar-se false antes de `accountTypeReady`
// ser true (ex: perfil ainda a carregar), componentes como
// MeusClientes ou Dashboard podiam renderizar com isBusiness=false
// mesmo para utilizadores business — causando flash do ecrã errado
// ou acesso indevido a rotas restritas.
//
// CORREÇÃO: bloqueia até que AMBOS loading=false E accountTypeReady=true.
// ─────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading, accountTypeReady } = useAuth();

  // Aguarda sessão E tipo de conta resolvidos
  if (loading || !accountTypeReady) return <Spinner />;

  // Sem sessão → redireciona para login
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// ─────────────────────────────────────────────
// Home — decisor de rota raiz "/"
// Decide entre Dashboard pessoal e MeusClientes (business)
// com base no tipo de conta já resolvido.
// ─────────────────────────────────────────────
const Home = () => {
  const { isBusiness, loading, accountTypeReady } = useAuth();

  // ProtectedRoute já garante que chegamos aqui com tudo pronto,
  // mas mantemos a guarda por segurança (ex: uso direto do componente)
  if (loading || !accountTypeReady) return <Spinner />;

  return isBusiness ? <MeusClientes /> : <Dashboard />;
};

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rota raiz — decide entre business e personal */}
            <Route path="/" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />

            {/* Rotas pessoais */}
            <Route path="/receitas"     element={<ProtectedRoute><Receitas /></ProtectedRoute>} />
            <Route path="/despesas"     element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
            <Route path="/relatorios"   element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/simuladores"  element={<ProtectedRoute><Simuladores /></ProtectedRoute>} />
            <Route path="/metas"        element={<ProtectedRoute><Metas /></ProtectedRoute>} />
            <Route path="/orcamentos"   element={<ProtectedRoute><Orcamentos /></ProtectedRoute>} />
            <Route path="/importar"     element={<ProtectedRoute><Importar /></ProtectedRoute>} />
            <Route path="/historico"    element={<ProtectedRoute><Historico /></ProtectedRoute>} />

            {/* Rotas business */}
            <Route path="/clientes"     element={<ProtectedRoute><MeusClientes /></ProtectedRoute>} />
            <Route path="/clientes/:id" element={<ProtectedRoute><ClienteDetalhe /></ProtectedRoute>} />

            {/* Fallback — qualquer rota desconhecida volta para "/" */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
