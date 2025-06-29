
-- Função para calcular totais de contas a receber por status
CREATE OR REPLACE FUNCTION public.get_accounts_receivable_totals(company_uuid UUID)
RETURNS TABLE(
  total_open NUMERIC,
  total_overdue NUMERIC,
  total_received NUMERIC,
  count_open INTEGER,
  count_overdue INTEGER,
  count_received INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN status = 'open' THEN amount ELSE 0 END), 0) as total_open,
    COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue,
    COALESCE(SUM(CASE WHEN status = 'received' THEN amount ELSE 0 END), 0) as total_received,
    COUNT(CASE WHEN status = 'open' THEN 1 END)::INTEGER as count_open,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END)::INTEGER as count_overdue,
    COUNT(CASE WHEN status = 'received' THEN 1 END)::INTEGER as count_received
  FROM public.accounts_receivable 
  WHERE company_id = company_uuid;
$$;

-- Função para calcular totais de contas a pagar por status
CREATE OR REPLACE FUNCTION public.get_accounts_payable_totals(company_uuid UUID)
RETURNS TABLE(
  total_open NUMERIC,
  total_overdue NUMERIC,
  total_paid NUMERIC,
  count_open INTEGER,
  count_overdue INTEGER,
  count_paid INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN status = 'open' THEN amount ELSE 0 END), 0) as total_open,
    COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
    COUNT(CASE WHEN status = 'open' THEN 1 END)::INTEGER as count_open,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END)::INTEGER as count_overdue,
    COUNT(CASE WHEN status = 'paid' THEN 1 END)::INTEGER as count_paid
  FROM public.accounts_payable 
  WHERE company_id = company_uuid;
$$;

-- Função para calcular o saldo total (contas a receber - contas a pagar)
CREATE OR REPLACE FUNCTION public.get_company_balance(company_uuid UUID)
RETURNS TABLE(
  total_balance NUMERIC,
  total_receivable NUMERIC,
  total_payable NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  WITH receivable_totals AS (
    SELECT COALESCE(SUM(amount), 0) as total_receivable
    FROM public.accounts_receivable 
    WHERE company_id = company_uuid AND status IN ('open', 'overdue')
  ),
  payable_totals AS (
    SELECT COALESCE(SUM(amount), 0) as total_payable
    FROM public.accounts_payable 
    WHERE company_id = company_uuid AND status IN ('open', 'overdue')
  )
  SELECT 
    (r.total_receivable - p.total_payable) as total_balance,
    r.total_receivable,
    p.total_payable
  FROM receivable_totals r, payable_totals p;
$$;

-- Função para obter dados do fluxo de caixa por mês
CREATE OR REPLACE FUNCTION public.get_cash_flow_data(company_uuid UUID, months_back INTEGER DEFAULT 6)
RETURNS TABLE(
  month_name TEXT,
  entradas NUMERIC,
  saidas NUMERIC,
  saldo NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  WITH months AS (
    SELECT 
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * generate_series(0, months_back - 1)) as month_date
  ),
  receivables_by_month AS (
    SELECT 
      DATE_TRUNC('month', due_date) as month_date,
      SUM(amount) as total_received
    FROM public.accounts_receivable
    WHERE company_id = company_uuid 
      AND status = 'received'
      AND due_date >= CURRENT_DATE - INTERVAL '1 month' * months_back
    GROUP BY DATE_TRUNC('month', due_date)
  ),
  payables_by_month AS (
    SELECT 
      DATE_TRUNC('month', due_date) as month_date,
      SUM(amount) as total_paid
    FROM public.accounts_payable
    WHERE company_id = company_uuid 
      AND status = 'paid'
      AND due_date >= CURRENT_DATE - INTERVAL '1 month' * months_back
    GROUP BY DATE_TRUNC('month', due_date)
  )
  SELECT 
    TO_CHAR(m.month_date, 'Mon') as month_name,
    COALESCE(r.total_received, 0) as entradas,
    COALESCE(p.total_paid, 0) as saidas,
    COALESCE(r.total_received, 0) - COALESCE(p.total_paid, 0) as saldo
  FROM months m
  LEFT JOIN receivables_by_month r ON m.month_date = r.month_date
  LEFT JOIN payables_by_month p ON m.month_date = p.month_date
  ORDER BY m.month_date;
$$;
