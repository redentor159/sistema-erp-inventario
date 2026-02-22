-- FIX: VISTA DE REPORTE DESGLOSE PARA GLOBAL VS UNITARIO (015)
-- Autor: Antigravity
-- Fecha: 2026-02-15

DROP VIEW IF EXISTS vw_reporte_desglose;

CREATE OR REPLACE VIEW vw_reporte_desglose AS
SELECT 
    -- Datos Cabecera
    c.id_cotizacion,
    c.fecha_emision,
    c.estado,
    c.nombre_proyecto,
    cli.nombre_completo as cliente,
    
    -- Datos Item (Linea)
    d.etiqueta_item,
    d.id_modelo,
    d.ubicacion,
    COALESCE(d.cantidad, 1) as cantidad_item, -- Cantidad de ventanas
    
    -- Datos Material (Desglose Unitario)
    m.tipo_componente,
    m.nombre_componente,
    m.sku_real,
    p.nombre_completo as descripcion_sku,
    m.detalle_acabado,
    m.medida_corte_mm,
    m.angulo_corte,
    
    m.cantidad_calculada as cantidad_unitaria, -- Cantidad de material POR UNIDAD de item (ej. 2 perfiles)
    m.costo_total_item as costo_unitario,      -- Costo de material POR UNIDAD de item
    
    p.unidad_medida, -- Corregido: viene del catalogo
    
    -- Referencia extra
    p.costo_mercado_unit
    
FROM trx_desglose_materiales m
JOIN trx_cotizaciones_detalle d ON m.id_linea_cot = d.id_linea_cot
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion
LEFT JOIN mst_clientes cli ON c.id_cliente = cli.id_cliente
LEFT JOIN cat_productos_variantes p ON m.sku_real = p.id_sku;
