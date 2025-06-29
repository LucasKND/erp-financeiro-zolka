
-- Revisar e corrigir TODAS as políticas RLS do sistema
-- Primeiro, remover todas as políticas existentes para recriá-las corretamente

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can create own roles during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create own profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view companies for signup" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Users manage company receivables" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users manage company payables" ON public.accounts_payable;
DROP POLICY IF EXISTS "Allow role creation during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users create own roles" ON public.user_roles;

-- Reabilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA COMPANIES
-- Permitir que todos vejam empresas (necessário para signup)
CREATE POLICY "Public can view companies"
  ON public.companies
  FOR SELECT
  TO public
  USING (true);

-- Permitir criação de empresas por usuários autenticados
CREATE POLICY "Authenticated can create companies"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- POLÍTICAS PARA PROFILES
-- Usuários podem gerenciar seus próprios perfis
CREATE POLICY "Users manage own profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- POLÍTICAS PARA USER_ROLES
-- Usuários podem ver seus próprios roles
CREATE POLICY "Users view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Usuários podem criar roles para si mesmos (sem verificação de perfil existente)
CREATE POLICY "Users create own roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- POLÍTICAS PARA ACCOUNTS_RECEIVABLE
CREATE POLICY "Users manage company receivables"
  ON public.accounts_receivable
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- POLÍTICAS PARA ACCOUNTS_PAYABLE
CREATE POLICY "Users manage company payables"
  ON public.accounts_payable
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Verificar se todas as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
