import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveCompany } from '@/hooks/useActiveCompany';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Cliente {
  id: string;
  company_id: string;
  nome: string;
  tipo: 'Pessoa Física' | 'Pessoa Jurídica';
  cpf?: string;
  cnpj?: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado?: string;
  cep?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompanyId } = useActiveCompany();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClientes = async () => {
    if (!activeCompanyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('company_id', activeCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!activeCompanyId || !user) return;

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...clienteData,
          company_id: activeCompanyId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchClientes();
      
      toast({
        title: "Cliente criado!",
        description: "Novo cliente adicionado com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCliente = async (clienteId: string, updates: Partial<Cliente>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', clienteId);

      if (error) throw error;
      
      await fetchClientes();
      
      toast({
        title: "Cliente atualizado!",
        description: "Cliente atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCliente = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;
      
      await fetchClientes();
      
      toast({
        title: "Cliente removido!",
        description: "Cliente removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeCompanyId) {
      fetchClientes();
    }
  }, [activeCompanyId]);

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  };
};