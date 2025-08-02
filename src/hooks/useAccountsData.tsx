
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useActiveCompany } from "@/hooks/useActiveCompany";

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
  is_recurring?: boolean;
  recurring_period?: string;
  original_id?: string; // Para identificar contas geradas por recorrência
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function generateRecurringAccounts(account: AccountData): AccountData[] {
  if (!account.is_recurring || !account.recurring_period) {
    return [account];
  }

  const accounts: AccountData[] = [account]; // Inclui a conta original
  let currentDate = new Date(account.due_date);
  const today = new Date();
  const endDate = new Date();
  
  // Gera recorrências para os próximos 12 meses
  endDate.setFullYear(endDate.getFullYear() + 1);

  let iteration = 0;
  const maxIterations = 24; // Limite de segurança

  while (currentDate <= endDate && iteration < maxIterations) {
    // Calcula a próxima data baseada no período
    switch (account.recurring_period) {
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'quarterly':
        currentDate = addMonths(currentDate, 3);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, 1);
        break;
      default:
        return accounts; // Se o período não é reconhecido, para a geração
    }

    const dateString = currentDate.toISOString().split('T')[0];
    const status = currentDate < today ? 'overdue' : 'open';
    
    // Cria uma nova conta recorrente
    const recurringAccount: AccountData = {
      ...account,
      id: `${account.id}_recurring_${iteration}`,
      due_date: dateString,
      status,
      original_id: account.id
    };
    
    accounts.push(recurringAccount);
    iteration++;
  }

  return accounts;
}

export function useAccountsData() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();
  const { activeCompanyId } = useActiveCompany();

  const fetchAccounts = async () => {
    if (!activeCompanyId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar contas a receber
      const { data: receivableData, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', activeCompanyId);

      if (receivableError) throw receivableError;

      // Buscar contas a pagar
      const { data: payableData, error: payableError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', activeCompanyId);

      if (payableError) throw payableError;

      // Normalizar e processar recorrências para contas a receber
      const normalizedReceivableAccounts = (receivableData || []).map(account => ({
        id: account.id,
        type: 'receivable' as const,
        title: `${account.client_name} - ${account.description}`,
        amount: Number(account.amount),
        due_date: account.due_date,
        status: account.status as 'open' | 'paid' | 'received' | 'overdue',
        client_name: account.client_name,
        description: account.description,
        is_recurring: account.is_recurring,
        recurring_period: account.recurring_period
      }));

      // Normalizar contas a pagar (sem recorrência por enquanto)
      const normalizedPayableAccounts = (payableData || []).map(account => ({
        id: account.id,
        type: 'payable' as const,
        title: `${account.supplier_name} - ${account.description}`,
        amount: Number(account.amount),
        due_date: account.due_date,
        status: account.status as 'open' | 'paid' | 'received' | 'overdue',
        supplier_name: account.supplier_name,
        description: account.description,
        is_recurring: false
      }));

      // Gerar contas recorrentes
      const allAccountsWithRecurrence: AccountData[] = [];
      
      // Processar contas a receber (incluindo recorrentes)
      normalizedReceivableAccounts.forEach(account => {
        const recurringAccounts = generateRecurringAccounts(account);
        allAccountsWithRecurrence.push(...recurringAccounts);
      });

      // Adicionar contas a pagar (sem recorrência por enquanto)
      allAccountsWithRecurrence.push(...normalizedPayableAccounts);

      // Ordenar por data de vencimento
      allAccountsWithRecurrence.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      setAccounts(allAccountsWithRecurrence);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      setError('Erro ao carregar as contas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) {
      fetchAccounts();
    }
  }, [activeCompanyId]);

  // Add real-time updates
  useEffect(() => {
    if (!activeCompanyId) return;

    const channel = supabase
      .channel('accounts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts_receivable',
          filter: `company_id=eq.${activeCompanyId}`
        },
        () => {
          console.log('Accounts receivable updated, refreshing...');
          fetchAccounts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts_payable',
          filter: `company_id=eq.${activeCompanyId}`
        },
        () => {
          console.log('Accounts payable updated, refreshing...');
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCompanyId]);

  const refetch = () => {
    fetchAccounts();
  };

  // Função para invalidar dados específicos por tipo e ID
  const invalidateAccount = (accountId: string, type: 'payable' | 'receivable') => {
    setAccounts(prevAccounts => 
      prevAccounts.filter(account => 
        !(account.id === accountId && account.type === type) &&
        !(account.original_id === accountId && account.type === type)
      )
    );
  };

  // Calcular totais (apenas contas originais, não recorrentes)
  const originalAccounts = accounts.filter(account => !account.original_id);
  const totals = {
    totalReceivable: originalAccounts
      .filter(acc => acc.type === 'receivable' && acc.status !== 'received')
      .reduce((sum, acc) => sum + acc.amount, 0),
    totalPayable: originalAccounts
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
    invalidateAccount,
    totals
  };
}
