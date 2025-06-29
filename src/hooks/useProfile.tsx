
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

        // Se não existe perfil, aguardar um momento e tentar novamente
        // O trigger pode estar criando o perfil automaticamente
        if (!profileData) {
          console.log('Profile not found, waiting for trigger to create it...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (retryError && retryError.code !== 'PGRST116') {
            throw retryError;
          }

          if (retryProfile) {
            setProfile(retryProfile);
            console.log('Profile found after retry:', retryProfile);
          } else {
            console.log('Profile still not found, user needs to set up company');
            setProfile(null);
            setLoading(false);
            return;
          }
        } else {
          console.log('Profile found:', profileData);
          setProfile(profileData);
        }

        // Buscar dados da empresa se o perfil tem company_id
        const finalProfile = profileData || (await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()).data;

        if (finalProfile?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', finalProfile.company_id)
            .maybeSingle();

          if (companyError) {
            console.error('Error fetching company:', companyError);
          } else {
            console.log('Company found:', companyData);
            setCompany(companyData);
          }
        }

      } catch (error) {
        console.error('Error in fetchProfile:', error);
        // Em caso de erro, ainda configurar como não carregando
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
