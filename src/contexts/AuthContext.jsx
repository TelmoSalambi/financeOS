import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady]     = useState(false);

  const initialized = useRef(false);
  const userRef     = useRef(user);

  // Mantém userRef sincronizado para comparar dentro do listener
  // sem criar dependências que re-disparem o useEffect
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ─────────────────────────────────────────────
  // fetchProfile
  // Tenta ler o perfil da BD. Se não existir, cria-o
  // a partir dos metadados do Supabase Auth (registo).
  // ─────────────────────────────────────────────
  const fetchProfile = async (currentUser) => {
    try {
      console.log('🔍 [DEBUG] Iniciando fetchProfile para:', currentUser.email);
      setReady(false);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.warn('[Auth] Perfil não encontrado ou erro:', error.message);
        // Tenta criar se não existir
        if (error.code === 'PGRST116') {
          console.log('[Auth] Criando novo perfil a partir de metadados...');
          const meta = currentUser.user_metadata || {};
          
          // Debug para vermos o que o Supabase está a devolver
          console.log('[Auth] Metadados detetados:', meta);

          const payload = {
            id:           currentUser.id,
            full_name:    meta.full_name || meta.name || '',
            account_type: meta.account_type || 'personal', // Aqui o meta.account_type DEVE ser 'business'
            company_name: meta.company_name || '',
            updated_at:   new Date().toISOString(),
          };

          const { data: upserted } = await supabase
            .from('profiles')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single();
          
          if (upserted) setProfile(upserted);
          return upserted || payload;
        }
      }

      if (data) {
        console.log('[Auth] Perfil carregado com sucesso:', data.account_type);
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.error('[Auth] Erro fatal no fetchProfile:', err);
      return null;
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  // ─────────────────────────────────────────────
  // Inicialização + listener de estado de auth
  // ─────────────────────────────────────────────
  useEffect(() => {
    console.log('[Auth] Inicializando listener de autenticação...');
    let mounted = true;

    // Timeout de emergência: se o Supabase não responder em 5s, liberta o ecrã
    const emergencyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Timeout de 5s atingido. Forçando libertação do ecrã.');
        setLoading(false);
        setReady(true);
      }
    }, 5000);
    
    const initAuth = async () => {
      try {
        console.log('[Auth] Verificando sessão atual...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(emergencyTimeout); // Cancelar timeout se responder a tempo

        if (error) {
          console.error('[Auth] Erro ao obter sessão:', error.message);
          if (mounted) {
            setLoading(false);
            setReady(true);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('[Auth] Utilizador encontrado:', session.user.email);
          setUser(session.user);
          await fetchProfile(session.user);
        } else if (mounted) {
          console.log('[Auth] Nenhum utilizador logado.');
          setLoading(false);
          setReady(true);
        }
      } catch (err) {
        console.error('[Auth] Erro crítico na inicialização:', err);
        if (mounted) {
          setLoading(false);
          setReady(true);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        const newUser = session?.user ?? null;

        if (newUser?.id !== userRef.current?.id) {
          setLoading(true);
          setReady(false);
          setUser(newUser);

          if (newUser) {
            const p = await fetchProfile(newUser);
            if (mounted) setProfile(p);
          } else {
            setProfile(null);
            setLoading(false);
            setReady(true);
          }
        }

        if (event === 'SIGNED_OUT' && mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(emergencyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // ─────────────────────────────────────────────
  // Funções de auth
  // ─────────────────────────────────────────────
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, fullName, accountType, companyName) => {
    console.log('🔍 [DEBUG] Chamando supabase.auth.signUp...');
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:    fullName,
          account_type: accountType,
          company_name: companyName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
  };

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' },
      },
    });

  // FIX #3: signOut com lógica real.
  // Antes: estava vazio (/* ... logout logic ... */) dentro do useMemo,
  // por isso clicar em "Sair" não fazia absolutamente nada.
  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      setProfile(null);
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('[Auth] signOut error:', error);
      window.location.href = '/login';
    }
  };

  // FIX #3: deleteAccount com lógica real.
  // Antes: também estava vazio no useMemo.
  const deleteAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('[Auth] Iniciando eliminação de conta para:', user.id);
      
      // 1. Apagar transações primeiro (evita erros de chave estrangeira)
      await supabase.from('transactions').delete().eq('user_id', user.id);
      
      // 2. Apagar categorias personalizadas
      await supabase.from('categories').delete().eq('user_id', user.id);

      // 3. Apagar perfil
      await supabase.from('profiles').delete().eq('id', user.id);

      // 4. Logout total
      await signOut();
      
      alert('A sua conta e dados foram eliminados com sucesso.');
    } catch (error) {
      console.error('[Auth] Erro ao eliminar conta:', error);
      alert('Ocorreu um erro ao eliminar os dados. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Resolução do tipo de conta
  // ─────────────────────────────────────────────

  // FIX #2 (parte 3):
  //
  // PROBLEMA ANTERIOR: a condição era apenas (ready && !loading && user),
  // o que permitia resolver 'personal' quando profile ainda era null —
  // porque o fetchProfile ainda estava a correr.
  //
  // CORREÇÃO: condições explícitas e separadas:
  //   1. Se não está pronto ou ainda está a carregar → null (aguarda)
  //   2. Se user existe mas profile ainda não chegou → null (aguarda)
  //   3. Se não há user → null (não autenticado)
  //   4. Só então resolver o tipo — BD tem prioridade sobre metadados
  //      (metadados podem ser antigos ou inexistentes no Google OAuth)
  const accountType = useMemo(() => {
    if (!ready || loading)   return null; // ainda a inicializar
    
    // Se não há utilizador, o tipo é 'guest' (convidado), mas já está RESOLVIDO
    if (!user)               return 'guest'; 

    // Se há utilizador mas o perfil ainda está a vir da BD
    if (user && !profile)    return null; 

    return profile?.account_type
        || user?.user_metadata?.account_type
        || 'personal';

  }, [user, profile, ready, loading]);

  // ─────────────────────────────────────────────
  // Valor exposto ao contexto
  // ─────────────────────────────────────────────
  const value = useMemo(() => ({
    user,
    profile,

    // loading público: true enquanto !ready OU loading interno
    // Garante que qualquer componente que use useAuth() espera
    // que TUDO esteja pronto antes de renderizar
    loading: !ready || loading,

    // accountTypeReady: true quando o tipo de conta foi resolvido com certeza
    // Usado no Home e ProtectedRoute para não redirecionar prematuramente
    accountTypeReady: accountType !== null,

    isBusiness: accountType === 'business',
    isPersonal:  accountType === 'personal',

    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    deleteAccount,
  }), [user, profile, ready, loading, accountType]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
