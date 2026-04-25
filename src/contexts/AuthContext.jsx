import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  
  const initialized = useRef(false);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /**
   * Resolves the user profile with account_type.
   * Priority: profiles table → user_metadata → 'personal' default.
   * Auto-upserts missing profiles so the DB stays in sync.
   */
  const fetchProfile = async (currentUser) => {
    if (!currentUser?.id) return null;
    
    const meta = currentUser.user_metadata || {};
    console.log('[FinanceOS] user_metadata:', JSON.stringify(meta));

    // Build a fallback profile from metadata (always available)
    const metaProfile = {
      id: currentUser.id,
      account_type: meta.account_type || 'personal',
      full_name: meta.full_name || meta.name || '',
      company_name: meta.company_name || '',
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      console.log('[FinanceOS] profiles table result:', { data, error: error?.message });

      // If profile exists AND has a valid account_type, use it
      if (data && data.account_type) {
        console.log('[FinanceOS] Using DB profile, account_type:', data.account_type);
        return data;
      }

      // DB profile is missing or incomplete — try to upsert from metadata
      const accountType = meta.account_type || data?.account_type || 'personal';
      const profilePayload = {
        id: currentUser.id,
        full_name: meta.full_name || meta.name || data?.full_name || '',
        account_type: accountType,
        company_name: meta.company_name || data?.company_name || '',
        updated_at: new Date().toISOString(),
      };

      console.log('[FinanceOS] Upserting profile with:', profilePayload);

      const { data: upserted, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select()
        .single();

      if (upsertError) {
        console.warn('[FinanceOS] Upsert failed:', upsertError.message, '- using metadata fallback');
        return { ...metaProfile, ...(data || {}) , account_type: accountType };
      }

      console.log('[FinanceOS] Upserted profile:', upserted);
      return upserted;
    } catch (err) {
      console.error('[FinanceOS] fetchProfile crash:', err);
      console.log('[FinanceOS] Returning metadata fallback:', metaProfile);
      return metaProfile;
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
        const p = await fetchProfile(initialUser);
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
        
        if (newUser?.id !== userRef.current?.id) {
          setUser(newUser);
          if (newUser) {
            const p = await fetchProfile(newUser);
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

  // Derive account type — metadata is the MOST RELIABLE source since
  // signUp() always stores it there, regardless of DB triggers
  const accountType = user?.user_metadata?.account_type || profile?.account_type || 'personal';
  console.log('[FinanceOS] Final accountType resolution:', accountType, '| isBusiness:', accountType === 'business');

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading: !ready || loading, 
      isBusiness: accountType === 'business',
      isPersonal: accountType !== 'business',
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

