-- ============================================================================
-- SCRIPT 025: VISTA MATERIALIZADA DE STOCK EN TIEMPO REAL
-- Fecha: 2026-02-21
-- Objetivo: Reemplazar vw_stock_realtime (vista regular) con vista materializada
-- para eliminar el recálculo en cada request HTTP.
-- ============================================================================
-- IMPACTO: Esta vista es la consulta más lenta (~13% del tiempo total de BD)
-- Con la materialización, los SELECTs serán instantáneos (lectura de cache).
-- ============================================================================

BEGIN;

-- PASO 1: Crear la Vista Materializada (no reemplaza la vista regular aún)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mvw_stock_realtime AS
SELECT p.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    p.cod_proveedor,
    p.costo_mercado_unit,
    p.moneda_reposicion,
    p.id_marca,
    p.id_material,
    p.id_acabado,
    pl.id_sistema,
    pl.largo_estandar_mm,
    pl.peso_teorico_kg,
    pl.imagen_ref,
    m_sis.nombre_comercial AS sistema_nombre,
    m_sis.cod_corrales,
    m_sis.cod_eduholding,
    m_sis.cod_hpd,
    m_sis.cod_limatambo,
    m_sis.uso_principal AS sistema_uso,
    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado,
    COALESCE(sum(tm.cantidad), 0::numeric) AS stock_actual,
    COALESCE(sum(tm.costo_total_pen), 0::numeric) AS inversion_total,
    CASE
        WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric 
            THEN COALESCE(sum(tm.costo_total_pen), 0::numeric) / NULLIF(sum(tm.cantidad), 0::numeric)
        ELSE 0::numeric
    END AS costo_promedio,
    CASE
        WHEN COALESCE(sum(tm.cantidad), 0::numeric) < 0::numeric THEN 1
        WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN 2
        ELSE 3
    END AS orden_prioridad,
    max(tm.fecha_hora) AS ultima_actualizacion,
    COALESCE(p.stock_minimo, 0) as stock_minimo,
    COALESCE(p.punto_pedido, 0) as punto_pedido
FROM cat_productos_variantes p
    LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
    LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
    LEFT JOIN mst_series_equivalencias m_sis ON pl.id_sistema = m_sis.id_sistema
    LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia
    LEFT JOIN mst_marcas m_mar ON p.id_marca = m_mar.id_marca
    LEFT JOIN mst_materiales m_mat ON p.id_material = m_mat.id_material
    LEFT JOIN mst_acabados_colores m_acab ON p.id_acabado = m_acab.id_acabado
GROUP BY 
    p.id_sku, p.nombre_completo, p.unidad_medida, p.cod_proveedor, 
    p.costo_mercado_unit, p.moneda_reposicion, 
    p.id_marca, p.id_material, p.id_acabado,
    pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, 
    m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, 
    m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, 
    m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado,
    p.stock_minimo, p.punto_pedido;


-- PASO 2: Índice único requerido para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mvw_stock_realtime_id_sku 
ON public.mvw_stock_realtime(id_sku);

-- PASO 3: Índices de soporte para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_mvw_stock_orden 
ON public.mvw_stock_realtime(orden_prioridad, id_sku);

CREATE INDEX IF NOT EXISTS idx_mvw_stock_nombre 
ON public.mvw_stock_realtime(nombre_completo);


-- PASO 4: Permisos
GRANT SELECT ON public.mvw_stock_realtime TO authenticated;
GRANT SELECT ON public.mvw_stock_realtime TO anon;
GRANT SELECT ON public.mvw_stock_realtime TO service_role;


-- PASO 5: Función helper para refresh (llamada desde triggers o pg_cron)
CREATE OR REPLACE FUNCTION public.fn_refresh_stock_materializada()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mvw_stock_realtime;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- PASO 6: Trigger para auto-refresh al insertar/actualizar movimientos
CREATE OR REPLACE FUNCTION public.fn_trigger_refresh_stock()
RETURNS trigger AS $$
BEGIN
    -- Refresh asíncrono: solo marca que se necesita refresh
    -- En producción con pg_cron sería cada 1-5 minutos
    -- Para ahora, hacemos refresh directo (aceptable con pocos datos)
    PERFORM public.fn_refresh_stock_materializada();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger AFTER en trx_movimientos
DROP TRIGGER IF EXISTS trg_refresh_stock_after_movimiento ON public.trx_movimientos;
CREATE TRIGGER trg_refresh_stock_after_movimiento
    AFTER INSERT OR UPDATE OR DELETE ON public.trx_movimientos
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.fn_trigger_refresh_stock();

-- Trigger AFTER en cat_productos_variantes (para cambios de costo/nombre)
DROP TRIGGER IF EXISTS trg_refresh_stock_after_sku_change ON public.cat_productos_variantes;
CREATE TRIGGER trg_refresh_stock_after_sku_change
    AFTER INSERT OR UPDATE OR DELETE ON public.cat_productos_variantes
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.fn_trigger_refresh_stock();


-- PASO 7: Reemplazar la vista regular por la materializada
-- La vieja vista regular sigue existiendo para compatibilidad.
-- El frontend se actualizará para apuntar a mvw_stock_realtime.
-- Cuando se confirme que funciona, se puede eliminar la vieja vista:
-- DROP VIEW IF EXISTS public.vw_stock_realtime;

COMMIT;

-- ============================================================================
-- NOTA: Si usas pg_cron (recomendado para producción), agrega:
-- SELECT cron.schedule('refresh_stock', '*/5 * * * *', 
--     'SELECT public.fn_refresh_stock_materializada()');
-- Y ELIMINA el trigger trg_refresh_stock_after_movimiento para evitar
-- refreshes síncronos bloqueantes.
-- ============================================================================
