import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  
  const initialized = useRef(false);

  const fetchProfile = async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return error ? null : data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (initialized.current) return;
      initialized.current = true;

      // 1. Immediate Session Check
      const { data: { session } } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;
      
      if (initialUser && mounted) {
        setUser(initialUser);
        const p = await fetchProfile(initialUser.id);
        if (mounted) setProfile(p);
      }
      
      if (mounted) {
        setLoading(false);
        setReady(true);
      }

      // 2. Realtime Auth Listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        const newUser = session?.user ?? null;
        
        if (newUser?.id !== user?.id) {
          setUser(newUser);
          if (newUser) {
            const p = await fetchProfile(newUser.id);
            if (mounted) setProfile(p);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    init();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  
  const signUp = (email, password, fullName, accountType, companyName) => 
    supabase.auth.signUp({
      email, 
      password, 
      options: { 
        data: { 
          full_name: fullName, 
          account_type: accountType, 
          company_name: companyName 
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

  const signInWithGoogle = () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' }
      }
    });

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Limpeza atómica instantânea do React
      setUser(null);
      setProfile(null);
      
      // Limpar todos os storages
      localStorage.clear();
      sessionStorage.clear();
      
      // Tentar terminar a sessão no servidor, mas com timeout de segurança (máx 1s)
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      // Redirecionamento duro
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading: !ready || loading, 
      isBusiness: profile?.account_type === 'business',
      isPersonal: profile?.account_type !== 'business',
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
