-- Optimización de Base de Datos para Catálogo y Stock
-- 1. Asegurar Índices para Velocidad (Critical for 'SLOW' Salidas)
CREATE INDEX IF NOT EXISTS idx_trx_movimientos_sku ON trx_movimientos(id_sku);
CREATE INDEX IF NOT EXISTS idx_trx_movimientos_fecha ON trx_movimientos(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_cat_productos_search ON cat_productos_variantes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_cat_productos_plantilla ON cat_productos_variantes(id_plantilla);

-- 2. Asegurar que la Vista existe y es correcta (Fix Empty Catalog)
-- DROP first because 'OR REPLACE' fails if column order changes
DROP VIEW IF EXISTS vw_stock_realtime;

CREATE OR REPLACE VIEW vw_stock_realtime WITH (security_invoker = on) AS
SELECT 
    p.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    p.cod_proveedor,
    p.costo_mercado_unit,
    p.moneda_reposicion,
    p.id_marca,
    p.id_material,
    p.id_acabado,
    
    -- Master Data Joins via Plantilla
    pl.id_sistema, -- NEW
    pl.largo_estandar_mm, -- NEW
    pl.peso_teorico_kg, -- NEW
    pl.imagen_ref, -- NEW

    -- System Equivalences via Plantilla -> Sistema
    m_sis.nombre_comercial as sistema_nombre,
    m_sis.cod_corrales,
    m_sis.cod_eduholding,
    m_sis.cod_hpd,
    m_sis.cod_limatambo,
    m_sis.uso_principal as sistema_uso,

    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado,
    
    -- STOCK (Suma de todos los movimientos)
    COALESCE(SUM(tm.cantidad), 0) as stock_actual,
    
    -- INVERSION (Suma de costo total PEN)
    COALESCE(SUM(tm.costo_total_pen), 0) as inversion_total,
    
    -- PMP (Precio Medio Ponderado)
    CASE 
        WHEN COALESCE(SUM(tm.cantidad), 0) > 0 THEN 
            COALESCE(SUM(tm.costo_total_pen), 0) / NULLIF(SUM(tm.cantidad), 0)
        ELSE 0 
    END as costo_promedio,

    -- ORDEN DE PRIORIDAD (1: Quiebre, 2: Stock, 3: Cero)
    CASE 
        WHEN COALESCE(SUM(tm.cantidad), 0) < 0 THEN 1
        WHEN COALESCE(SUM(tm.cantidad), 0) > 0 THEN 2
        ELSE 3
    END as orden_prioridad,

    MAX(tm.fecha_hora) as ultima_actualizacion

FROM cat_productos_variantes p
LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
LEFT JOIN mst_series_equivalencias m_sis ON pl.id_sistema = m_sis.id_sistema -- Join Sistema
LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia -- Familia viene de la Plantilla
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
    p.id_marca,
    p.id_material,
    p.id_acabado,
    pl.id_familia,
    pl.id_sistema,
    pl.largo_estandar_mm,
    pl.peso_teorico_kg,
    pl.imagen_ref,
    m_sis.nombre_comercial,
    m_sis.cod_corrales,
    m_sis.cod_eduholding,
    m_sis.cod_hpd,
    m_sis.cod_limatambo,
    m_sis.uso_principal,
    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado;
