
-- Enable Row Level Security on all tables
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies first
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow creating user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their company receivables" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can manage their company payables" ON public.accounts_payable;

-- Create comprehensive RLS policies for companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT 
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Allow company creation during signup" ON public.companies
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create RLS policies for user_roles
CREATE POLICY "Users can view roles in their company" ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Allow role creation during signup" ON public.user_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create RLS policies for accounts_receivable
CREATE POLICY "Users can manage company accounts receivable" ON public.accounts_receivable
  FOR ALL 
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

-- Create RLS policies for accounts_payable
CREATE POLICY "Users can manage company accounts payable" ON public.accounts_payable
  FOR ALL 
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

-- Update the access_code field to be required for company security
ALTER TABLE public.companies ALTER COLUMN access_code SET NOT NULL;

-- Add unique constraint on company name and access_code combination
ALTER TABLE public.companies ADD CONSTRAINT unique_company_access_code UNIQUE (name, access_code);

-- Create an index for better performance on company lookups
CREATE INDEX IF NOT EXISTS idx_companies_name_access_code ON public.companies(name, access_code);
