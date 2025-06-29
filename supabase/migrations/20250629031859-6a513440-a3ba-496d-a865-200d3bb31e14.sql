
-- Verificar se a empresa 2GO Marketing existe
SELECT * FROM public.companies WHERE name = '2GO Marketing';

-- Verificar usuários associados à empresa 2GO Marketing
SELECT 
    p.id as user_id,
    p.full_name,
    p.email,
    ur.role,
    p.created_at
FROM public.profiles p
JOIN public.companies c ON p.company_id = c.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.company_id = c.id
WHERE c.name = '2GO Marketing'
ORDER BY p.created_at;
