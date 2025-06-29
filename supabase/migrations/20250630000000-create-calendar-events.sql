-- Create calendar_events table for storing calendar events
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_payable_id UUID REFERENCES public.accounts_payable(id) ON DELETE CASCADE,
  account_receivable_id UUID REFERENCES public.accounts_receivable(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payable', 'receivable')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_calendar_events_company ON public.calendar_events(company_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(type);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view calendar events in their company" ON public.calendar_events
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create calendar events in their company" ON public.calendar_events
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update calendar events in their company" ON public.calendar_events
  FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Admins can delete calendar events in their company" ON public.calendar_events
  FOR DELETE USING (
    company_id = public.get_user_company_id() AND
    public.is_admin(auth.uid())
  );
