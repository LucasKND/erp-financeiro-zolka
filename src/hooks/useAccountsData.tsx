
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export interface AccountData {
  id: string;
  type: 'payable' | 'receivable';
  title: string;
  amount: number;
  due_date: string;
  status: 'open' | 'paid' | 'received' | 'overdue';
  client_name?: string;
  supplier_name?: string;
  description: string;
}

export function useAccountsData() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();

  const fetchAccounts = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar contas a receber
      const { data: receivableData, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', profile.company_id);

      if (receivableError) throw receivableError;

      // Buscar contas a pagar
      const { data: payableData, error: payableError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', profile.company_id);

      if (payableError) throw payableError;

      // Combinar e normalizar os dados
      const normalizedAccounts: AccountData[] = [
        ...(receivableData || []).map(account => ({
          id: account.id,
          type: 'receivable' as const,
          title: `${account.client_name} - ${account.description}`,
          amount: Number(account.amount),
          due_date: account.due_date,
          status: account.status as 'open' | 'paid' | 'received' | 'overdue',
          client_name: account.client_name,
          description: account.description
        })),
        ...(payableData || []).map(account => ({
          id: account.id,
          type: 'payable' as const,
          title: `${account.supplier_name} - ${account.description}`,
          amount: Number(account.amount),
          due_date: account.due_date,
          status: account.status as 'open' | 'paid' | 'received' | 'overdue',
          supplier_name: account.supplier_name,
          description: account.description
        }))
      ];

      // Ordenar por data de vencimento
      normalizedAccounts.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      setAccounts(normalizedAccounts);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      setError('Erro ao carregar as contas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchAccounts();
    }
  }, [profile?.company_id]);

  const refetch = () => {
    fetchAccounts();
  };

  // Calcular totais
  const totals = {
    totalReceivable: accounts
      .filter(acc => acc.type === 'receivable' && acc.status !== 'received')
      .reduce((sum, acc) => sum + acc.amount, 0),
    totalPayable: accounts
      .filter(acc => acc.type === 'payable' && acc.status !== 'paid')
      .reduce((sum, acc) => sum + acc.amount, 0),
    totalOverdue: accounts
      .filter(acc => acc.status === 'overdue')
      .reduce((sum, acc) => sum + acc.amount, 0)
  };

  return {
    accounts,
    loading,
    error,
    refetch,
    totals
  };
}
