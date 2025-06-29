
-- Corrigir as políticas RLS para permitir criação de roles durante o signup
-- O problema é que a política atual exige que o perfil já exista antes de criar o role

-- Remover a política problemática
DROP POLICY IF EXISTS "Users can create their own roles during signup" ON public.user_roles;

-- Criar uma política mais simples que permite a criação de roles durante o processo de signup
-- Esta política permite que usuários autenticados criem roles para si mesmos
CREATE POLICY "Users can create own roles during signup"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Verificar as políticas atuais para profiles também
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Garantir que a política de profiles também permita inserção durante signup
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Users can create own profile during signup"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Verificar se temos uma política de SELECT para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
