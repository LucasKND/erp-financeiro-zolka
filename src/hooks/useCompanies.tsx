
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('Fetching available companies...');
        
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching companies:', error);
          setError('Erro ao carregar empresas disponíveis');
          return;
        }

        console.log('Companies loaded:', data);
        setCompanies(data || []);
      } catch (err) {
        console.error('Unexpected error fetching companies:', err);
        setError('Erro inesperado ao carregar empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, loading, error };
}
