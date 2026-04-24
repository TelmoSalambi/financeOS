-- =============================================
-- FINANCE APP — RLS ENHANCEMENTS FOR B2B2C
-- Allows Business Users to see their Clients' data
-- =============================================

-- 1. Function to check if current user is the business manager of a client
CREATE OR REPLACE FUNCTION public.is_business_manager_of(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.client_relationships
    WHERE business_id = auth.uid() 
    AND client_id = target_user_id 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Transactions Policies
DROP POLICY IF EXISTS "Ver transações próprias" ON public.transactions;
CREATE POLICY "Ver transações próprias e geridas"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid() OR public.is_business_manager_of(user_id));

-- 3. Update Categories Policies
DROP POLICY IF EXISTS "Ver categorias globais ou próprias" ON public.categories;
CREATE POLICY "Ver categorias globais, próprias ou geridas"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid() OR public.is_business_manager_of(user_id));

-- 4. Update Budgets Policies
DROP POLICY IF EXISTS "Ver orçamentos próprios" ON public.budgets;
CREATE POLICY "Ver orçamentos próprios e geridos"
  ON public.budgets FOR SELECT
  USING (user_id = auth.uid() OR public.is_business_manager_of(user_id));

-- 5. Update Goals Policies
DROP POLICY IF EXISTS "Ver metas próprias" ON public.goals;
CREATE POLICY "Ver metas próprias e geridas"
  ON public.goals FOR SELECT
  USING (user_id = auth.uid() OR public.is_business_manager_of(user_id));

-- 6. Update Profiles Policies
DROP POLICY IF EXISTS "Utilizador vê o seu perfil" ON public.profiles;
CREATE POLICY "Ver perfil próprio ou de cliente gerido"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_business_manager_of(id));

SELECT 'Políticas RLS actualizadas para suporte B2B2C.' as status;
