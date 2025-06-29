
-- Atualizar o enum de roles para incluir os tipos específicos
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('financeiro', 'proprietario');

-- Recriar a tabela user_roles com o novo enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'financeiro',
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recriar a função has_role para trabalhar com os novos roles
CREATE OR REPLACE FUNCTION public.has_role(_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = _role 
    AND company_id = public.get_user_company_id()
  );
$$;

-- Função para verificar se é usuário financeiro (com permissões completas)
CREATE OR REPLACE FUNCTION public.is_financeiro()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role('financeiro');
$$;

-- Função para verificar se é proprietário (apenas visualização)
CREATE OR REPLACE FUNCTION public.is_proprietario()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role('proprietario');
$$;

-- Configurar usuários existentes como 'financeiro' por padrão
DO $$
DECLARE
    target_company_id UUID;
    user_record RECORD;
BEGIN
    -- Buscar a empresa 2GO Marketing
    SELECT id INTO target_company_id 
    FROM public.companies 
    WHERE name = '2GO Marketing' 
    LIMIT 1;
    
    -- Criar roles 'financeiro' para usuários existentes
    FOR user_record IN 
        SELECT DISTINCT p.id 
        FROM public.profiles p 
        WHERE p.company_id = target_company_id
    LOOP
        INSERT INTO public.user_roles (user_id, company_id, role)
        VALUES (user_record.id, target_company_id, 'financeiro')
        ON CONFLICT (user_id, company_id) DO NOTHING;
    END LOOP;
END;
$$;

-- Atualizar função de criação de usuário para usar role 'financeiro' como padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_company_id UUID;
BEGIN
    -- Buscar a empresa 2GO Marketing como padrão
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
    
    -- Inserir perfil do usuário associado à empresa
    INSERT INTO public.profiles (id, company_id, full_name, email)
    VALUES (
        NEW.id,
        default_company_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.email
    );
    
    -- Criar role 'financeiro' para o novo usuário
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (NEW.id, default_company_id, 'financeiro');
    
    RETURN NEW;
END;
$$;

-- Recriar políticas RLS para user_roles
CREATE POLICY "Users can view roles in their company" ON public.user_roles
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Financeiro users can manage roles in their company" ON public.user_roles
  FOR ALL USING (
    company_id = public.get_user_company_id() 
    AND public.has_role('financeiro')
  );
