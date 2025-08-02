-- Primeiro, vamos criar novos tipos de roles
CREATE TYPE public.user_role AS ENUM ('admin_bpo', 'cliente', 'financeiro');

-- Atualizar a tabela companies para incluir tipo de empresa
ALTER TABLE public.companies 
ADD COLUMN company_type TEXT DEFAULT 'client' CHECK (company_type IN ('bpo', 'client'));

ALTER TABLE public.companies 
ADD COLUMN parent_bpo_id UUID REFERENCES public.companies(id);

-- Criar tabela para relacionamento admin-cliente
CREATE TABLE public.admin_client_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  client_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_user_id, client_company_id)
);

-- Habilitar RLS
ALTER TABLE public.admin_client_access ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_client_access
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

-- Atualizar políticas existentes para accounts_receivable
DROP POLICY "Users can manage company accounts receivable" ON public.accounts_receivable;
DROP POLICY "Users manage company receivables" ON public.accounts_receivable;

CREATE POLICY "Users can manage accessible company receivables" ON public.accounts_receivable
  FOR ALL USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id) AND created_by = auth.uid());

-- Atualizar políticas existentes para accounts_payable
DROP POLICY "Users can manage company accounts payable" ON public.accounts_payable;
DROP POLICY "Users manage company payables" ON public.accounts_payable;

CREATE POLICY "Users can manage accessible company payables" ON public.accounts_payable
  FOR ALL USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id) AND created_by = auth.uid());

-- Atualizar políticas para calendar_events
DROP POLICY "Users can view calendar events in their company" ON public.calendar_events;
DROP POLICY "Users can create calendar events in their company" ON public.calendar_events;
DROP POLICY "Users can update calendar events in their company" ON public.calendar_events;
DROP POLICY "Users can delete calendar events in their company" ON public.calendar_events;

CREATE POLICY "Users can view accessible calendar events" ON public.calendar_events
  FOR SELECT USING (public.can_access_company(company_id));

CREATE POLICY "Users can create accessible calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (public.can_access_company(company_id) AND created_by = auth.uid());

CREATE POLICY "Users can update accessible calendar events" ON public.calendar_events
  FOR UPDATE USING (public.can_access_company(company_id));

CREATE POLICY "Users can delete accessible calendar events" ON public.calendar_events
  FOR DELETE USING (public.can_access_company(company_id));

-- Atualizar políticas para CRM
DROP POLICY "Users can view company CRM columns" ON public.crm_columns;
DROP POLICY "Users can create company CRM columns" ON public.crm_columns;
DROP POLICY "Users can update company CRM columns" ON public.crm_columns;
DROP POLICY "Users can delete company CRM columns" ON public.crm_columns;

CREATE POLICY "Users can view accessible CRM columns" ON public.crm_columns
  FOR SELECT USING (public.can_access_company(company_id));

CREATE POLICY "Users can create accessible CRM columns" ON public.crm_columns
  FOR INSERT WITH CHECK (public.can_access_company(company_id));

CREATE POLICY "Users can update accessible CRM columns" ON public.crm_columns
  FOR UPDATE USING (public.can_access_company(company_id));

CREATE POLICY "Users can delete accessible CRM columns" ON public.crm_columns
  FOR DELETE USING (public.can_access_company(company_id));

-- Aplicar mesmo padrão para crm_cards
DROP POLICY "Users can view company CRM cards" ON public.crm_cards;
DROP POLICY "Users can create company CRM cards" ON public.crm_cards;
DROP POLICY "Users can update company CRM cards" ON public.crm_cards;
DROP POLICY "Users can delete company CRM cards" ON public.crm_cards;

CREATE POLICY "Users can view accessible CRM cards" ON public.crm_cards
  FOR SELECT USING (public.can_access_company(company_id));

CREATE POLICY "Users can create accessible CRM cards" ON public.crm_cards
  FOR INSERT WITH CHECK (public.can_access_company(company_id) AND created_by = auth.uid());

CREATE POLICY "Users can update accessible CRM cards" ON public.crm_cards
  FOR UPDATE USING (public.can_access_company(company_id));

CREATE POLICY "Users can delete accessible CRM cards" ON public.crm_cards
  FOR DELETE USING (public.can_access_company(company_id));

-- Aplicar mesmo padrão para crm_labels
DROP POLICY "Users can view company CRM labels" ON public.crm_labels;
DROP POLICY "Users can create company CRM labels" ON public.crm_labels;
DROP POLICY "Users can update company CRM labels" ON public.crm_labels;
DROP POLICY "Users can delete company CRM labels" ON public.crm_labels;

CREATE POLICY "Users can view accessible CRM labels" ON public.crm_labels
  FOR SELECT USING (public.can_access_company(company_id));

CREATE POLICY "Users can create accessible CRM labels" ON public.crm_labels
  FOR INSERT WITH CHECK (public.can_access_company(company_id));

CREATE POLICY "Users can update accessible CRM labels" ON public.crm_labels
  FOR UPDATE USING (public.can_access_company(company_id));

CREATE POLICY "Users can delete accessible CRM labels" ON public.crm_labels
  FOR DELETE USING (public.can_access_company(company_id));

-- Criar empresa BPO padrão
DO $$
DECLARE
    bpo_company_id UUID;
BEGIN
    -- Verificar se já existe uma empresa BPO
    SELECT id INTO bpo_company_id 
    FROM public.companies 
    WHERE company_type = 'bpo' 
    LIMIT 1;
    
    -- Se não existe, criar empresa BPO
    IF bpo_company_id IS NULL THEN
        INSERT INTO public.companies (name, access_code, company_type) 
        VALUES ('BPO Financeiro - Zolka', 'ADMIN2024', 'bpo') 
        RETURNING id INTO bpo_company_id;
    END IF;
    
    -- Atualizar empresa existente para ser BPO se necessário
    UPDATE public.companies 
    SET company_type = 'bpo' 
    WHERE name = '2GO Marketing' AND company_type IS NULL;
END $$;

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