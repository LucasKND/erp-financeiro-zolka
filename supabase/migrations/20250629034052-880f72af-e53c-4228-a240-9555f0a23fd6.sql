
-- Adicionar coluna access_code na tabela companies
ALTER TABLE public.companies 
ADD COLUMN access_code TEXT UNIQUE;

-- Adicionar código de acesso para a empresa existente "2GO Marketing"
UPDATE public.companies 
SET access_code = 'ZOLKA2024' 
WHERE name = '2GO Marketing';

-- Tornar o campo obrigatório (depois de definir valores existentes)
ALTER TABLE public.companies 
ALTER COLUMN access_code SET NOT NULL;
