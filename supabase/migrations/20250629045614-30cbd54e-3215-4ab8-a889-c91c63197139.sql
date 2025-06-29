
-- Verificar se o usuário existe e limpar dados se necessário
-- Primeiro, vamos ver se existem registros do usuário problemático

-- Verificar perfis existentes
SELECT id, full_name, email, company_id FROM public.profiles;

-- Verificar roles de usuários existentes
SELECT user_id, role, company_id FROM public.user_roles;

-- Limpar dados de usuários problemáticos se existirem
-- (substitua 'seu-email@exemplo.com' pelo email que você está tentando usar)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE email = 'gustavo.duolegacy@gmail.com'
);

DELETE FROM public.profiles 
WHERE email = 'gustavo.duolegacy@gmail.com';

-- Verificar as políticas atuais para user_roles
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Criar uma política mais robusta para criação de roles
DROP POLICY IF EXISTS "Allow role creation during signup" ON public.user_roles;

CREATE POLICY "Users can create their own roles during signup"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  );
