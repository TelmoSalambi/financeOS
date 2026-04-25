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
   * Fetches the user profile from the 'profiles' table.
   * If the profile doesn't exist or is missing account_type,
   * it falls back to user_metadata and upserts the profile.
   */
  const fetchProfile = async (currentUser) => {
    if (!currentUser?.id) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // If profile exists AND has account_type, use it directly
      if (data && data.account_type) {
        return data;
      }

      // ── FALLBACK: read from user_metadata (where signUp stores it) ──
      const meta = currentUser.user_metadata || {};
      const accountType = data?.account_type || meta.account_type || 'personal';
      const fullName = meta.full_name || meta.name || '';
      const companyName = meta.company_name || '';

      // Upsert the profile so future logins are instant
      const profilePayload = {
        id: currentUser.id,
        full_name: fullName,
        account_type: accountType,
        company_name: companyName,
        updated_at: new Date().toISOString(),
      };

      const { data: upserted, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select()
        .single();

      if (upsertError) {
        console.warn('Profile upsert failed:', upsertError.message);
        // Still return a usable profile object from metadata
        return { ...profilePayload, ...(data || {}) };
      }

      return upserted;
    } catch (err) {
      console.error('fetchProfile error:', err);
      // Absolute fallback — use metadata so the UI never breaks
      const meta = currentUser.user_metadata || {};
      return {
        id: currentUser.id,
        account_type: meta.account_type || 'personal',
        full_name: meta.full_name || meta.name || '',
        company_name: meta.company_name || '',
      };
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

  // Derive account type from the best available source
  const accountType = profile?.account_type || user?.user_metadata?.account_type || 'personal';

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

