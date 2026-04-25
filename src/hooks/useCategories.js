import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// FIX #4: Adicionada flag `mounted` para evitar setCategories/setLoading
//   em componentes já desmontados — eliminando warnings do React e
//   potenciais memory leaks quando o componente desmonta durante o fetch.
//
// FIX #5: Erro de fetch agora exposto via estado `error`.
//   Antes, se a query falhasse, categories ficava [] e loading false
//   sem nenhum indicador — o utilizador via uma lista vazia sem perceber porquê.

export const useCategories = (type = null) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null); // FIX #5

  useEffect(() => {
    // FIX #4: flag de montagem
    let mounted = true;

    const fetchCategories = async () => {
      // Resetar erro antes de nova tentativa
      if (mounted) setError(null);

      try {
        let query = supabase.from('categories').select('*').order('name');
        if (type) query = query.eq('type', type);

        const { data, error: fetchError } = await query;

        // FIX #4: não atualizar estado se o componente já desmontou
        if (!mounted) return;

        if (fetchError) {
          // FIX #5: expor o erro em vez de ignorar silenciosamente
          console.error('[useCategories] Fetch error:', fetchError);
          setError(fetchError.message);
          setCategories([]);
        } else {
          setCategories(data || []);
          setError(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('[useCategories] Unexpected error:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        // FIX #4: só atualizar loading se ainda estiver montado
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();

    // FIX #4: cleanup — marca como desmontado para ignorar respostas tardias
    return () => { mounted = false; };
  }, [type]);

  // FIX #5: error exportado para que o componente pai possa reagir
  return { categories, loading, error };
};
