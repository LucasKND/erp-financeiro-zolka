
-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_payable_id UUID REFERENCES public.accounts_payable(id) ON DELETE CASCADE,
  account_receivable_id UUID REFERENCES public.accounts_receivable(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payable', 'receivable')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'received', 'overdue')),
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

CREATE POLICY "Users can delete calendar events in their company" ON public.calendar_events
  FOR DELETE USING (company_id = public.get_user_company_id());

-- Create a function to automatically create calendar events when accounts are created/updated
CREATE OR REPLACE FUNCTION create_calendar_event_for_account()
RETURNS TRIGGER AS $$
BEGIN
  -- For accounts_payable
  IF TG_TABLE_NAME = 'accounts_payable' THEN
    INSERT INTO public.calendar_events (
      company_id,
      account_payable_id,
      date,
      title,
      amount,
      type,
      status,
      created_by
    ) VALUES (
      NEW.company_id,
      NEW.id,
      NEW.due_date,
      NEW.supplier_name || ' - ' || NEW.description,
      NEW.amount,
      'payable',
      NEW.status,
      NEW.created_by
    )
    ON CONFLICT (account_payable_id) 
    DO UPDATE SET
      date = EXCLUDED.date,
      title = EXCLUDED.title,
      amount = EXCLUDED.amount,
      status = EXCLUDED.status,
      updated_at = now();
  END IF;

  -- For accounts_receivable  
  IF TG_TABLE_NAME = 'accounts_receivable' THEN
    INSERT INTO public.calendar_events (
      company_id,
      account_receivable_id,
      date,
      title,
      amount,
      type,
      status,
      created_by
    ) VALUES (
      NEW.company_id,
      NEW.id,
      NEW.due_date,
      NEW.client_name || ' - ' || NEW.description,
      NEW.amount,
      'receivable',
      NEW.status,
      NEW.created_by
    )
    ON CONFLICT (account_receivable_id)
    DO UPDATE SET
      date = EXCLUDED.date,
      title = EXCLUDED.title,
      amount = EXCLUDED.amount,
      status = EXCLUDED.status,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically create calendar events
CREATE TRIGGER trigger_create_calendar_event_payable
  AFTER INSERT OR UPDATE ON public.accounts_payable
  FOR EACH ROW
  EXECUTE FUNCTION create_calendar_event_for_account();

CREATE TRIGGER trigger_create_calendar_event_receivable
  AFTER INSERT OR UPDATE ON public.accounts_receivable
  FOR EACH ROW
  EXECUTE FUNCTION create_calendar_event_for_account();

-- Create a function to handle deletion of accounts
CREATE OR REPLACE FUNCTION delete_calendar_event_for_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete calendar event when account is deleted
  IF TG_TABLE_NAME = 'accounts_payable' THEN
    DELETE FROM public.calendar_events 
    WHERE account_payable_id = OLD.id;
  END IF;

  IF TG_TABLE_NAME = 'accounts_receivable' THEN
    DELETE FROM public.calendar_events 
    WHERE account_receivable_id = OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for deletion
CREATE TRIGGER trigger_delete_calendar_event_payable
  AFTER DELETE ON public.accounts_payable
  FOR EACH ROW
  EXECUTE FUNCTION delete_calendar_event_for_account();

CREATE TRIGGER trigger_delete_calendar_event_receivable
  AFTER DELETE ON public.accounts_receivable
  FOR EACH ROW
  EXECUTE FUNCTION delete_calendar_event_for_account();

-- Add unique constraints to prevent duplicate events
ALTER TABLE public.calendar_events 
ADD CONSTRAINT unique_payable_event UNIQUE (account_payable_id);

ALTER TABLE public.calendar_events 
ADD CONSTRAINT unique_receivable_event UNIQUE (account_receivable_id);

-- Populate existing accounts into calendar_events
INSERT INTO public.calendar_events (
  company_id, account_payable_id, date, title, amount, type, status, created_by
)
SELECT 
  company_id, id, due_date, 
  supplier_name || ' - ' || description,
  amount, 'payable', status, created_by
FROM public.accounts_payable
ON CONFLICT (account_payable_id) DO NOTHING;

INSERT INTO public.calendar_events (
  company_id, account_receivable_id, date, title, amount, type, status, created_by
)
SELECT 
  company_id, id, due_date,
  client_name || ' - ' || description, 
  amount, 'receivable', status, created_by
FROM public.accounts_receivable
ON CONFLICT (account_receivable_id) DO NOTHING;
