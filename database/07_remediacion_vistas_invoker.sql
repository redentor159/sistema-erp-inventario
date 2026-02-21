-- =========================================================================================
-- SCRIPT DE REMEDIACIÓN: VISTAS SECURITY DEFINER A SECURITY INVOKER
-- =========================================================================================
-- Motivo: Supabase Lints (0010_security_definer_view) advierte que estas vistas 
-- ejecutan consultas saltándose las reglas de Row Level Security (RLS) porque 
-- actúan con los privilegios de su creador ("Definer") y no de quien la consulta ("Invoker").
-- 
-- Efecto de este script: Recrea o altera las vistas bajo el estándar de PostgreSQL 15+ 
-- instruyéndolas a que siempre respeten el RLS del usuario que la consulta, 
-- aplicando la directiva WITH (security_invoker = true).
-- =========================================================================================

-- 1. Vista: Ciclo de Ventas
ALTER VIEW public.vw_kpi_ciclo_ventas SET (security_invoker = true);

-- 2. Vista: Ticket Promedio
ALTER VIEW public.vw_kpi_ticket_promedio SET (security_invoker = true);

-- 3. Vista: Conversión
ALTER VIEW public.vw_kpi_conversion SET (security_invoker = true);

-- 4. Vista: Reporte de Desglose
ALTER VIEW public.vw_reporte_desglose SET (security_invoker = true);

-- 5. Vista: Cotizaciones Totales
ALTER VIEW public.vw_cotizaciones_totales SET (security_invoker = true);

-- 6. Vista: Stock Zombie
ALTER VIEW public.vw_kpi_stock_zombie SET (security_invoker = true);

-- 7. Vista: Dashboard Stock Realtime
ALTER VIEW public.vw_dashboard_stock_realtime SET (security_invoker = true);

-- 8. Vista: Valorización
ALTER VIEW public.vw_kpi_valorizacion SET (security_invoker = true);

-- 9. Vista: Margen Real
ALTER VIEW public.vw_kpi_margen_real SET (security_invoker = true);

-- 10. Vista: Análisis ABC
ALTER VIEW public.vw_kpi_abc_analisis SET (security_invoker = true);

-- 11. Vista: Top Productos
ALTER VIEW public.vw_kpi_top_productos SET (security_invoker = true);

-- 12. Vista: OTIF (On-Time In-Full)
ALTER VIEW public.vw_kpi_otif SET (security_invoker = true);

-- 13. Vista: Cotizaciones Detalladas
ALTER VIEW public.vw_cotizaciones_detalladas SET (security_invoker = true);

-- 14. Vista: Retazos Valorizados
ALTER VIEW public.vw_kpi_retazos_valorizados SET (security_invoker = true);

-- Fin del script. Si algunas vistas fallan al hacer ALTER (dependiendo de cómo se crearon),
-- el paso alternativo sería un CREATE OR REPLACE VIEW completo.
