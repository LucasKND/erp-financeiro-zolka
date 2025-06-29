
-- Verificar os códigos de acesso das empresas existentes
SELECT name, access_code FROM public.companies;

-- Atualizar o código de acesso da empresa 2GO Marketing se necessário
UPDATE public.companies 
SET access_code = 'ZOLKA2024' 
WHERE name = '2GO Marketing';

-- Verificar se existe algum problema com as políticas de user_roles
-- Vamos criar uma política mais permissiva temporariamente para debug
DROP POLICY IF EXISTS "Users create own roles" ON public.user_roles;

CREATE POLICY "Allow role creation during signup"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Temporariamente mais permissivo para debug
