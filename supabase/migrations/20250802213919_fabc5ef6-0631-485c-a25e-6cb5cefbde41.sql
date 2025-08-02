-- Adicionar novos valores ao enum user_role
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin_bpo';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'cliente';