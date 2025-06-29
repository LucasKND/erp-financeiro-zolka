
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
      console.log('Fetching profile for user:', user.id);

      // Fetch user profile - use maybeSingle() to avoid errors when no profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If no profile exists, we'll create one
        if (profileError.code === 'PGRST116') {
          console.log('No profile found, user needs to set up company');
          setProfile(null);
          setCompany(null);
          setUserRole(null);
          setLoading(false);
          return;
        }
        throw profileError;
      }

      console.log('Profile data:', profileData);
      setProfile(profileData);

      // If profile has company_id, fetch company and role
      if (profileData?.company_id) {
        const [companyResult, roleResult] = await Promise.all([
          supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .maybeSingle(),
          supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('company_id', profileData.company_id)
            .maybeSingle()
        ]);

        if (companyResult.data) {
          console.log('Company data:', companyResult.data);
          setCompany(companyResult.data);
        }
        if (roleResult.data) {
          console.log('Role data:', roleResult.data);
          setUserRole(roleResult.data);
        }
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

  const needsCompanySetup = !loading && user && (!profile || !profile.company_id);

  return {
    profile,
    company,
    userRole,
    loading: loading || authLoading,
    needsCompanySetup,
    refreshProfile: fetchProfile,
  };
};
