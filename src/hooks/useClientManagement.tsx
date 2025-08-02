import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ClientCompany {
  id: string;
  name: string;
  access_code: string;
  company_type: string;
  parent_bpo_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useClientManagement = () => {
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminBPO, setIsAdminBPO] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkAdminRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin_bpo')
        .single();

      setIsAdminBPO(!!data);
    } catch (error) {
      setIsAdminBPO(false);
    }
  };

  const fetchClientCompanies = async () => {
    try {
      // Buscar empresas cliente E a empresa BPO (APV Financeiro)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .in('company_type', ['client', 'bpo'])
        .order('company_type', { ascending: false }) // BPO primeiro, depois clientes
        .order('name');

      if (error) throw error;
      setClientCompanies(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createClientCompany = async (name: string, accessCode: string) => {
    if (!user || !isAdminBPO) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores BPO podem criar empresas cliente.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('create_client_company', {
        client_name: name,
        client_access_code: accessCode,
        admin_user_id: user.id
      });

      if (error) throw error;

      await fetchClientCompanies();
      
      toast({
        title: "Empresa cliente criada!",
        description: `A empresa "${name}" foi criada com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar empresa cliente:', error);
      toast({
        title: "Erro ao criar empresa",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteClientCompany = async (companyId: string) => {
    if (!user || !isAdminBPO) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores BPO podem excluir empresas cliente.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
        .eq('company_type', 'client');

      if (error) throw error;

      await fetchClientCompanies();
      
      toast({
        title: "Empresa excluída!",
        description: "A empresa cliente foi removida com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir empresa cliente:', error);
      toast({
        title: "Erro ao excluir empresa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateClientCompany = async (companyId: string, name: string, accessCode: string) => {
    if (!user || !isAdminBPO) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores BPO podem editar empresas cliente.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({ name, access_code: accessCode })
        .eq('id', companyId)
        .eq('company_type', 'client');

      if (error) throw error;

      await fetchClientCompanies();
      
      toast({
        title: "Empresa atualizada!",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar empresa cliente:', error);
      toast({
        title: "Erro ao atualizar empresa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await checkAdminRole();
        await fetchClientCompanies();
        setLoading(false);
      };
      
      loadData();
    }
  }, [user]);

  return {
    clientCompanies,
    loading,
    isAdminBPO,
    createClientCompany,
    deleteClientCompany,
    updateClientCompany,
    refetch: fetchClientCompanies
  };
};