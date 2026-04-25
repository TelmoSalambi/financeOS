import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
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
   * Resolves the user profile and ensures DB sync.
   */
  const fetchProfile = async (currentUser) => {
    if (!currentUser?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // If profile exists and is complete, use it
      if (data && data.account_type) return data;

      // Sync metadata to DB if missing
      const meta = currentUser.user_metadata || {};
      const payload = {
        id: currentUser.id,
        full_name: meta.full_name || meta.name || '',
        account_type: meta.account_type || 'personal',
        company_name: meta.company_name || '',
        updated_at: new Date().toISOString(),
      };

      const { data: upserted } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      return upserted || payload;
    } catch (err) {
      console.error('[Auth] Profile sync error:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (initialized.current) return;
      initialized.current = true;

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
      setUser(null);
      setProfile(null);
      localStorage.clear();
      sessionStorage.clear();
      
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  // IMMEDIATE DERIVATION: Don't wait for profile state if user metadata is available
  const accountType = useMemo(() => {
    const fromMeta = user?.user_metadata?.account_type;
    const fromProfile = profile?.account_type;
    return fromMeta || fromProfile || 'personal';
  }, [user, profile]);

  const value = useMemo(() => ({
    user, 
    profile, 
    loading: !ready || loading, 
    isBusiness: accountType === 'business',
    isPersonal: accountType !== 'business',
    signIn, 
    signUp, 
    signInWithGoogle, 
    signOut 
  }), [user, profile, ready, loading, accountType]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


