
-- =================================================================================================
-- VISTA DE STOCK AVANZADA V3 (CON ORDENAMIENTO Y PRECIOS)
-- =================================================================================================

CREATE OR REPLACE VIEW vw_stock_realtime WITH (security_invoker = on) AS
SELECT 
    p.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    p.cod_proveedor,
    p.costo_mercado_unit,
    p.moneda_reposicion,
    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado,
    
    -- STOCK
    COALESCE(SUM(tm.cantidad), 0) as stock_actual,
    
    -- INVERSION & PMP
    COALESCE(SUM(tm.costo_total_pen), 0) as inversion_total,
    CASE 
        WHEN COALESCE(SUM(tm.cantidad), 0) > 0 THEN 
            COALESCE(SUM(tm.costo_total_pen), 0) / NULLIF(SUM(tm.cantidad), 1)
        ELSE 0 
    END as costo_promedio,

    -- ORDEN DE PRIORIDAD (AppSheet Logic)
    -- 1: Stock Negativo (Quiebre/Deuda)
    -- 2: Stock Positivo (Activo)
    -- 3: Cero (Sin Stock)
    CASE 
        WHEN COALESCE(SUM(tm.cantidad), 0) < 0 THEN 1
        WHEN COALESCE(SUM(tm.cantidad), 0) > 0 THEN 2
        ELSE 3
    END as orden_prioridad,

    MAX(tm.fecha_hora) as ultima_actualizacion

FROM cat_productos_variantes p
LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia
LEFT JOIN mst_marcas m_mar ON p.id_marca = m_mar.id_marca
LEFT JOIN mst_materiales m_mat ON p.id_material = m_mat.id_material
LEFT JOIN mst_acabados_colores m_acab ON p.id_acabado = m_acab.id_acabado
GROUP BY 
    p.id_sku, 
    p.nombre_completo, 
    p.unidad_medida, 
    p.cod_proveedor,
    p.costo_mercado_unit,
    p.moneda_reposicion,
    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado;

-- Permisos
GRANT SELECT ON vw_stock_realtime TO authenticated;
GRANT SELECT ON vw_stock_realtime TO service_role;
