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

      if (data && data.account_type) return data;

      // Profile doesn't exist yet — create it from metadata
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

      try {
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
        if (mounted) {
          setLoading(false);
          setReady(true);
        }
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        const newUser = session?.user ?? null;

        if (newUser?.id !== userRef.current?.id) {
          // FIX #2: Reset both loading AND ready during user switch
          // This prevents accountType from resolving prematurely
          // while the new user's profile is still being fetched.
          setLoading(true);
          setReady(false);
          setUser(newUser);

          if (newUser) {
            const p = await fetchProfile(newUser);
            if (mounted) setProfile(p);
          } else {
            setProfile(null);
          }

          if (mounted) {
            setLoading(false);
            setReady(true); // Only unblock after profile is loaded
          }
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setReady(true);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    init();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, fullName, accountType, companyName) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
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
      window.location.href = '/login';
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await supabase.from('profiles').delete().eq('id', user.id);
      await signOut();
    } catch (error) {
      console.error('Delete account error:', error);
      await signOut();
    }
  };

  // FIX #2 + #3: Explicit, safe conditions — no ambiguous fallbacks while loading.
  // Returns null when data isn't ready, preventing premature 'personal' resolution.
  const accountType = useMemo(() => {
    if (!ready || loading) return null;  // Still initialising — block resolution
    if (user && !profile) return null;   // User exists but profile hasn't loaded yet
    if (!user) return null;              // Not authenticated

    // FIX #1: DB profile takes priority over metadata.
    // Metadata can be stale (e.g. old registration) or missing (Google OAuth).
    // The profiles table is the single source of truth.
    const fromProfile = profile?.account_type;
    const fromMeta = user?.user_metadata?.account_type;

    return fromProfile || fromMeta || 'personal';
  }, [user, profile, ready, loading]);

  const value = useMemo(() => ({
    user,
    profile,
    loading: !ready || loading,
    accountTypeReady: accountType !== null,
    isBusiness: accountType === 'business',
    isPersonal: accountType === 'personal',
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
