-- Adicionar políticas RLS para permitir UPDATE e DELETE de empresas
-- por admin BPO

-- Política para UPDATE de empresas cliente
CREATE POLICY "Admin BPO can update client companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  company_type = 'client' 
  AND public.is_admin_bpo()
)
WITH CHECK (
  company_type = 'client' 
  AND public.is_admin_bpo()
);

-- Política para DELETE de empresas cliente
CREATE POLICY "Admin BPO can delete client companies"
ON public.companies
FOR DELETE
TO authenticated
USING (
  company_type = 'client' 
  AND public.is_admin_bpo()
);