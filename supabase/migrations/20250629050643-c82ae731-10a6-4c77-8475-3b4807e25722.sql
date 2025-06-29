
-- Criar trigger automático para resolver problemas de RLS durante signup
-- Este trigger criará automaticamente perfil e role quando um usuário for criado

-- Primeiro, remover o trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar nova função que será executada quando um usuário for criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    selected_company_id UUID;
    company_name_from_meta TEXT;
BEGIN
    -- Extrair o nome da empresa dos metadados do usuário
    company_name_from_meta := NEW.raw_user_meta_data->>'company_name';
    
    -- Buscar a empresa pelo nome (se fornecido) ou usar a padrão
    IF company_name_from_meta IS NOT NULL THEN
        SELECT id INTO selected_company_id 
        FROM public.companies 
        WHERE name = company_name_from_meta 
        LIMIT 1;
    END IF;
    
    -- Se não encontrou a empresa ou não foi fornecida, usar a padrão
    IF selected_company_id IS NULL THEN
        SELECT id INTO selected_company_id 
        FROM public.companies 
        WHERE name = '2GO Marketing' 
        LIMIT 1;
        
        -- Se a empresa padrão não existe, criar
        IF selected_company_id IS NULL THEN
            INSERT INTO public.companies (name, access_code) 
            VALUES ('2GO Marketing', 'ZOLKA2024') 
            RETURNING id INTO selected_company_id;
        END IF;
    END IF;
    
    -- Criar perfil do usuário (mesmo que o email não esteja confirmado)
    INSERT INTO public.profiles (id, company_id, full_name, email)
    VALUES (
        NEW.id,
        selected_company_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.email, '')
    )
    ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email);
    
    -- Criar role financeiro (mesmo que o email não esteja confirmado)
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (NEW.id, selected_company_id, 'financeiro')
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, log e ainda permitir a criação do usuário
    -- Isso evita que falhas no trigger bloqueiem o signup
    RAISE WARNING 'Erro ao criar perfil/role para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Criar o trigger que executará a função após inserção de usuário
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Garantir que temos unique constraint no user_roles para evitar duplicatas
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_company_id_key;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_company_id_key 
UNIQUE (user_id, company_id);

-- Verificar se o trigger foi criado
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    trigger_schema, 
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
