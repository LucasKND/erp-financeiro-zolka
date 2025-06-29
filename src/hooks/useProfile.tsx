
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Company = Tables<'companies'>;
type UserRole = Tables<'user_roles'>;

interface ProfileData {
  profile: Profile | null;
  company: Company | null;
  userRole: UserRole | null;
  loading: boolean;
  needsCompanySetup: boolean;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (): ProfileData => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setCompany(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // If profile has company_id, fetch company and role
      if (profileData?.company_id) {
        const [companyResult, roleResult] = await Promise.all([
          supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single(),
          supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('company_id', profileData.company_id)
            .single()
        ]);

        if (companyResult.data) setCompany(companyResult.data);
        if (roleResult.data) setUserRole(roleResult.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const needsCompanySetup = !loading && profile && !profile.company_id;

  return {
    profile,
    company,
    userRole,
    loading: loading || authLoading,
    needsCompanySetup,
    refreshProfile: fetchProfile,
  };
};
