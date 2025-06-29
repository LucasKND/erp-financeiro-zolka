
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserRole = Tables<'user_roles'>;

interface PermissionsData {
  userRole: UserRole | null;
  isFinanceiro: boolean;
  isProprietario: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewReports: boolean;
  loading: boolean;
}

export const usePermissions = (): PermissionsData => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !profile?.company_id) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('company_id', profile.company_id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
        } else {
          setUserRole(data);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, profile?.company_id]);

  const isFinanceiro = userRole?.role === 'financeiro';
  const isProprietario = userRole?.role === 'proprietario';

  return {
    userRole,
    isFinanceiro,
    isProprietario,
    canCreate: isFinanceiro,
    canEdit: isFinanceiro,
    canDelete: isFinanceiro,
    canViewReports: true, // Ambos podem ver relatórios
    loading,
  };
};
