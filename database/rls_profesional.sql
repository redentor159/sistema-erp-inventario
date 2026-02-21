-- ============================================================================
-- RLS PROFESIONAL - Sistema ERP Criogenizado
-- 3 Perfiles: ADMIN, SECRETARIA, OPERARIO
-- Fecha: 2026-02-21
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ejecutar este script COMPLETO en Supabase SQL Editor
-- 2. Luego insertar los roles de usuario (ver sección final)
-- ============================================================================

-- ============================================================================
-- PASO 1: Tabla de Roles de Usuario
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SECRETARIA', 'OPERARIO')),
    display_name TEXT,           -- Nombre para mostrar (ej: "Juan Pérez")
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Solo ADMIN puede ver/modificar roles
CREATE POLICY "admin_manage_roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ADMIN'
    )
    WITH CHECK (
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ADMIN'
    );

-- Cada usuario puede ver su propio rol
CREATE POLICY "user_see_own_role" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- PASO 2: Función Helper para obtener rol del usuario actual
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()),
        'OPERARIO'  -- Default: perfil más restrictivo
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- PASO 3: Eliminar TODAS las políticas "Public Access" existentes
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

-- ============================================================================
-- PASO 4: Nuevas Políticas por Tabla
-- ============================================================================

-- ---------------------
-- mst_config_general
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: ❌
-- ---------------------
CREATE POLICY "config_admin_all" ON public.mst_config_general
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "config_secretaria_read" ON public.mst_config_general
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'SECRETARIA');

-- ---------------------
-- mst_clientes
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: R
-- ---------------------
CREATE POLICY "clientes_admin_secretaria_all" ON public.mst_clientes
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

CREATE POLICY "clientes_operario_read" ON public.mst_clientes
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'OPERARIO');

-- ---------------------
-- mst_proveedores
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: R
-- ---------------------
CREATE POLICY "proveedores_admin_secretaria_all" ON public.mst_proveedores
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

CREATE POLICY "proveedores_operario_read" ON public.mst_proveedores
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'OPERARIO');

-- ---------------------
-- mst_familias, mst_marcas, mst_materiales, mst_acabados_colores, mst_series_equivalencias
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: R
-- ---------------------

-- mst_familias
CREATE POLICY "familias_admin_all" ON public.mst_familias
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "familias_read" ON public.mst_familias
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- mst_marcas
CREATE POLICY "marcas_admin_all" ON public.mst_marcas
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "marcas_read" ON public.mst_marcas
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- mst_materiales
CREATE POLICY "materiales_admin_all" ON public.mst_materiales
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "materiales_read" ON public.mst_materiales
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- mst_acabados_colores
CREATE POLICY "acabados_admin_all" ON public.mst_acabados_colores
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "acabados_read" ON public.mst_acabados_colores
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- mst_series_equivalencias
CREATE POLICY "series_admin_all" ON public.mst_series_equivalencias
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "series_read" ON public.mst_series_equivalencias
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- ---------------------
-- mst_recetas_modelos
-- ADMIN: CRUD | SECRETARIA: ❌ | OPERARIO: ❌
-- ---------------------
CREATE POLICY "recetas_modelos_admin_only" ON public.mst_recetas_modelos
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

-- ---------------------
-- mst_recetas_ingenieria
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: ❌
-- ---------------------
CREATE POLICY "recetas_admin_all" ON public.mst_recetas_ingenieria
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "recetas_secretaria_read" ON public.mst_recetas_ingenieria
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'SECRETARIA');

-- ---------------------
-- cat_plantillas
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: R
-- ---------------------
CREATE POLICY "plantillas_admin_all" ON public.cat_plantillas
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "plantillas_read" ON public.cat_plantillas
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- ---------------------
-- cat_productos_variantes
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: R
-- ---------------------
CREATE POLICY "skus_admin_all" ON public.cat_productos_variantes
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "skus_read" ON public.cat_productos_variantes
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- ---------------------
-- trx_cotizaciones_cabecera
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: ❌
-- ---------------------
CREATE POLICY "cotizaciones_cab_admin_secretaria" ON public.trx_cotizaciones_cabecera
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

-- ---------------------
-- trx_cotizaciones_detalle
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: ❌
-- ---------------------
CREATE POLICY "cotizaciones_det_admin_secretaria" ON public.trx_cotizaciones_detalle
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

-- ---------------------
-- trx_desglose_materiales
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: ❌
-- ---------------------
CREATE POLICY "desglose_admin_all" ON public.trx_desglose_materiales
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "desglose_secretaria_read" ON public.trx_desglose_materiales
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'SECRETARIA');

-- ---------------------
-- trx_entradas_cabecera
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: R
-- ---------------------
CREATE POLICY "entradas_cab_admin_secretaria" ON public.trx_entradas_cabecera
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

CREATE POLICY "entradas_cab_operario_read" ON public.trx_entradas_cabecera
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'OPERARIO');

-- ---------------------
-- trx_entradas_detalle
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: R
-- ---------------------
CREATE POLICY "entradas_det_admin_secretaria" ON public.trx_entradas_detalle
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

CREATE POLICY "entradas_det_operario_read" ON public.trx_entradas_detalle
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'OPERARIO');

-- ---------------------
-- trx_salidas_cabecera
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: R
-- ---------------------
CREATE POLICY "salidas_cab_admin_secretaria" ON public.trx_salidas_cabecera
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

CREATE POLICY "salidas_cab_operario_read" ON public.trx_salidas_cabecera
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'OPERARIO');

-- ---------------------
-- trx_salidas_detalle
-- ADMIN: CRUD | SECRETARIA: CRUD | OPERARIO: R
-- ---------------------
CREATE POLICY "salidas_det_admin_secretaria" ON public.trx_salidas_detalle
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'SECRETARIA'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'SECRETARIA'));

CREATE POLICY "salidas_det_operario_read" ON public.trx_salidas_detalle
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'OPERARIO');

-- ---------------------
-- trx_movimientos (Kardex)
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: R
-- NOTA: Los INSERTs los hacen los TRIGGERS, no usuarios directamente
-- ---------------------
CREATE POLICY "movimientos_admin_all" ON public.trx_movimientos
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "movimientos_read" ON public.trx_movimientos
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- ---------------------
-- trx_kanban_orders
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: CRUD
-- ---------------------
CREATE POLICY "kanban_orders_admin_operario" ON public.trx_kanban_orders
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'OPERARIO'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'OPERARIO'));

CREATE POLICY "kanban_orders_secretaria_read" ON public.trx_kanban_orders
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'SECRETARIA');

-- ---------------------
-- trx_kanban_history
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: R
-- ---------------------
CREATE POLICY "kanban_history_admin_all" ON public.trx_kanban_history
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "kanban_history_read" ON public.trx_kanban_history
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- ---------------------
-- mst_kanban_config
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: R
-- ---------------------
CREATE POLICY "kanban_config_admin_all" ON public.mst_kanban_config
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "kanban_config_read" ON public.mst_kanban_config
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('SECRETARIA', 'OPERARIO'));

-- ---------------------
-- dat_retazos_disponibles
-- ADMIN: CRUD | SECRETARIA: R | OPERARIO: CRUD
-- ---------------------
CREATE POLICY "retazos_admin_operario" ON public.dat_retazos_disponibles
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'OPERARIO'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'OPERARIO'));

CREATE POLICY "retazos_secretaria_read" ON public.dat_retazos_disponibles
    FOR SELECT TO authenticated
    USING (public.get_user_role() = 'SECRETARIA');

-- ============================================================================
-- PASO 5: Permisos especiales para funciones que necesitan bypass RLS
-- ============================================================================
-- Los triggers de Kardex insertan en trx_movimientos desde contexto de trigger,
-- necesitan SECURITY DEFINER para bypasear las políticas RLS.

-- Ya son SECURITY DEFINER: fn_trigger_entrada_to_kardex, fn_trigger_salida_to_kardex
-- Ya son SECURITY DEFINER: rename_sku, update_costos_mercado_bulk
-- fn_generar_despiece_ingenieria necesita leer/escribir varias tablas:

ALTER FUNCTION public.fn_generar_despiece_ingenieria(uuid) SECURITY DEFINER;
ALTER FUNCTION public.fn_clonar_cotizacion(uuid) SECURITY DEFINER;
ALTER FUNCTION public.fn_clonar_item_cotizacion(uuid) SECURITY DEFINER;
ALTER FUNCTION public.fn_archive_kanban_order(text, text, text, jsonb, jsonb) SECURITY DEFINER;

-- ============================================================================
-- PASO 6: Asignar roles a usuarios
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Copia los UUID de cada usuario
-- 3. Ejecuta los siguientes INSERTs con los UUIDs reales
--
-- EJEMPLO (reemplaza los UUIDs):
--
-- INSERT INTO public.user_roles (user_id, role, display_name) VALUES
--     ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'ADMIN', 'Tu Nombre'),
--     ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'ADMIN', 'Ingeniero/Gerente'),
--     ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'SECRETARIA', 'Nombre Secretaria'),
--     ('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'OPERARIO', 'Nombre Operario');
--
-- ============================================================================

-- ============================================================================
-- VERIFICACIÓN: Consulta para verificar el estado de las políticas
-- ============================================================================
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
