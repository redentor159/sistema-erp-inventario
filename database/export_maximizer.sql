-- MAXIMIZE VIEWS FOR EXPORT
-- Adding ALL available columns from the schema tables to the reporting views.

-- 1. ENRICHED STOCK VIEW
-- Includes: Tech Specs (Templado, Espesor), Logistics (Reposicion, Lotes), Costing (Flete)
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
    -- Expanded Tech Data
    p.es_templado,
    p.espesor_mm,
    p.costo_flete_m2,
    -- Expanded Logistics Data
    p.tiempo_reposicion_dias,
    p.lote_econ_compra,
    p.demanda_promedio_diaria,
    -- Resolved Names
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
    -- Stock Metrics
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
    -- Stock Config
    COALESCE(p.stock_minimo, 0::numeric) AS stock_minimo,
    COALESCE(p.punto_pedido, 0::numeric) AS punto_pedido
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
    p.id_marca, p.id_material, p.id_acabado, p.stock_minimo, p.punto_pedido,
    p.es_templado, p.espesor_mm, p.costo_flete_m2, p.tiempo_reposicion_dias, p.lote_econ_compra, p.demanda_promedio_diaria, -- ADDED
    pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, 
    m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, 
    m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado;


-- 2. ENRICHED KARDEX VIEW
-- Includes: User, Warehouse, Adjustment Reason, Exchange Rate
CREATE OR REPLACE VIEW public.vw_kardex_reporte
WITH(security_invoker=true)
AS SELECT m.id_movimiento,
    m.fecha_hora,
    m.tipo_movimiento,
    m.cantidad,
    m.moneda_origen,
    m.costo_unit_doc,
    m.costo_total_pen,
    m.comentarios,
    m.referencia_doc,
    -- Expanded Trx Data
    m.id_almacen,
    m.tipo_cambio,
    m.usuario_reg,
    m.motivo_ajuste,
    -- Product Data
    p.id_sku,
    p.nombre_completo AS producto_nombre,
    p.unidad_medida,
    p.cod_proveedor,
    fam.nombre_familia,
    marc.nombre_marca,
    -- Entity Data
        CASE
            WHEN m.tipo_movimiento = 'COMPRA'::text THEN prov.razon_social
            WHEN m.tipo_movimiento = 'VENTA'::text THEN cli.nombre_completo
            ELSE NULL::text
        END AS entidad_nombre,
        CASE
            WHEN m.tipo_movimiento = 'COMPRA'::text THEN ec.nro_documento_fisico
            ELSE NULL::text
        END AS nro_documento
   FROM trx_movimientos m
     LEFT JOIN cat_productos_variantes p ON m.id_sku = p.id_sku
     LEFT JOIN cat_plantillas plant ON p.id_plantilla = plant.id_plantilla
     LEFT JOIN mst_familias fam ON plant.id_familia = fam.id_familia
     LEFT JOIN mst_marcas marc ON p.id_marca = marc.id_marca
     LEFT JOIN trx_entradas_cabecera ec ON m.referencia_doc = ec.id_entrada
     LEFT JOIN mst_proveedores prov ON ec.id_proveedor = prov.id_proveedor
     LEFT JOIN trx_salidas_cabecera sc ON m.referencia_doc = sc.id_salida
     LEFT JOIN mst_clientes cli ON sc.id_destinatario = cli.id_cliente;
