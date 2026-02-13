-- FIX DEPENDENCIAS V5: RECREAR VISTAS CON ORDEN CORRECTO
-- Autor: Antigravity
-- Fecha: 2026-02-12

-- 1. DROP CASCADE para limpiar todo rastro de definiciones antiguas incompatibles
-- ESTO BORRARA vw_cotizaciones_totales y vw_reporte_desglose si dependen de ella.
DROP VIEW IF EXISTS public.vw_cotizaciones_detalladas CASCADE;
DROP VIEW IF EXISTS public.vw_cotizaciones_totales CASCADE;
DROP VIEW IF EXISTS public.vw_reporte_desglose CASCADE;

-- 2. RECREAR VISTA DE DETALLE (Corregida: Sin doble multiplicacion)
CREATE OR REPLACE VIEW public.vw_cotizaciones_detalladas
WITH(security_invoker=true)
AS 
SELECT 
    d.id_linea_cot,
    d.id_cotizacion,
    d.id_modelo,
    d.color_perfiles,
    d.cantidad,
    d.ancho_mm,
    d.alto_mm,
    d.etiqueta_item,
    d.ubicacion,
    d.tipo_cierre,
    d.tipo_vidrio,
    d.grupo_opcion,
    d.costo_base_ref,
    d.subtotal_linea,
    
    -- COSTO MATERIALES (Suma directa)
    COALESCE((
        SELECT sum(dm.costo_total_item) 
        FROM trx_desglose_materiales dm
        WHERE dm.id_linea_cot = d.id_linea_cot
    ), 0::numeric) AS _costo_materiales,

    -- PRECIO TOTAL LINEA (Subtotal) = CostoTotal * (1+Markup)
    COALESCE((
        SELECT sum(dm.costo_total_item) 
        FROM trx_desglose_materiales dm
        WHERE dm.id_linea_cot = d.id_linea_cot
    ), 0::numeric) * (1::numeric + COALESCE(c.markup_aplicado, 0)) AS _vc_subtotal_linea_calc,

    -- PRECIO UNITARIO = Total / Cantidad
    CASE WHEN d.cantidad > 0 THEN
        (COALESCE((
            SELECT sum(dm.costo_total_item) 
            FROM trx_desglose_materiales dm
            WHERE dm.id_linea_cot = d.id_linea_cot
        ), 0::numeric) * (1::numeric + COALESCE(c.markup_aplicado, 0))) / d.cantidad
    ELSE 0 END AS _vc_precio_unit_oferta_calc

FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;

-- 3. RECREAR VISTA DE TOTALES (Corregida)
CREATE OR REPLACE VIEW public.vw_cotizaciones_totales
WITH(security_invoker=true)
AS 
SELECT 
    c.id_cotizacion,
    c.fecha_emision,
    c.estado,
    c.id_cliente,
    c.nombre_proyecto,
    c.moneda,
    c.id_marca,
    c.markup_aplicado,
    c.costo_mano_obra_m2,
    c.costo_fijo_instalacion,
    COALESCE(SUM(d._costo_materiales), 0) AS costo_materiales_total,
    COALESCE(SUM(d._vc_subtotal_linea_calc), 0) AS _vc_suma_items_venta,
    COALESCE(SUM(d._vc_subtotal_linea_calc), 0) + COALESCE(c.costo_fijo_instalacion, 0) AS _vc_precio_final_cliente
FROM trx_cotizaciones_cabecera c
LEFT JOIN vw_cotizaciones_detalladas d ON c.id_cotizacion = d.id_cotizacion
GROUP BY c.id_cotizacion;

-- 4. RECREAR VISTA DE REPORTE DESGLOSE (Recuperada)
CREATE OR REPLACE VIEW public.vw_reporte_desglose
WITH(security_invoker=true)
AS 
SELECT 
    c.id_cotizacion,
    c.fecha_emision,
    c.estado,
    c.nombre_proyecto,
    cli.nombre_completo AS cliente,
    d.etiqueta_item,
    d.id_modelo,
    d.ubicacion,
    d.cantidad AS cantidad_items,
    dm.tipo_componente,
    dm.nombre_componente,
    dm.sku_real,
    cp.nombre_completo AS descripcion_sku,
    dm.detalle_acabado,
    dm.medida_corte_mm,
    dm.angulo_corte,
    dm.cantidad_calculada AS cantidad_insumo_total,
    dm.costo_total_item,
    COALESCE(cp.unidad_medida, 'UND') as unidad_medida,
    COALESCE(cp.costo_mercado_unit, 0) as costo_mercado_unit
FROM trx_cotizaciones_cabecera c
JOIN trx_cotizaciones_detalle d ON c.id_cotizacion = d.id_cotizacion
JOIN trx_desglose_materiales dm ON d.id_linea_cot = dm.id_linea_cot
LEFT JOIN mst_clientes cli ON c.id_cliente = cli.id_cliente
LEFT JOIN cat_productos_variantes cp ON dm.sku_real = cp.id_sku;
