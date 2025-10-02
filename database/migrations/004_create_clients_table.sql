-- Create clients table for storing client information
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  architect_id UUID NOT NULL REFERENCES public.architects(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tax_id TEXT, -- CUIT/DNI
  
  -- Address Information
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Argentina',
  
  -- Additional Information
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  -- Constraints
  CONSTRAINT clients_email_unique UNIQUE (architect_id, email),
  CONSTRAINT clients_tax_id_unique UNIQUE (architect_id, tax_id)
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_clients_architect_id ON public.clients(architect_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_tax_id ON public.clients(tax_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);

-- Enable trigram extension for fuzzy search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Architects can only see their own clients
CREATE POLICY "Architects can view their own clients" ON public.clients
  FOR SELECT
  USING (architect_id = auth.uid());

-- Policy: Architects can insert their own clients
CREATE POLICY "Architects can insert their own clients" ON public.clients
  FOR INSERT
  WITH CHECK (architect_id = auth.uid());

-- Policy: Architects can update their own clients
CREATE POLICY "Architects can update their own clients" ON public.clients
  FOR UPDATE
  USING (architect_id = auth.uid())
  WITH CHECK (architect_id = auth.uid());

-- Policy: Architects can delete their own clients
CREATE POLICY "Architects can delete their own clients" ON public.clients
  FOR DELETE
  USING (architect_id = auth.uid());

-- Add client_id to projects table to establish relationship
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create index on projects.client_id for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);

-- Add comment to table
COMMENT ON TABLE public.clients IS 'Stores client information for architects';
COMMENT ON COLUMN public.clients.architect_id IS 'The architect who owns this client record';
COMMENT ON COLUMN public.clients.name IS 'Full name of the client';
COMMENT ON COLUMN public.clients.tax_id IS 'CUIT or DNI number';
COMMENT ON COLUMN public.clients.metadata IS 'Additional flexible data in JSON format';

-- Insert sample clients for testing (optional - remove in production)
-- These will only be visible to the architect who creates them
/*
INSERT INTO public.clients (architect_id, name, email, phone, tax_id, address, city)
VALUES 
  (auth.uid(), 'Juan Pérez', 'juan.perez@email.com', '+54 11 1234-5678', '20-12345678-9', 'Av. Corrientes 1234', 'Buenos Aires'),
  (auth.uid(), 'María González', 'maria.gonzalez@email.com', '+54 11 9876-5432', '27-98765432-1', 'Av. Santa Fe 5678', 'Buenos Aires'),
  (auth.uid(), 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '+54 11 5555-5555', '20-55555555-5', 'Av. Libertador 9012', 'Buenos Aires')
ON CONFLICT DO NOTHING;
*/