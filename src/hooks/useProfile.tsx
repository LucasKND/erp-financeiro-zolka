
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Company = Tables<'companies'>;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('No user found, clearing profile');
      setProfile(null);
      setCompany(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.id);
        
        // Buscar perfil existente
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        if (!profileData) {
          console.log('Profile not found for user');
          setProfile(null);
          setCompany(null);
          setLoading(false);
          return;
        }

        console.log('Profile found:', profileData);
        setProfile(profileData);

        // Buscar dados da empresa
        if (profileData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .maybeSingle();

          if (companyError) {
            console.error('Error fetching company:', companyError);
            setCompany(null);
          } else {
            console.log('Company found:', companyData);
            setCompany(companyData);
          }
        }

      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfile(null);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, company, loading };
}
