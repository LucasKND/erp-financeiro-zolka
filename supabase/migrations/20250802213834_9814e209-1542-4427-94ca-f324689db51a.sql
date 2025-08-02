-- Verificar e atualizar enum user_role existente
DO $$
BEGIN
    -- Verificar se 'admin_bpo' já existe no enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin_bpo' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE public.user_role ADD VALUE 'admin_bpo';
    END IF;
    
    -- Verificar se 'cliente' já existe no enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cliente' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE public.user_role ADD VALUE 'cliente';
    END IF;
END $$;

-- Atualizar a tabela companies para incluir tipo de empresa
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'client' CHECK (company_type IN ('bpo', 'client'));

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_bpo_id UUID REFERENCES public.companies(id);

-- Criar tabela para relacionamento admin-cliente
CREATE TABLE IF NOT EXISTS public.admin_client_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  client_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_user_id, client_company_id)
);

-- Habilitar RLS
ALTER TABLE public.admin_client_access ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_client_access
DROP POLICY IF EXISTS "Admins can manage client access" ON public.admin_client_access;
CREATE POLICY "Admins can manage client access" ON public.admin_client_access
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin_bpo'
  ));

-- Criar função para verificar se user é admin BPO
CREATE OR REPLACE FUNCTION public.is_admin_bpo()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin_bpo'
  );
$$;

-- Criar função para verificar acesso a empresa cliente
CREATE OR REPLACE FUNCTION public.can_access_company(target_company_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    -- Admin BPO pode acessar qualquer empresa cliente
    (public.is_admin_bpo() AND EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = target_company_id AND company_type = 'client'
    ))
    OR
    -- Usuário normal só acessa sua própria empresa
    (target_company_id = public.get_user_company_id());
$$;