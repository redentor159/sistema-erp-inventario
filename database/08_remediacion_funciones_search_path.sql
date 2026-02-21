-- =========================================================================================
-- SCRIPT DE REMEDIACIÓN: PREVENCIÓN DE SEARCH PATH HIJACKING EN FUNCIONES
-- =========================================================================================
-- Motivo: Supabase Lints (0011_function_search_path_mutable) detecta funciones que 
-- no declaran explícitamente en qué esquema buscar sus tablas o funciones internas.
-- 
-- Efecto de este script: Altera las 12 funciones detectadas añadiendo un SET search_path = '' 
-- Esto obliga a que cualquier tabla consultada dentro de la función deba referenciarse
-- explícitamente (ej: public.tabla), protegiendo la base de datos de que un usuario ejecute
-- funciones maliciosas solapadas con el nombre de tablas base en esquemas temporales.
-- =========================================================================================

-- 1. Funciones Analíticas / KPIs
ALTER FUNCTION public.get_abc_analysis_v2() SET search_path = '';
ALTER FUNCTION public.get_abc_inventory_valuation() SET search_path = '';

-- 2. Funciones de Operatividad y Triggers (Kardex, Kanban, y Precios)
ALTER FUNCTION public.fn_calcular_sku_real() SET search_path = '';
ALTER FUNCTION public.fn_trigger_salida_to_kardex() SET search_path = '';
ALTER FUNCTION public.fn_trigger_entrada_to_kardex() SET search_path = '';
ALTER FUNCTION public.fn_archive_kanban_order(text) SET search_path = '';
ALTER FUNCTION public.update_costos_mercado_bulk(jsonb) SET search_path = '';
ALTER FUNCTION public.rename_sku(text, text) SET search_path = '';

-- 3. Funciones Complejas de Cotización e Ingeniería
ALTER FUNCTION public.fn_clonar_cotizacion(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.fn_clonar_item_cotizacion(uuid, uuid, uuid) SET search_path = '';
ALTER FUNCTION public.fn_evaluar_formula(text, record) SET search_path = '';
ALTER FUNCTION public.fn_generar_despiece_ingenieria(uuid) SET search_path = '';

-- Fin del script.
