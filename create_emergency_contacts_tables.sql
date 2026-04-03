-- Emergency Contacts Table
-- This table stores emergency contacts for users

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_contacts
-- Users can only access their own emergency contacts

-- Policy for SELECT (read own contacts)
CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy for INSERT (create own contacts)
CREATE POLICY "Users can insert own emergency contacts" ON public.emergency_contacts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy for UPDATE (update own contacts)
CREATE POLICY "Users can update own emergency contacts" ON public.emergency_contacts
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy for DELETE (delete own contacts)
CREATE POLICY "Users can delete own emergency contacts" ON public.emergency_contacts
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON public.emergency_contacts(is_primary);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Emergency Messages Table
-- This table stores messages sent to emergency contacts

CREATE TABLE IF NOT EXISTS public.emergency_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for emergency_messages
ALTER TABLE public.emergency_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_messages
-- Users can only access their own messages

-- Policy for SELECT (read own messages)
CREATE POLICY "Users can view own emergency messages" ON public.emergency_messages
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy for INSERT (create own messages)
CREATE POLICY "Users can insert own emergency messages" ON public.emergency_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy for UPDATE (update own messages)
CREATE POLICY "Users can update own emergency messages" ON public.emergency_messages
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy for DELETE (delete own messages)
CREATE POLICY "Users can delete own emergency messages" ON public.emergency_messages
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_messages_user_id ON public.emergency_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_contact_id ON public.emergency_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_status ON public.emergency_messages(status);