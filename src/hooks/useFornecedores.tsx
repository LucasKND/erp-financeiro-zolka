import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveCompany } from '@/hooks/useActiveCompany';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Fornecedor {
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
  categoria: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompanyId } = useActiveCompany();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFornecedores = async () => {
    if (!activeCompanyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('company_id', activeCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar fornecedores:', error);
      toast({
        title: "Erro ao carregar fornecedores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFornecedor = async (fornecedorData: Omit<Fornecedor, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!activeCompanyId || !user) return;

    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert({
          ...fornecedorData,
          company_id: activeCompanyId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchFornecedores();
      
      toast({
        title: "Fornecedor criado!",
        description: "Novo fornecedor adicionado com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar fornecedor:', error);
      toast({
        title: "Erro ao criar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateFornecedor = async (fornecedorId: string, updates: Partial<Fornecedor>) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .update(updates)
        .eq('id', fornecedorId);

      if (error) throw error;
      
      await fetchFornecedores();
      
      toast({
        title: "Fornecedor atualizado!",
        description: "Fornecedor atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast({
        title: "Erro ao atualizar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFornecedor = async (fornecedorId: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', fornecedorId);

      if (error) throw error;
      
      await fetchFornecedores();
      
      toast({
        title: "Fornecedor removido!",
        description: "Fornecedor removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover fornecedor:', error);
      toast({
        title: "Erro ao remover fornecedor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeCompanyId) {
      fetchFornecedores();
    }
  }, [activeCompanyId]);

  return {
    fornecedores,
    loading,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    refetch: fetchFornecedores
  };
};