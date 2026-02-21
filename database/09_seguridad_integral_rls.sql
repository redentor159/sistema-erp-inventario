-- ============================================================================
-- SCRIPT DE SEGURIDAD INTEGRAL (RLS + VISTAS + FUNCIONES)
-- Fecha: 2026-02-21
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ejecutar este script COMPLETO en Supabase SQL Editor
-- 2. Luego insertar los roles de usuario (ver sección final)
-- 3. Este script resuelve: RLS de tablas, Vistas Security Definer y Functions Mutable Search Path.
-- ============================================================================

-- ============================================================================
-- PARTE 1: TABLA DE ROLES Y FUNCIONES HELPER (RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SECRETARIA', 'OPERARIO')),
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_roles" ON public.user_roles
    FOR ALL TO authenticated
    USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ADMIN')
    WITH CHECK ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ADMIN');

CREATE POLICY "user_see_own_role" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Helper function (debe estar en search_path blindado)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()),
        'OPERARIO'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- ============================================================================
-- PARTE 2: ELIMINACIÓN DE POLITICAS PUBLICAS PERMISIVAS
-- ============================================================================

-- MST (Maestras)
DROP POLICY IF EXISTS "Public Access mst_config_general" ON public.mst_config_general;
DROP POLICY IF EXISTS "Public Access mst_clientes" ON public.mst_clientes;
DROP POLICY IF EXISTS "Public Access mst_proveedores" ON public.mst_proveedores;
DROP POLICY IF EXISTS "Public Access mst_familias" ON public.mst_familias;
DROP POLICY IF EXISTS "Public Access mst_marcas" ON public.mst_marcas;
DROP POLICY IF EXISTS "Public Access mst_materiales" ON public.mst_materiales;
DROP POLICY IF EXISTS "Public Access mst_acabados_colores" ON public.mst_acabados_colores;
DROP POLICY IF EXISTS "Public Access mst_series_equivalencias" ON public.mst_series_equivalencias;
DROP POLICY IF EXISTS "Public Access mst_recetas_ingenieria" ON public.mst_recetas_ingenieria;

-- CAT (Catálogo)
DROP POLICY IF EXISTS "Public Access cat_plantillas" ON public.cat_plantillas;
DROP POLICY IF EXISTS "Allow All Plantillas" ON public.cat_plantillas;
DROP POLICY IF EXISTS "Public Access cat_productos_variantes" ON public.cat_productos_variantes;
DROP POLICY IF EXISTS "Allow All SKUs" ON public.cat_productos_variantes;

-- TRX (Transaccional)
DROP POLICY IF EXISTS "Public Access trx_cotizaciones_cabecera" ON public.trx_cotizaciones_cabecera;
DROP POLICY IF EXISTS "Public Access trx_cotizaciones_detalle" ON public.trx_cotizaciones_detalle;
DROP POLICY IF EXISTS "Public Access trx_desglose_materiales" ON public.trx_desglose_materiales;
DROP POLICY IF EXISTS "Public Access trx_entradas_cabecera" ON public.trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON public.trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow read access to anon users" ON public.trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to anon users" ON public.trx_entradas_cabecera;
DROP POLICY IF EXISTS "Public Access trx_entradas_detalle" ON public.trx_entradas_detalle;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.trx_entradas_detalle;
DROP POLICY IF EXISTS "Allow read access to anon users" ON public.trx_entradas_detalle;
DROP POLICY IF EXISTS "Public Access trx_salidas_cabecera" ON public.trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON public.trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow read access to anon users" ON public.trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to anon users" ON public.trx_salidas_cabecera;
DROP POLICY IF EXISTS "Public Access trx_salidas_detalle" ON public.trx_salidas_detalle;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.trx_salidas_detalle;
DROP POLICY IF EXISTS "Allow read access to anon users" ON public.trx_salidas_detalle;
DROP POLICY IF EXISTS "Public Access trx_movimientos" ON public.trx_movimientos;

-- DAT (Operativa)
DROP POLICY IF EXISTS "Public Access dat_retazos_disponibles" ON public.dat_retazos_disponibles;

-- Kanban
DROP POLICY IF EXISTS "Enable all for public users" ON public.trx_kanban_orders;
DROP POLICY IF EXISTS "Enable all for public users" ON public.trx_kanban_history;
DROP POLICY IF EXISTS "Enable all for public users" ON public.mst_kanban_config;

-- Se reportó que mst_recetas_modelos NO TIENE RLS. Habilitando:
ALTER TABLE public.mst_recetas_modelos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTE 3: CREACIÓN DE NUEVAS POLÍTICAS RLS (ADMIN, SECRETARIA, OPERARIO)
-- ============================================================================

-- mst_config_general
CREATE POLICY "config_admin_all" ON public.mst_config_general FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "config_secretaria_read" ON public.mst_config_general FOR SELECT TO authenticated USING (public.get_user_role() = 'SECRETARIA');

-- mst_clientes
CREATE POLICY "clientes_admin_secretaria_all" ON public.mst_clientes FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "clientes_operario_read" ON public.mst_clientes FOR SELECT TO authenticated USING (public.get_user_role() = 'OPERARIO');

-- mst_proveedores
CREATE POLICY "proveedores_admin_secretaria_all" ON public.mst_proveedores FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "proveedores_operario_read" ON public.mst_proveedores FOR SELECT TO authenticated USING (public.get_user_role() = 'OPERARIO');

-- Maestras comunes (familias, marcas, materiales, acabados, series)
CREATE POLICY "familias_admin_all" ON public.mst_familias FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "familias_read" ON public.mst_familias FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "marcas_admin_all" ON public.mst_marcas FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "marcas_read" ON public.mst_marcas FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "materiales_admin_all" ON public.mst_materiales FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "materiales_read" ON public.mst_materiales FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "acabados_admin_all" ON public.mst_acabados_colores FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "acabados_read" ON public.mst_acabados_colores FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "series_admin_all" ON public.mst_series_equivalencias FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "series_read" ON public.mst_series_equivalencias FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- mst_recetas_modelos
CREATE POLICY "recetas_modelos_admin_only" ON public.mst_recetas_modelos FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- mst_recetas_ingenieria
CREATE POLICY "recetas_admin_all" ON public.mst_recetas_ingenieria FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "recetas_secretaria_read" ON public.mst_recetas_ingenieria FOR SELECT TO authenticated USING (public.get_user_role() = 'SECRETARIA');

-- cat_plantillas y cat_productos_variantes
CREATE POLICY "plantillas_admin_all" ON public.cat_plantillas FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "plantillas_read" ON public.cat_plantillas FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "skus_admin_all" ON public.cat_productos_variantes FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "skus_read" ON public.cat_productos_variantes FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- Transacciones (Cotizaciones)
CREATE POLICY "cotizaciones_cab_admin_secretaria" ON public.trx_cotizaciones_cabecera FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "cotizaciones_det_admin_secretaria" ON public.trx_cotizaciones_detalle FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "desglose_admin_all" ON public.trx_desglose_materiales FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "desglose_secretaria_read" ON public.trx_desglose_materiales FOR SELECT TO authenticated USING (public.get_user_role() = 'SECRETARIA');

-- Transacciones (Entradas y Salidas)
CREATE POLICY "entradas_cab_admin_secretaria" ON public.trx_entradas_cabecera FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "entradas_cab_operario_read" ON public.trx_entradas_cabecera FOR SELECT TO authenticated USING (public.get_user_role() = 'OPERARIO');
CREATE POLICY "entradas_det_admin_secretaria" ON public.trx_entradas_detalle FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "entradas_det_operario_read" ON public.trx_entradas_detalle FOR SELECT TO authenticated USING (public.get_user_role() = 'OPERARIO');
CREATE POLICY "salidas_cab_admin_secretaria" ON public.trx_salidas_cabecera FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "salidas_cab_operario_read" ON public.trx_salidas_cabecera FOR SELECT TO authenticated USING (public.get_user_role() = 'OPERARIO');
CREATE POLICY "salidas_det_admin_secretaria" ON public.trx_salidas_detalle FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "salidas_det_operario_read" ON public.trx_salidas_detalle FOR SELECT TO authenticated USING (public.get_user_role() = 'OPERARIO');

-- Movimientos (Kardex)
CREATE POLICY "movimientos_admin_all" ON public.trx_movimientos FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "movimientos_read" ON public.trx_movimientos FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- Kanban y Operativa
CREATE POLICY "kanban_orders_admin_operario" ON public.trx_kanban_orders FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'OPERARIO'));
CREATE POLICY "kanban_orders_secretaria_read" ON public.trx_kanban_orders FOR SELECT TO authenticated USING (public.get_user_role() = 'SECRETARIA');
CREATE POLICY "kanban_history_admin_all" ON public.trx_kanban_history FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "kanban_history_read" ON public.trx_kanban_history FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "kanban_config_admin_all" ON public.mst_kanban_config FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
CREATE POLICY "kanban_config_read" ON public.mst_kanban_config FOR SELECT TO authenticated USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));
CREATE POLICY "retazos_admin_operario" ON public.dat_retazos_disponibles FOR ALL TO authenticated USING (public.get_user_role() IN ('ADMIN', 'OPERARIO'));
CREATE POLICY "retazos_secretaria_read" ON public.dat_retazos_disponibles FOR SELECT TO authenticated USING (public.get_user_role() = 'SECRETARIA');

-- ============================================================================
-- PARTE 4: REMEDIACIÓN DE SEGURIDAD (VISTAS INVOKER Y FUNCIONES BLINDADAS)
-- ============================================================================

-- Cambiando las 14 vistas problemáticas a SECURITY INVOKER
ALTER VIEW public.vw_kpi_ciclo_ventas SET (security_invoker = true);
ALTER VIEW public.vw_kpi_ticket_promedio SET (security_invoker = true);
ALTER VIEW public.vw_kpi_conversion SET (security_invoker = true);
ALTER VIEW public.vw_reporte_desglose SET (security_invoker = true);
ALTER VIEW public.vw_cotizaciones_totales SET (security_invoker = true);
ALTER VIEW public.vw_kpi_stock_zombie SET (security_invoker = true);
ALTER VIEW public.vw_dashboard_stock_realtime SET (security_invoker = true);
ALTER VIEW public.vw_kpi_valorizacion SET (security_invoker = true);
ALTER VIEW public.vw_kpi_margen_real SET (security_invoker = true);
ALTER VIEW public.vw_kpi_abc_analisis SET (security_invoker = true);
ALTER VIEW public.vw_kpi_top_productos SET (security_invoker = true);
ALTER VIEW public.vw_kpi_otif SET (security_invoker = true);
ALTER VIEW public.vw_cotizaciones_detalladas SET (security_invoker = true);
ALTER VIEW public.vw_kpi_retazos_valorizados SET (security_invoker = true);

-- Blindando el Search Path de todas las funciones RPC del sistema
ALTER FUNCTION public.get_abc_analysis_v2() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_abc_inventory_valuation() SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_calcular_sku_real() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_costos_mercado_bulk(jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.rename_sku(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_evaluar_formula(text, record) SET search_path = public, pg_temp;

-- BLINDAJE EXTRA PARA FUNCIONES MUTATIVAS QUE BYPASEAN RLS
-- (Kardex, Clonar, Despiece, Kanban) -> Mantienen SECURITY DEFINER pero con search_path seguro.
ALTER FUNCTION public.fn_trigger_entrada_to_kardex() SECURITY DEFINER SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_trigger_salida_to_kardex() SECURITY DEFINER SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_clonar_cotizacion(uuid) SECURITY DEFINER SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_clonar_item_cotizacion(uuid) SECURITY DEFINER SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_archive_kanban_order(text, text, text, jsonb, jsonb) SECURITY DEFINER SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_generar_despiece_ingenieria(uuid) SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================================
-- PASO FINAL: INSERCIÓN DE ROLES
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Copia los UUID de cada usuario
-- 3. Modifica tus UUID y corre esto para inicializar:
--
-- INSERT INTO public.user_roles (user_id, role, display_name) VALUES
--     ('TU-UUID-AQUI', 'ADMIN', 'Dueño / Gerente'),
--     ('OTRO-UUID-AQUI', 'SECRETARIA', 'Secretaria'),
--     ('OTRO-UUID-AQUI', 'OPERARIO', 'Moisés (Taller)');
