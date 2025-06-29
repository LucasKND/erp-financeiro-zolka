
-- Habilitar RLS nas tabelas que ainda não têm (usando IF NOT EXISTS quando possível)
DO $$ 
BEGIN
  -- Verificar e habilitar RLS se necessário
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_receivable' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_payable' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Políticas para companies (criar apenas se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Users can view their company'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their company" 
      ON public.companies 
      FOR SELECT 
      USING (
        id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Authenticated users can create companies'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can create companies" 
      ON public.companies 
      FOR INSERT 
      WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Políticas para profiles (criar apenas se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can create their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can create their own profile" 
      ON public.profiles 
      FOR INSERT 
      WITH CHECK (id = auth.uid())';
  END IF;
END $$;

-- Políticas para user_roles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can view their own roles'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own roles" 
      ON public.user_roles 
      FOR SELECT 
      USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'System can create user roles'
  ) THEN
    EXECUTE 'CREATE POLICY "System can create user roles" 
      ON public.user_roles 
      FOR INSERT 
      WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Políticas para accounts_receivable
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_receivable' 
    AND policyname = 'Users can view company accounts receivable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view company accounts receivable" 
      ON public.accounts_receivable 
      FOR SELECT 
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_receivable' 
    AND policyname = 'Users can create company accounts receivable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can create company accounts receivable" 
      ON public.accounts_receivable 
      FOR INSERT 
      WITH CHECK (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_receivable' 
    AND policyname = 'Users can update company accounts receivable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update company accounts receivable" 
      ON public.accounts_receivable 
      FOR UPDATE 
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_receivable' 
    AND policyname = 'Users can delete company accounts receivable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete company accounts receivable" 
      ON public.accounts_receivable 
      FOR DELETE 
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
END $$;

-- Políticas para accounts_payable
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_payable' 
    AND policyname = 'Users can view company accounts payable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view company accounts payable" 
      ON public.accounts_payable 
      FOR SELECT 
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_payable' 
    AND policyname = 'Users can create company accounts payable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can create company accounts payable" 
      ON public.accounts_payable 
      FOR INSERT 
      WITH CHECK (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_payable' 
    AND policyname = 'Users can update company accounts payable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update company accounts payable" 
      ON public.accounts_payable 
      FOR UPDATE 
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts_payable' 
    AND policyname = 'Users can delete company accounts payable'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete company accounts payable" 
      ON public.accounts_payable 
      FOR DELETE 
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )';
  END IF;
END $$;
