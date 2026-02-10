-- SECURITY FIX: VIEW PERMISSIONS
-- Author: Windsurf Agent
-- Date: 2026-02-05

-- The error "Security Definer View" means these views are running with the privileges of the creator (Owner),
-- bypassing Row Level Security (RLS) for the user querying them.
-- To fix this in Supabase/Postgres 15+, we set 'security_invoker = true'.
-- This forces the view to verify permissions for the actual user running the query.

-- 1. vw_kardex_reporte
ALTER VIEW public.vw_kardex_reporte SET (security_invoker = true);

-- 2. vw_kpi_abc_analisis
ALTER VIEW public.vw_kpi_abc_analisis SET (security_invoker = true);

-- 3. vw_dashboard_stock_realtime
ALTER VIEW public.vw_dashboard_stock_realtime SET (security_invoker = true);

-- 4. vw_kpi_valorizacion
ALTER VIEW public.vw_kpi_valorizacion SET (security_invoker = true);

-- 5. vw_kpi_otif
ALTER VIEW public.vw_kpi_otif SET (security_invoker = true);

-- Verification:
-- After running this, the "security_definer_view" errors in Supabase Linter should disappear.
