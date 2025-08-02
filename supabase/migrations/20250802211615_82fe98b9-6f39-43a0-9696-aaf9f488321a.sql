-- Criar tabela para as colunas do CRM
CREATE TABLE public.crm_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#e5e7eb',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para os cartões do CRM
CREATE TABLE public.crm_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  column_id UUID NOT NULL REFERENCES public.crm_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  project_summary TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para as etiquetas
CREATE TABLE public.crm_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para associar etiquetas aos cartões
CREATE TABLE public.crm_card_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.crm_cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.crm_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(card_id, label_id)
);

-- Criar tabela para checklists dos cartões
CREATE TABLE public.crm_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.crm_cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Entregáveis do Projeto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para itens dos checklists
CREATE TABLE public.crm_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.crm_checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.crm_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_checklist_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para crm_columns
CREATE POLICY "Users can view company CRM columns" ON public.crm_columns
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create company CRM columns" ON public.crm_columns
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company CRM columns" ON public.crm_columns
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company CRM columns" ON public.crm_columns
  FOR DELETE USING (company_id = get_user_company_id());

-- Políticas RLS para crm_cards
CREATE POLICY "Users can view company CRM cards" ON public.crm_cards
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create company CRM cards" ON public.crm_cards
  FOR INSERT WITH CHECK (company_id = get_user_company_id() AND created_by = auth.uid());

CREATE POLICY "Users can update company CRM cards" ON public.crm_cards
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company CRM cards" ON public.crm_cards
  FOR DELETE USING (company_id = get_user_company_id());

-- Políticas RLS para crm_labels
CREATE POLICY "Users can view company CRM labels" ON public.crm_labels
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create company CRM labels" ON public.crm_labels
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company CRM labels" ON public.crm_labels
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company CRM labels" ON public.crm_labels
  FOR DELETE USING (company_id = get_user_company_id());

-- Políticas RLS para crm_card_labels
CREATE POLICY "Users can view company CRM card labels" ON public.crm_card_labels
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_card_labels.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can create company CRM card labels" ON public.crm_card_labels
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_card_labels.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can delete company CRM card labels" ON public.crm_card_labels
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_card_labels.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

-- Políticas RLS para crm_checklists
CREATE POLICY "Users can view company CRM checklists" ON public.crm_checklists
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_checklists.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can create company CRM checklists" ON public.crm_checklists
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_checklists.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can update company CRM checklists" ON public.crm_checklists
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_checklists.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can delete company CRM checklists" ON public.crm_checklists
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.crm_cards 
    WHERE crm_cards.id = crm_checklists.card_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

-- Políticas RLS para crm_checklist_items
CREATE POLICY "Users can view company CRM checklist items" ON public.crm_checklist_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.crm_checklists
    JOIN public.crm_cards ON crm_cards.id = crm_checklists.card_id
    WHERE crm_checklists.id = crm_checklist_items.checklist_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can create company CRM checklist items" ON public.crm_checklist_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_checklists
    JOIN public.crm_cards ON crm_cards.id = crm_checklists.card_id
    WHERE crm_checklists.id = crm_checklist_items.checklist_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can update company CRM checklist items" ON public.crm_checklist_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.crm_checklists
    JOIN public.crm_cards ON crm_cards.id = crm_checklists.card_id
    WHERE crm_checklists.id = crm_checklist_items.checklist_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can delete company CRM checklist items" ON public.crm_checklist_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.crm_checklists
    JOIN public.crm_cards ON crm_cards.id = crm_checklists.card_id
    WHERE crm_checklists.id = crm_checklist_items.checklist_id 
    AND crm_cards.company_id = get_user_company_id()
  ));

-- Função para inicializar dados do CRM para uma empresa
CREATE OR REPLACE FUNCTION public.initialize_crm_data(company_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir colunas padrão
  INSERT INTO public.crm_columns (company_id, name, position) VALUES
    (company_uuid, 'Caixa de Entrada / Novos Leads', 1),
    (company_uuid, 'Em Prospecção', 2),
    (company_uuid, 'Proposta Enviada', 3),
    (company_uuid, 'Aprovados / Projetos a Iniciar', 4),
    (company_uuid, 'Em Andamento (Projeto)', 5),
    (company_uuid, 'Revisão / Aguardando Cliente', 6),
    (company_uuid, 'Concluído', 7),
    (company_uuid, 'Stand-by / Pausado', 8);

  -- Inserir etiquetas padrão
  INSERT INTO public.crm_labels (company_id, name, color) VALUES
    (company_uuid, 'Urgente', '#ef4444'),
    (company_uuid, 'Aguardando Cliente', '#eab308'),
    (company_uuid, 'Bloqueio Interno', '#f97316'),
    (company_uuid, 'Fase de Pagamento', '#22c55e'),
    (company_uuid, 'Nova Demanda', '#3b82f6'),
    (company_uuid, 'Contrato', '#8b5cf6');
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers para updated_at
CREATE TRIGGER update_crm_columns_updated_at
  BEFORE UPDATE ON public.crm_columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_cards_updated_at
  BEFORE UPDATE ON public.crm_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_checklist_items_updated_at
  BEFORE UPDATE ON public.crm_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();