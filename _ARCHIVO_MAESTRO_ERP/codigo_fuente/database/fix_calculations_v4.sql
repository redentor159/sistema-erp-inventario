-- FIX CALCULOS V4: CORREGIR DOBLE CONTABILIZACION Y TOTALES
-- Autor: Antigravity
-- Fecha: 2026-02-12
-- Descripcion: 
-- 1. Corrige vw_cotizaciones_detalladas que estaba multiplicando por 'cantidad' dos veces.
-- 2. Redefine vw_cotizaciones_totales para asegurar que sume correctamente los materiales y servicios.

-- 1. CORREGIR VISTA DE DETALLE
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
    d.subtotal_linea, -- Este campo a veces se usa para override manual, pero priorizamos el calculo
    
    -- COSTO MATERIALES (Suma directa del despiece, que YA INCLUYE la cantidad de items de la linea)
    COALESCE((
        SELECT sum(dm.costo_total_item) 
        FROM trx_desglose_materiales dm
        WHERE dm.id_linea_cot = d.id_linea_cot
    ), 0::numeric) AS _costo_materiales,

    -- PRECIO TOTAL LINEA (Subtotal)
    -- Formula: CostoTotalLinea * (1 + Markup)
    COALESCE((
        SELECT sum(dm.costo_total_item) 
        FROM trx_desglose_materiales dm
        WHERE dm.id_linea_cot = d.id_linea_cot
    ), 0::numeric) * (1::numeric + COALESCE(c.markup_aplicado, 0)) AS _vc_subtotal_linea_calc,

    -- PRECIO UNITARIO (Unitario con Markup)
    -- Formula: PrecioTotalLinea / Cantidad
    CASE WHEN d.cantidad > 0 THEN
        (COALESCE((
            SELECT sum(dm.costo_total_item) 
            FROM trx_desglose_materiales dm
            WHERE dm.id_linea_cot = d.id_linea_cot
        ), 0::numeric) * (1::numeric + COALESCE(c.markup_aplicado, 0))) / d.cantidad
    ELSE 0 END AS _vc_precio_unit_oferta_calc

FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;

-- 2. ASEGURAR VISTA DE TOTALES (Puede que no exista o este desactualizada)
DROP VIEW IF EXISTS public.vw_cotizaciones_totales;

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
    -- Suma de costos directos de materiales (sin markup)
    COALESCE(SUM(d._costo_materiales), 0) AS costo_materiales_total,
    
    -- Suma de precios de venta de items (con markup)
    COALESCE(SUM(d._vc_subtotal_linea_calc), 0) AS _vc_suma_items_venta,

    -- Precio Final Cliente (Suma Items + Costo Fijo Instalacion)
    -- Asumimos que el Costo Fijo Instalacion es un PRECIO (ya incluye ganancia o es passthrough)
    COALESCE(SUM(d._vc_subtotal_linea_calc), 0) + COALESCE(c.costo_fijo_instalacion, 0) AS _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c
LEFT JOIN vw_cotizaciones_detalladas d ON c.id_cotizacion = d.id_cotizacion
GROUP BY c.id_cotizacion;
