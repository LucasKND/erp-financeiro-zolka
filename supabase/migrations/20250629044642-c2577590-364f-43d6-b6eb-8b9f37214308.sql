
-- Primeiro, remover todas as políticas RLS que dependem da função
DROP POLICY IF EXISTS "Users can view accounts receivable in their company" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can create accounts receivable in their company" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can update accounts receivable in their company" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can view accounts payable in their company" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can create accounts payable in their company" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can update accounts payable in their company" ON public.accounts_payable;

-- Agora remover todas as outras políticas
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Allow company creation during signup" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow creating user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role creation during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "Financeiro users can manage roles in their company" ON public.user_roles;

-- Agora podemos remover as funções
DROP FUNCTION IF EXISTS public.user_can_access_company(UUID);
DROP FUNCTION IF EXISTS public.get_user_company_id();

-- Recriar função auxiliar mais simples
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Políticas simples e eficazes para companies
-- Permitir que usuários não autenticados vejam empresas disponíveis (necessário para signup)
CREATE POLICY "Anyone can view companies for signup"
  ON public.companies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can view their company"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Políticas para profiles
CREATE POLICY "Users manage own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Políticas para user_roles
CREATE POLICY "Users view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Políticas para accounts_receivable
CREATE POLICY "Users manage company receivables"
  ON public.accounts_receivable
  FOR ALL
  TO authenticated
  USING (
    company_id = public.get_user_company_id()
  )
  WITH CHECK (
    company_id = public.get_user_company_id() AND
    created_by = auth.uid()
  );

-- Políticas para accounts_payable
CREATE POLICY "Users manage company payables"
  ON public.accounts_payable
  FOR ALL
  TO authenticated
  USING (
    company_id = public.get_user_company_id()
  )
  WITH CHECK (
    company_id = public.get_user_company_id() AND
    created_by = auth.uid()
  );

-- Garantir que temos dados de teste para as empresas
INSERT INTO public.companies (name, access_code) 
VALUES ('2GO Marketing', 'ZOLKA2024')
ON CONFLICT (name, access_code) DO NOTHING;

-- Adicionar mais empresas para teste do dropdown
INSERT INTO public.companies (name, access_code) 
VALUES 
  ('Empresa Teste A', 'TESTE123'),
  ('Empresa Teste B', 'DEMO456')
ON CONFLICT (name, access_code) DO NOTHING;
