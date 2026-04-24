import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCategories = (type = null) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase.from('categories').select('*').order('name');
      if (type) query = query.eq('type', type);

      const { data } = await query;
      setCategories(data || []);
      setLoading(false);
    };
    fetch();
  }, [type]);

  return { categories, loading };
};
