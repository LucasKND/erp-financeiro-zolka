
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
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Se não existe perfil, criar um
        if (!profileData) {
          console.log('Profile not found, creating new profile');
          
          // Primeiro, encontrar ou criar empresa padrão
          let { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('name', '2GO Marketing')
            .single();

          if (companyError && companyError.code === 'PGRST116') {
            // Empresa não existe, criar uma nova
            const { data: newCompany, error: createCompanyError } = await supabase
              .from('companies')
              .insert({ name: '2GO Marketing' })
              .select()
              .single();

            if (createCompanyError) throw createCompanyError;
            companyData = newCompany;
          } else if (companyError) {
            throw companyError;
          }

          // Criar perfil do usuário
          const { data: newProfile, error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              company_id: companyData!.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
              email: user.email
            })
            .select()
            .single();

          if (createProfileError) throw createProfileError;
          profileData = newProfile;

          // Criar role financeiro para o novo usuário
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              company_id: companyData!.id,
              role: 'financeiro'
            });

          if (roleError) {
            console.error('Error creating user role:', roleError);
            // Não vamos falhar se o role já existir
          }
        }

        console.log('Profile data:', profileData);
        setProfile(profileData);

        // Buscar dados da empresa
        if (profileData?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();

          if (companyError) throw companyError;
          setCompany(companyData);
        }

      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, company, loading };
}
