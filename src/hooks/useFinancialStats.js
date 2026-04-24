import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useFinancialStats = (targetUserId = null) => {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;

  const [stats, setStats] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactions: [],
    loading: true,
    error: null,
  });

  // Track the active channel in a ref to ensure absolute cleanup
  const activeChannelRef = useRef(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, type)')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const totalIncome = (data || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = (data || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        balance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        transactions: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Fetch Stats Error:', error);
      setStats(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    // 1. Initial Fetch
    fetchStats();

    // 2. Realtime Management
    const cleanupRealtime = async () => {
      if (activeChannelRef.current) {
        await supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
    };

    const setupRealtime = () => {
      // Create a completely unique name for this specific instance
      const channelName = `rt_${userId}_${Math.random().toString(36).slice(2, 7)}`;
      
      const channel = supabase.channel(channelName);
      
      // CRITICAL: .on() MUST be called before .subscribe()
      channel.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions', 
          filter: `user_id=eq.${userId}` 
        },
        () => {
          // Re-fetch when changes occur
          fetchStats();
        }
      );

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          activeChannelRef.current = channel;
        }
      });
    };

    // Small delay to ensure Supabase client has cleared old state
    const timeoutId = setTimeout(() => {
      setupRealtime();
    }, 100);

    // 3. Manual Update Listener (Custom Event)
    const handleManualUpdate = () => {
      fetchStats();
    };

    window.addEventListener('finance-stats-updated', handleManualUpdate);

    return () => {
      clearTimeout(timeoutId);
      cleanupRealtime();
      window.removeEventListener('finance-stats-updated', handleManualUpdate);
    };
  }, [fetchStats, userId]);

  return { ...stats, refetch: fetchStats };
};
