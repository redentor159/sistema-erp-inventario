-- ============================================================================
-- SCRIPT 024: REMEDIACIÓN DE AUDITORÍA — RLS, RENDIMIENTO Y SEGURIDAD
-- Fecha: 2026-02-21
-- Objetivo: Resolver los 3 hallazgos críticos (P0) + hallazgos P1
-- ============================================================================
-- CAMBIOS:
-- 1. Consolidar 22 políticas RLS permisivas duplicadas (PERFORMANCE)
-- 2. Fix RLS InitPlan en login_logs (PERFORMANCE)
-- 3. Agregar search_path a funciones SECURITY DEFINER (SECURITY)
-- 4. Agregar índice en trx_movimientos.fecha_hora (PERFORMANCE)
-- 5. Limpiar índices innecesarios en login_logs (PERFORMANCE)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTE 1: CONSOLIDAR POLÍTICAS RLS PERMISIVAS DUPLICADAS
-- ============================================================================
-- Problema: Cada tabla tiene una política "FOR ALL" (admin) + una "FOR SELECT"
-- (otros roles). Ambas son PERMISSIVE FOR SELECT → PostgreSQL evalúa AMBAS.
-- Solución: Reemplazar con UNA política SELECT universal + UNA política WRITE.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- GRUPO A: Tablas con ADMIN: CRUD, SECRETARIA: R, OPERARIO: R
-- (familias, marcas, materiales, acabados, series, plantillas, skus,
--  kanban_config, kanban_history, movimientos)
-- → SELECT: todos los authenticated
-- → INSERT/UPDATE/DELETE: solo ADMIN
-- ─────────────────────────────────────────────────────────────

-- mst_familias
DROP POLICY IF EXISTS "familias_admin_all" ON public.mst_familias;
DROP POLICY IF EXISTS "familias_read" ON public.mst_familias;
CREATE POLICY "familias_select" ON public.mst_familias
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "familias_write" ON public.mst_familias
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "familias_update" ON public.mst_familias
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "familias_delete" ON public.mst_familias
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- mst_marcas
DROP POLICY IF EXISTS "marcas_admin_all" ON public.mst_marcas;
DROP POLICY IF EXISTS "marcas_read" ON public.mst_marcas;
CREATE POLICY "marcas_select" ON public.mst_marcas
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "marcas_write" ON public.mst_marcas
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "marcas_update" ON public.mst_marcas
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "marcas_delete" ON public.mst_marcas
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- mst_materiales
DROP POLICY IF EXISTS "materiales_admin_all" ON public.mst_materiales;
DROP POLICY IF EXISTS "materiales_read" ON public.mst_materiales;
CREATE POLICY "materiales_select" ON public.mst_materiales
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "materiales_write" ON public.mst_materiales
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "materiales_update" ON public.mst_materiales
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "materiales_delete" ON public.mst_materiales
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- mst_acabados_colores
DROP POLICY IF EXISTS "acabados_admin_all" ON public.mst_acabados_colores;
DROP POLICY IF EXISTS "acabados_read" ON public.mst_acabados_colores;
CREATE POLICY "acabados_select" ON public.mst_acabados_colores
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "acabados_write" ON public.mst_acabados_colores
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "acabados_update" ON public.mst_acabados_colores
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "acabados_delete" ON public.mst_acabados_colores
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- mst_series_equivalencias
DROP POLICY IF EXISTS "series_admin_all" ON public.mst_series_equivalencias;
DROP POLICY IF EXISTS "series_read" ON public.mst_series_equivalencias;
CREATE POLICY "series_select" ON public.mst_series_equivalencias
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "series_write" ON public.mst_series_equivalencias
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "series_update" ON public.mst_series_equivalencias
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "series_delete" ON public.mst_series_equivalencias
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- cat_plantillas
DROP POLICY IF EXISTS "plantillas_admin_all" ON public.cat_plantillas;
DROP POLICY IF EXISTS "plantillas_read" ON public.cat_plantillas;
CREATE POLICY "plantillas_select" ON public.cat_plantillas
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "plantillas_write" ON public.cat_plantillas
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "plantillas_update" ON public.cat_plantillas
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "plantillas_delete" ON public.cat_plantillas
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- cat_productos_variantes (SKUs) — tabla más grande (5,802 filas)
DROP POLICY IF EXISTS "skus_admin_all" ON public.cat_productos_variantes;
DROP POLICY IF EXISTS "skus_read" ON public.cat_productos_variantes;
CREATE POLICY "skus_select" ON public.cat_productos_variantes
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "skus_write" ON public.cat_productos_variantes
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "skus_update" ON public.cat_productos_variantes
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "skus_delete" ON public.cat_productos_variantes
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- mst_kanban_config
DROP POLICY IF EXISTS "kanban_config_admin_all" ON public.mst_kanban_config;
DROP POLICY IF EXISTS "kanban_config_read" ON public.mst_kanban_config;
CREATE POLICY "kanban_config_select" ON public.mst_kanban_config
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "kanban_config_write" ON public.mst_kanban_config
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "kanban_config_update" ON public.mst_kanban_config
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "kanban_config_delete" ON public.mst_kanban_config
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- trx_kanban_history
DROP POLICY IF EXISTS "kanban_history_admin_all" ON public.trx_kanban_history;
DROP POLICY IF EXISTS "kanban_history_read" ON public.trx_kanban_history;
CREATE POLICY "kanban_history_select" ON public.trx_kanban_history
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "kanban_history_write" ON public.trx_kanban_history
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "kanban_history_update" ON public.trx_kanban_history
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "kanban_history_delete" ON public.trx_kanban_history
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- trx_movimientos (kardex)
DROP POLICY IF EXISTS "movimientos_admin_all" ON public.trx_movimientos;
DROP POLICY IF EXISTS "movimientos_read" ON public.trx_movimientos;
CREATE POLICY "movimientos_select" ON public.trx_movimientos
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "movimientos_write" ON public.trx_movimientos
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "movimientos_update" ON public.trx_movimientos
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "movimientos_delete" ON public.trx_movimientos
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- ─────────────────────────────────────────────────────────────
-- GRUPO B: Tablas con ADMIN+SECRETARIA: CRUD, OPERARIO: R
-- (clientes, proveedores, entradas_cab, entradas_det, 
--  salidas_cab, salidas_det)
-- → SELECT: todos los authenticated
-- → INSERT/UPDATE/DELETE: ADMIN + SECRETARIA
-- ─────────────────────────────────────────────────────────────

-- mst_clientes
DROP POLICY IF EXISTS "clientes_admin_secretaria_all" ON public.mst_clientes;
DROP POLICY IF EXISTS "clientes_operario_read" ON public.mst_clientes;
CREATE POLICY "clientes_select" ON public.mst_clientes
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "clientes_write" ON public.mst_clientes
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "clientes_update" ON public.mst_clientes
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "clientes_delete" ON public.mst_clientes
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));

-- mst_proveedores
DROP POLICY IF EXISTS "proveedores_admin_secretaria_all" ON public.mst_proveedores;
DROP POLICY IF EXISTS "proveedores_operario_read" ON public.mst_proveedores;
CREATE POLICY "proveedores_select" ON public.mst_proveedores
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "proveedores_write" ON public.mst_proveedores
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "proveedores_update" ON public.mst_proveedores
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "proveedores_delete" ON public.mst_proveedores
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));

-- trx_entradas_cabecera
DROP POLICY IF EXISTS "entradas_cab_admin_secretaria" ON public.trx_entradas_cabecera;
DROP POLICY IF EXISTS "entradas_cab_operario_read" ON public.trx_entradas_cabecera;
CREATE POLICY "entradas_cab_select" ON public.trx_entradas_cabecera
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "entradas_cab_write" ON public.trx_entradas_cabecera
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "entradas_cab_update" ON public.trx_entradas_cabecera
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "entradas_cab_delete" ON public.trx_entradas_cabecera
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));

-- trx_entradas_detalle
DROP POLICY IF EXISTS "entradas_det_admin_secretaria" ON public.trx_entradas_detalle;
DROP POLICY IF EXISTS "entradas_det_operario_read" ON public.trx_entradas_detalle;
CREATE POLICY "entradas_det_select" ON public.trx_entradas_detalle
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "entradas_det_write" ON public.trx_entradas_detalle
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "entradas_det_update" ON public.trx_entradas_detalle
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "entradas_det_delete" ON public.trx_entradas_detalle
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));

-- trx_salidas_cabecera
DROP POLICY IF EXISTS "salidas_cab_admin_secretaria" ON public.trx_salidas_cabecera;
DROP POLICY IF EXISTS "salidas_cab_operario_read" ON public.trx_salidas_cabecera;
CREATE POLICY "salidas_cab_select" ON public.trx_salidas_cabecera
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "salidas_cab_write" ON public.trx_salidas_cabecera
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "salidas_cab_update" ON public.trx_salidas_cabecera
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "salidas_cab_delete" ON public.trx_salidas_cabecera
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));

-- trx_salidas_detalle
DROP POLICY IF EXISTS "salidas_det_admin_secretaria" ON public.trx_salidas_detalle;
DROP POLICY IF EXISTS "salidas_det_operario_read" ON public.trx_salidas_detalle;
CREATE POLICY "salidas_det_select" ON public.trx_salidas_detalle
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "salidas_det_write" ON public.trx_salidas_detalle
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "salidas_det_update" ON public.trx_salidas_detalle
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "salidas_det_delete" ON public.trx_salidas_detalle
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));

-- ─────────────────────────────────────────────────────────────
-- GRUPO C: Tablas con ADMIN: CRUD, SECRETARIA: R, OPERARIO: ❌
-- (config_general, recetas_ingenieria, desglose_materiales)
-- → SELECT: ADMIN + SECRETARIA 
-- → INSERT/UPDATE/DELETE: ADMIN
-- ─────────────────────────────────────────────────────────────

-- mst_config_general
DROP POLICY IF EXISTS "config_admin_all" ON public.mst_config_general;
DROP POLICY IF EXISTS "config_secretaria_read" ON public.mst_config_general;
CREATE POLICY "config_select" ON public.mst_config_general
    FOR SELECT TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "config_write" ON public.mst_config_general
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "config_update" ON public.mst_config_general
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "config_delete" ON public.mst_config_general
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- mst_recetas_ingenieria
DROP POLICY IF EXISTS "recetas_admin_all" ON public.mst_recetas_ingenieria;
DROP POLICY IF EXISTS "recetas_secretaria_read" ON public.mst_recetas_ingenieria;
CREATE POLICY "recetas_select" ON public.mst_recetas_ingenieria
    FOR SELECT TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "recetas_write" ON public.mst_recetas_ingenieria
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "recetas_update" ON public.mst_recetas_ingenieria
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "recetas_delete" ON public.mst_recetas_ingenieria
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- trx_desglose_materiales
DROP POLICY IF EXISTS "desglose_admin_all" ON public.trx_desglose_materiales;
DROP POLICY IF EXISTS "desglose_secretaria_read" ON public.trx_desglose_materiales;
CREATE POLICY "desglose_select" ON public.trx_desglose_materiales
    FOR SELECT TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "desglose_write" ON public.trx_desglose_materiales
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "desglose_update" ON public.trx_desglose_materiales
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "desglose_delete" ON public.trx_desglose_materiales
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- ─────────────────────────────────────────────────────────────
-- GRUPO D: Tablas con patrones especiales
-- ─────────────────────────────────────────────────────────────

-- trx_kanban_orders (ADMIN+OPERARIO: CRUD, SECRETARIA: R)
DROP POLICY IF EXISTS "kanban_orders_admin_operario" ON public.trx_kanban_orders;
DROP POLICY IF EXISTS "kanban_orders_secretaria_read" ON public.trx_kanban_orders;
CREATE POLICY "kanban_orders_select" ON public.trx_kanban_orders
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "kanban_orders_write" ON public.trx_kanban_orders
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'));
CREATE POLICY "kanban_orders_update" ON public.trx_kanban_orders
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'));
CREATE POLICY "kanban_orders_delete" ON public.trx_kanban_orders
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'));

-- dat_retazos_disponibles (ADMIN+OPERARIO: CRUD, SECRETARIA: R)
DROP POLICY IF EXISTS "retazos_admin_operario" ON public.dat_retazos_disponibles;
DROP POLICY IF EXISTS "retazos_secretaria_read" ON public.dat_retazos_disponibles;
CREATE POLICY "retazos_select" ON public.dat_retazos_disponibles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "retazos_write" ON public.dat_retazos_disponibles
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'));
CREATE POLICY "retazos_update" ON public.dat_retazos_disponibles
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'))
    WITH CHECK ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'));
CREATE POLICY "retazos_delete" ON public.dat_retazos_disponibles
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) IN ('ADMIN', 'OPERARIO'));

-- user_roles (ADMIN: CRUD, self: R)
DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_see_own_role" ON public.user_roles;
CREATE POLICY "roles_select" ON public.user_roles
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        OR (SELECT public.get_user_role()) = 'ADMIN'
    );
CREATE POLICY "roles_write" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "roles_update" ON public.user_roles
    FOR UPDATE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN')
    WITH CHECK ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "roles_delete" ON public.user_roles
    FOR DELETE TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- login_logs (consolidar las dos INSERT + fix InitPlan)
DROP POLICY IF EXISTS "login_logs_admin_only" ON public.login_logs;
DROP POLICY IF EXISTS "login_logs_insert_own" ON public.login_logs;
CREATE POLICY "login_logs_select" ON public.login_logs
    FOR SELECT TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');
CREATE POLICY "login_logs_insert" ON public.login_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));


-- ============================================================================
-- PARTE 2: SEGURIDAD — search_path EN FUNCIONES SECURITY DEFINER
-- ============================================================================

ALTER FUNCTION public.get_user_role() SET search_path = public, pg_temp;

-- Setear search_path dinámicamente usando OID (no requiere conocer la firma exacta)
DO $$
DECLARE
    r RECORD;
    func_names TEXT[] := ARRAY[
        'fn_generar_despiece_ingenieria',
        'fn_clonar_cotizacion',
        'fn_clonar_item_cotizacion',
        'fn_archive_kanban_order',
        'fn_trigger_entrada_to_kardex',
        'fn_trigger_salida_to_kardex',
        'rename_sku',
        'update_costos_mercado_bulk'
    ];
    fn TEXT;
BEGIN
    FOREACH fn IN ARRAY func_names LOOP
        FOR r IN
            SELECT p.oid, p.proname,
                   pg_catalog.pg_get_function_identity_arguments(p.oid) AS args
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = fn
        LOOP
            EXECUTE format(
                'ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp',
                r.proname, r.args
            );
            RAISE NOTICE 'Set search_path for: public.%(%)', r.proname, r.args;
        END LOOP;
    END LOOP;
END $$;


-- ============================================================================
-- PARTE 3: ÍNDICES DE RENDIMIENTO
-- ============================================================================

-- Índice para ORDER BY fecha_hora DESC en Kardex
CREATE INDEX IF NOT EXISTS idx_trx_movimientos_fecha_hora 
ON public.trx_movimientos(fecha_hora DESC);

-- Compuesto para el JOIN más pesado (stock view)
CREATE INDEX IF NOT EXISTS idx_trx_movimientos_sku_fecha 
ON public.trx_movimientos(id_sku, fecha_hora DESC);

-- Eliminar índices que nunca se usan en tabla pequeña
DROP INDEX IF EXISTS idx_login_logs_user_id;
DROP INDEX IF EXISTS idx_login_logs_logged_in;


-- ============================================================================
-- VERIFICACIÓN POST-SCRIPT
-- ============================================================================
-- Ejecutar después para validar que no quedan políticas duplicadas:
-- 
-- SELECT schemaname, tablename, policyname, permissive, cmd
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd, policyname;

COMMIT;
