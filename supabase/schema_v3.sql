-- =============================================
-- FINANCE APP — SCHEMA V3 (PLATAFORMA B2B2C)
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Expandir tabela profiles com tipo de conta
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'personal'
  CHECK (account_type IN ('personal', 'business'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nif TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'
  CHECK (plan IN ('free', 'personal_pro', 'business_starter', 'business_pro', 'enterprise'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_clients INT DEFAULT 0;

-- 2. TABELA: CLIENT_RELATIONSHIPS (Empresa -> Clientes geridos)
CREATE TABLE IF NOT EXISTS public.client_relationships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_email TEXT, -- email do cliente convidado (antes de aceitar)
    client_name  TEXT,
    status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, client_email)
);

-- 3. TABELA: CLIENT_INVITES (Convites por email)
CREATE TABLE IF NOT EXISTS public.client_invites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    token       TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES

ALTER TABLE public.client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;

-- Business can see and manage their clients
CREATE POLICY "Business vê os seus clientes"
  ON public.client_relationships FOR SELECT
  USING (auth.uid() = business_id);

CREATE POLICY "Business insere clientes"
  ON public.client_relationships FOR INSERT
  WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Business atualiza clientes"
  ON public.client_relationships FOR UPDATE
  USING (auth.uid() = business_id);

CREATE POLICY "Business elimina clientes"
  ON public.client_relationships FOR DELETE
  USING (auth.uid() = business_id);

-- Invite policies
CREATE POLICY "Business vê os seus convites"
  ON public.client_invites FOR SELECT
  USING (auth.uid() = business_id);

CREATE POLICY "Business cria convites"
  ON public.client_invites FOR INSERT
  WITH CHECK (auth.uid() = business_id);

-- Clients can see their own relationship
CREATE POLICY "Cliente vê a sua relação"
  ON public.client_relationships FOR SELECT
  USING (auth.uid() = client_id);

-- 5. Atualizar trigger para incluir account_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _account_type TEXT;
  _company_name TEXT;
BEGIN
  _account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal');
  _company_name := NEW.raw_user_meta_data->>'company_name';

  INSERT INTO public.profiles (id, full_name, email, avatar_url, account_type, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    _account_type,
    _company_name
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name     = EXCLUDED.full_name,
    avatar_url    = EXCLUDED.avatar_url,
    account_type  = COALESCE(profiles.account_type, EXCLUDED.account_type),
    company_name  = COALESCE(profiles.company_name, EXCLUDED.company_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Schema V3 aplicado com sucesso!' as status;
