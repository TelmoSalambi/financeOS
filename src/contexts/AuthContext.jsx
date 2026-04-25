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
    if (!currentUser?.id) return null;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // Perfil existe e tem account_type → retorna imediatamente
      if (data?.account_type) return data;

      // Perfil ainda não existe (ex: primeiro login com Google).
      // Cria-o a partir dos metadados guardados no registo.
      const meta = currentUser.user_metadata || {};
      const payload = {
        id:           currentUser.id,
        full_name:    meta.full_name || meta.name || '',
        account_type: meta.account_type || 'personal',
        company_name: meta.company_name || '',
        updated_at:   new Date().toISOString(),
      };

      const { data: upserted } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      return upserted || payload;

    } catch (err) {
      console.error('[Auth] fetchProfile error:', err);
      return null;
    }
  };

  // ─────────────────────────────────────────────
  // Inicialização + listener de estado de auth
  // ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (initialized.current) return;
      initialized.current = true;

      try {
        // Lê a sessão existente (ex: utilizador que já tinha sessão guardada)
        const { data: { session } } = await supabase.auth.getSession();
        const initialUser = session?.user ?? null;

        if (initialUser && mounted) {
          setUser(initialUser);
          const p = await fetchProfile(initialUser);
          if (mounted) setProfile(p);
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
      } finally {
        // Só marca como pronto DEPOIS de carregar o perfil inicial
        if (mounted) {
          setLoading(false);
          setReady(true);
        }
      }

      // FIX #1: Guardar a subscription para poder cancelar no cleanup.
      // Antes: supabase.auth.onAuthStateChange(...) sem guardar o retorno.
      // O listener ficava ativo para sempre — mesmo após logout ou hot-reload —
      // causando memory leaks e chamadas a setState em componentes destruídos.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          const newUser = session?.user ?? null;

          // Só reage se o utilizador mudou de facto (login/logout)
          // Evita re-renders desnecessários em refreshes de token
          if (newUser?.id !== userRef.current?.id) {

            // FIX #2 (parte 1): Resetar AMBOS loading e ready durante a troca.
            // Antes: só setLoading(true) mas ready ficava true.
            // Como accountType depende de ready, ele resolvia com profile=null
            // e devolvia 'personal' antes do fetchProfile terminar.
            setLoading(true);
            setReady(false);
            setUser(newUser);

            if (newUser) {
              const p = await fetchProfile(newUser);
              if (mounted) setProfile(p);
            } else {
              setProfile(null);
            }

            // FIX #2 (parte 2): Só libertar quando o perfil já chegou.
            if (mounted) {
              setLoading(false);
              setReady(true);
            }
          }

          // Logout explícito — limpar tudo
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setLoading(false);
            setReady(true);
          }
        }
      );

      // FIX #1 (continuação): Cancelar o listener quando o componente desmonta.
      // Sem isto, o listener disparava indefinidamente após hot-reload ou logout.
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    init();
  }, []);

  // ─────────────────────────────────────────────
  // Funções de auth
  // ─────────────────────────────────────────────
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, fullName, accountType, companyName) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:    fullName,
          account_type: accountType,   // 'business' ou 'personal'
          company_name: companyName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

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
      await supabase.from('profiles').delete().eq('id', user.id);
      await signOut();
    } catch (error) {
      console.error('[Auth] deleteAccount error:', error);
      await signOut();
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
    if (user && !profile)    return null; // perfil ainda não carregou
    if (!user)               return null; // não autenticado

    // A BD (profiles) é a fonte de verdade.
    // Os metadados são fallback para quando o perfil ainda não foi criado.
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
