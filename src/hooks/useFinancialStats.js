import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// FIX #3: activeChannelRef agora é USADO para garantir que o canal anterior
// é sempre removido antes de criar um novo. Antes estava declarado mas nunca
// referenciado — o que causava double fetch quando userId mudava (ex: admin
// a alternar entre clientes), resultando em estado inconsistente.

export const useFinancialStats = (targetUserId = null) => {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;

  const [stats, setStats] = useState({
    balance:      0,
    totalIncome:  0,
    totalExpense: 0,
    transactions: [],
    loading:      true,
    error:        null,
  });

  // Ref para guardar o canal Realtime ativo e evitar duplicados
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

      const rows = data || [];

      const totalIncome = rows
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = rows
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        balance:      totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        transactions: rows,
        loading:      false,
        error:        null,
      });
    } catch (err) {
      console.error('[useFinancialStats] Fetch error:', err);
      setStats(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Carrega dados imediatamente
    fetchStats();

    // FIX #3: Remover canal anterior ANTES de criar um novo.
    // Sem isto, trocar de userId criava um segundo canal sem fechar o primeiro,
    // resultando em dois listeners a chamar fetchStats em simultâneo.
    if (activeChannelRef.current) {
      supabase.removeChannel(activeChannelRef.current);
      activeChannelRef.current = null;
    }

    // Criar novo canal Realtime para o userId atual
    const channel = supabase
      .channel(`rt_transactions_${userId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchStats()
      )
      .subscribe();

    // Guardar referência ao canal ativo
    activeChannelRef.current = channel;

    // Cleanup: remover canal ao desmontar ou quando userId muda
    return () => {
      if (activeChannelRef.current) {
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
    };
  }, [fetchStats, userId]);

  return { ...stats, refetch: fetchStats };
};
