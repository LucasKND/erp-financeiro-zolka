
-- Verificar e corrigir o código de acesso para a empresa 2GO Marketing
UPDATE public.companies 
SET access_code = 'ZOLKA2024' 
WHERE name = '2GO Marketing' AND (access_code IS NULL OR access_code = '');

-- Se a empresa não existir, criar ela com o código de acesso
INSERT INTO public.companies (name, access_code)
SELECT '2GO Marketing', 'ZOLKA2024'
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies WHERE name = '2GO Marketing'
);
