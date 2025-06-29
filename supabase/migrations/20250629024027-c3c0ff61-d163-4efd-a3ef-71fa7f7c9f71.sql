
-- Primeiro, remover todas as políticas conflitantes
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view company accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can create company accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can update company accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can delete company accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can view company accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can create company accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can update company accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can delete company accounts payable" ON public.accounts_payable;

-- Remover políticas antigas que podem existir
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "Financeiro users can manage roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

-- Recriar função get_user_company_id de forma mais segura
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Função auxiliar para verificar se usuário pode acessar empresa
CREATE OR REPLACE FUNCTION public.user_can_access_company(company_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND company_id = company_uuid
  );
$$;

-- Políticas mais simples e diretas para companies
CREATE POLICY "Allow authenticated users to create companies"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view companies they belong to"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = companies.id
    )
  );

-- Políticas para profiles
CREATE POLICY "Users can manage their own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow creating user roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Políticas para accounts_receivable
CREATE POLICY "Users can manage their company receivables"
  ON public.accounts_receivable
  FOR ALL
  TO authenticated
  USING (public.user_can_access_company(company_id))
  WITH CHECK (public.user_can_access_company(company_id));

-- Políticas para accounts_payable
CREATE POLICY "Users can manage their company payables"
  ON public.accounts_payable
  FOR ALL
  TO authenticated
  USING (public.user_can_access_company(company_id))
  WITH CHECK (public.user_can_access_company(company_id));

-- Garantir que a empresa padrão existe
INSERT INTO public.companies (name) 
VALUES ('2GO Marketing') 
ON CONFLICT DO NOTHING;

-- Atualizar a função handle_new_user para ser mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_company_id UUID;
BEGIN
    -- Buscar ou criar a empresa padrão
    SELECT id INTO default_company_id 
    FROM public.companies 
    WHERE name = '2GO Marketing' 
    LIMIT 1;
    
    -- Se não encontrou, criar a empresa
    IF default_company_id IS NULL THEN
        INSERT INTO public.companies (name) 
        VALUES ('2GO Marketing') 
        RETURNING id INTO default_company_id;
    END IF;
    
    -- Inserir perfil do usuário
    INSERT INTO public.profiles (id, company_id, full_name, email)
    VALUES (
        NEW.id,
        default_company_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.email, '')
    );
    
    -- Criar role financeiro
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (NEW.id, default_company_id, 'financeiro')
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, ainda permitir a criação do usuário
    RETURN NEW;
END;
$$;
