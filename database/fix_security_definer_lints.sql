-- =================================================================================================
-- SECURITY FIX: VIEW PERMISSIONS (Linter Cleanup)
-- =================================================================================================
-- Author: Windsurf Agent
-- Date: 2026-02-10
-- Purpose: Fix "Security Definer View" errors reported by Supabase Linter.
-- These views should run with the privileges of the invoker (security_invoker = true) 
-- to respect RLS policies properly.

-- 1. vw_cotizaciones_totales
ALTER VIEW public.vw_cotizaciones_totales SET (security_invoker = true);

-- 2. vw_audit_plantillas_faltantes
ALTER VIEW public.vw_audit_plantillas_faltantes SET (security_invoker = true);

-- 3. vw_kpi_valorizacion (re-apply to be safe)
ALTER VIEW public.vw_kpi_valorizacion SET (security_invoker = true);

-- 4. vw_audit_skus_recetas
ALTER VIEW public.vw_audit_skus_recetas SET (security_invoker = true);

-- 5. vw_cotizaciones_detalladas
ALTER VIEW public.vw_cotizaciones_detalladas SET (security_invoker = true);

-- 6. vw_audit_skus_faltantes
ALTER VIEW public.vw_audit_skus_faltantes SET (security_invoker = true);

-- 7. vw_audit_resumen_sistema
ALTER VIEW public.vw_audit_resumen_sistema SET (security_invoker = true);

-- Verification:
-- Linter should show 0 errors for these views.
