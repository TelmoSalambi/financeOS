-- =============================================
-- FINANCE APP — SCHEMA V2 (ORÇAMENTOS E METAS)
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. TABELA: BUDGETS (Orçamentos por Categoria/Mês)
CREATE TABLE IF NOT EXISTS public.budgets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount      DECIMAL(14,2) NOT NULL,
    month       TEXT NOT NULL, -- Formato: YYYY-MM
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, month)
);

-- 2. TABELA: GOALS (Metas Financeiras)
CREATE TABLE IF NOT EXISTS public.goals (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    target_amount  DECIMAL(14,2) NOT NULL,
    current_amount DECIMAL(14,2) DEFAULT 0,
    deadline       DATE,
    color          TEXT DEFAULT '#10B981',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS (Row Level Security)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals   ENABLE ROW LEVEL SECURITY;

-- Políticas: Budgets
CREATE POLICY "Ver orçamentos próprios"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Inserir orçamentos próprios"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atualizar orçamentos próprios"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Eliminar orçamentos próprios"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas: Goals
CREATE POLICY "Ver metas próprias"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Inserir metas próprias"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atualizar metas próprias"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Eliminar metas próprias"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- LOG
SELECT 'Tabelas budgets e goals criadas com RLS ativo.' as status;
