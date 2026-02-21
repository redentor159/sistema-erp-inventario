-- =================================================================================================
-- SCRIPT DE LIMPIEZA POST-INSTALACION RLS (Opcional pero Recomendado)
-- Resuelve advertencias del Linter de Supabase (Performance y Duplicate Indexes)
-- =================================================================================================

-- 1. FIX: auth_rls_initplan (Suboptimal query performance)
-- Reemplaza auth.uid() con (select auth.uid()) para evitar reevaluación por fila
DROP POLICY IF EXISTS "user_see_own_role" ON public.user_roles;
CREATE POLICY "user_see_own_role" ON public.user_roles FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
CREATE POLICY "admin_manage_roles" ON public.user_roles FOR ALL USING ((select public.get_user_role()) = 'ADMIN');


-- 2. FIX: duplicate_index (Índices idénticos)
-- Elimina los índices duplicados detectados por el linter
DROP INDEX IF EXISTS public.idx_cat_productos_plantilla;
DROP INDEX IF EXISTS public.idx_trx_movimientos_sku;
