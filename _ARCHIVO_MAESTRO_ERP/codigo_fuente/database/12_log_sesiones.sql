-- ============================================================================
-- LOG DE INICIO DE SESIÓN
-- Script: 12_log_sesiones.sql
-- Fecha: 2026-02-21
-- Registra automáticamente quién inició sesión, desde qué dispositivo y cuándo.
-- ============================================================================

-- 1. Crear tabla de registro de sesiones
CREATE TABLE IF NOT EXISTS public.login_logs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email       TEXT,
    logged_in_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent  TEXT,  -- Navegador / dispositivo usado
    ip_address  TEXT,  -- IP (registrada por el cliente, aproximada)
    role        TEXT   -- Rol del usuario al momento del login
);

-- 2. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_logged_in ON public.login_logs(logged_in_at DESC);

-- 3. RLS: Solo ADMIN puede ver todos los registros
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "login_logs_admin_only" ON public.login_logs
    FOR ALL TO authenticated
    USING ((SELECT public.get_user_role()) = 'ADMIN');

-- 4. Los usuarios pueden insertar sus propios registros (para que el cliente pueda loguear)
CREATE POLICY "login_logs_insert_own" ON public.login_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- CONSULTAS ÚTILES PARA ADMINISTRADORES
-- ============================================================================

-- Ver los últimos 50 ingresos al sistema:
-- SELECT email, role, logged_in_at, user_agent
-- FROM public.login_logs
-- ORDER BY logged_in_at DESC
-- LIMIT 50;

-- Ver ingresos agrupados por usuario en el último mes:
-- SELECT email, role, COUNT(*) AS total_ingresos, MAX(logged_in_at) AS ultimo_ingreso
-- FROM public.login_logs
-- WHERE logged_in_at > NOW() - INTERVAL '30 days'
-- GROUP BY email, role
-- ORDER BY total_ingresos DESC;
