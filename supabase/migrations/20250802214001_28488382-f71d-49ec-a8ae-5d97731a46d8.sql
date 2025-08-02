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

-- Função para criar empresa cliente
CREATE OR REPLACE FUNCTION public.create_client_company(
    client_name TEXT,
    client_access_code TEXT,
    admin_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    new_company_id UUID;
    bpo_company_id UUID;
BEGIN
    -- Verificar se é admin BPO
    IF NOT public.is_admin_bpo() THEN
        RAISE EXCEPTION 'Apenas administradores BPO podem criar empresas cliente';
    END IF;
    
    -- Buscar empresa BPO
    SELECT id INTO bpo_company_id 
    FROM public.companies 
    WHERE company_type = 'bpo' 
    LIMIT 1;
    
    -- Criar empresa cliente
    INSERT INTO public.companies (name, access_code, company_type, parent_bpo_id) 
    VALUES (client_name, client_access_code, 'client', bpo_company_id) 
    RETURNING id INTO new_company_id;
    
    -- Dar acesso ao admin
    INSERT INTO public.admin_client_access (admin_user_id, client_company_id)
    VALUES (admin_user_id, new_company_id);
    
    -- Inicializar dados CRM para a nova empresa
    PERFORM public.initialize_crm_data(new_company_id);
    
    RETURN new_company_id;
END;
$$;