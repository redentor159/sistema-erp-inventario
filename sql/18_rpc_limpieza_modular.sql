-- Script de Limpieza Modular (RPC)
-- Autor: AI Agent
-- Fecha Creación: 2026-03-06

-- 1. Limpieza de transacciones de ERP
CREATE OR REPLACE FUNCTION public.fn_reset_erp_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validar que el usuario logueado en Supabase sea ADMIN
    IF public.get_user_role() != 'ADMIN' THEN
        RAISE EXCEPTION 'Acceso denegado. Acción irreversible restringida.';
    END IF;

    -- Truncar tablas maestras transaccionales.
    -- CASCADE asegurará de vaciar `trx_cotizaciones_detalle`, `trx_desglose_materiales`, 
    -- `trx_entradas_detalle`, `trx_salidas_detalle`.
    -- Las tablas maestras (mst_*, cat_*) quedarán INTACTAS.
    TRUNCATE TABLE 
        public.trx_cotizaciones_cabecera, 
        public.trx_entradas_cabecera, 
        public.trx_salidas_cabecera, 
        public.trx_movimientos, 
        public.dat_retazos_disponibles 
    CASCADE;
END;
$$;

-- 2. Limpieza de datos de tablero Kanban
CREATE OR REPLACE FUNCTION public.fn_reset_kanban_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validar que el usuario logueado en Supabase sea ADMIN
    IF public.get_user_role() != 'ADMIN' THEN
        RAISE EXCEPTION 'Acceso denegado. Acción irreversible restringida.';
    END IF;

    -- Truncar únicamente las tablas del Kanban
    TRUNCATE TABLE 
        public.trx_kanban_orders, 
        public.trx_kanban_history 
    CASCADE;
END;
$$;
