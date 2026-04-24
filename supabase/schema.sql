-- =============================================
-- FINANCE APP — ESQUEMA COMPLETO PARA SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =============================================


-- =============================================
-- 1. TABELA: PROFILES (perfil do utilizador)
-- Criada automaticamente quando alguém se regista
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name  TEXT,
    avatar_url TEXT,
    email      TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================
-- 2. TABELA: CATEGORIES (categorias)
-- Suporta categorias globais (user_id NULL)
-- e categorias criadas pelo utilizador
-- =============================================

CREATE TABLE IF NOT EXISTS public.categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon       TEXT,
    color      TEXT DEFAULT '#94a3b8',
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================
-- 3. TABELA: TRANSACTIONS (transações)
-- =============================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount      DECIMAL(14,2) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================
-- 4. TRIGGER: AUTO-CRIAR PERFIL NO REGISTO
-- Ao criar conta, um perfil é gerado automaticamente
-- a partir dos dados do Google ou Email/Senha
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir e criar novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Cada utilizador só vê e manipula os seus dados
-- =============================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- Políticas: Profiles
CREATE POLICY "Utilizador vê o seu perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilizador atualiza o seu perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- Políticas: Categories
CREATE POLICY "Ver categorias globais ou próprias"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Inserir categorias próprias"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Atualizar categorias próprias"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Eliminar categorias próprias"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid());


-- Políticas: Transactions
CREATE POLICY "Ver transações próprias"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Inserir transações próprias"
  ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Atualizar transações próprias"
  ON public.transactions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Eliminar transações próprias"
  ON public.transactions FOR DELETE
  USING (user_id = auth.uid());


-- =============================================
-- 6. SEED DATA: CATEGORIAS INICIAIS (Globais)
-- Visíveis para todos os utilizadores
-- =============================================

INSERT INTO public.categories (name, type, icon, color) VALUES
  -- Receitas
  ('Salário',        'income',  'briefcase',    '#10B981'),
  ('Freelance',      'income',  'code',         '#22c55e'),
  ('Investimentos',  'income',  'trending-up',  '#6366f1'),
  ('Presentes',      'income',  'gift',         '#f59e0b'),
  ('Outros Ganhos',  'income',  'plus-circle',  '#94a3b8'),
  -- Despesas
  ('Habitação',      'expense', 'home',         '#3b82f6'),
  ('Alimentação',    'expense', 'utensils',     '#f97316'),
  ('Transporte',     'expense', 'car',          '#8b5cf6'),
  ('Saúde',          'expense', 'heart-pulse',  '#ef4444'),
  ('Educação',       'expense', 'book-open',    '#0ea5e9'),
  ('Lazer',          'expense', 'smile',        '#ec4899'),
  ('Compras',        'expense', 'shopping-bag', '#f59e0b'),
  ('Telecomunicações','expense','wifi',         '#14b8a6'),
  ('Seguros',        'expense', 'shield',       '#6366f1'),
  ('Outros',         'expense', 'more-horizontal','#94a3b8')
ON CONFLICT DO NOTHING;


-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

SELECT 'Tabelas criadas: ' || count(*)::text AS status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'categories', 'transactions');

SELECT 'Categorias inseridas: ' || count(*)::text AS categorias
FROM public.categories WHERE user_id IS NULL;
