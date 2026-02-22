-- Improve vw_stock_realtime to include Stock Configs (Min/Reorder)
-- This ensures the Inventory Export has BOTH Rich Data (Brands/Families) AND Config Data (Min/Point)

CREATE OR REPLACE VIEW public.vw_stock_realtime
WITH(security_invoker=on)
AS SELECT p.id_sku,
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
    -- EXISTING COLUMNS (MUST BE KEPT IN EXACT ORDER FOR 'CREATE OR REPLACE')
    COALESCE(sum(tm.cantidad), 0::numeric) AS stock_actual,
    COALESCE(sum(tm.costo_total_pen), 0::numeric) AS inversion_total,
    CASE
        WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN COALESCE(sum(tm.costo_total_pen), 0::numeric) / NULLIF(sum(tm.cantidad), 0::numeric)
        ELSE 0::numeric
    END AS costo_promedio,
    CASE
        WHEN COALESCE(sum(tm.cantidad), 0::numeric) < 0::numeric THEN 1
        WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN 2
        ELSE 3
    END AS orden_prioridad,
    max(tm.fecha_hora) AS ultima_actualizacion,
    -- NEW COLUMNS APPENDED AT THE END
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
    p.id_sku, p.nombre_completo, p.unidad_medida, p.cod_proveedor, p.costo_mercado_unit, p.moneda_reposicion, 
    p.id_marca, p.id_material, p.id_acabado,
    pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, 
    m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, 
    m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado,
    -- NEW GROUP BY COLUMNS
    p.stock_minimo, p.punto_pedido;
