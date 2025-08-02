-- Configurar usuário como admin BPO
DO $$ 
DECLARE
    user_uuid UUID;
    bpo_company_id UUID;
BEGIN
    -- Buscar o UUID do usuário pelo email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'veronezelc6@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Usuário com email veronezelc6@gmail.com não encontrado';
    END IF;
    
    -- Verificar se existe uma empresa BPO, se não existir, criar uma
    SELECT id INTO bpo_company_id 
    FROM public.companies 
    WHERE company_type = 'bpo' 
    LIMIT 1;
    
    IF bpo_company_id IS NULL THEN
        -- Criar empresa BPO
        INSERT INTO public.companies (name, access_code, company_type) 
        VALUES ('APV Financeiro', 'ADMIN2024', 'bpo') 
        RETURNING id INTO bpo_company_id;
        
        -- Atualizar o perfil do usuário para a empresa BPO
        UPDATE public.profiles 
        SET company_id = bpo_company_id 
        WHERE id = user_uuid;
    END IF;
    
    -- Inserir role de admin_bpo (sem company_id específico para admin BPO)
    INSERT INTO public.user_roles (user_id, role, company_id)
    VALUES (user_uuid, 'admin_bpo', bpo_company_id)
    ON CONFLICT (user_id, company_id) DO UPDATE SET
        role = 'admin_bpo';
        
    RAISE NOTICE 'Usuário % configurado como admin BPO com sucesso', user_uuid;
END $$;