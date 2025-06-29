
-- Create companies table for multi-tenant isolation
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table linked to companies
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles enum and table
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Create accounts receivable table
CREATE TABLE public.accounts_receivable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'received', 'overdue')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_period TEXT CHECK (recurring_period IN ('monthly', 'quarterly', 'yearly')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts payable table
CREATE TABLE public.accounts_payable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user's company
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = _role 
    AND company_id = public.get_user_company_id()
  );
$$;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (id = public.get_user_company_id());

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their company" ON public.profiles
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their company" ON public.user_roles
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Admins can manage roles in their company" ON public.user_roles
  FOR ALL USING (
    company_id = public.get_user_company_id() 
    AND public.has_role('admin')
  );

-- RLS Policies for accounts_receivable
CREATE POLICY "Users can view accounts receivable in their company" ON public.accounts_receivable
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create accounts receivable in their company" ON public.accounts_receivable
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() 
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update accounts receivable in their company" ON public.accounts_receivable
  FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Admins can delete accounts receivable in their company" ON public.accounts_receivable
  FOR DELETE USING (
    company_id = public.get_user_company_id() 
    AND public.has_role('admin')
  );

-- RLS Policies for accounts_payable
CREATE POLICY "Users can view accounts payable in their company" ON public.accounts_payable
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create accounts payable in their company" ON public.accounts_payable
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() 
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update accounts payable in their company" ON public.accounts_payable
  FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Admins can delete accounts payable in their company" ON public.accounts_payable
  FOR DELETE USING (
    company_id = public.get_user_company_id() 
    AND public.has_role('admin')
  );

-- Create trigger function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_user_roles_user_company ON public.user_roles(user_id, company_id);
CREATE INDEX idx_accounts_receivable_company ON public.accounts_receivable(company_id);
CREATE INDEX idx_accounts_payable_company ON public.accounts_payable(company_id);
CREATE INDEX idx_accounts_receivable_status ON public.accounts_receivable(status);
CREATE INDEX idx_accounts_payable_status ON public.accounts_payable(status);
