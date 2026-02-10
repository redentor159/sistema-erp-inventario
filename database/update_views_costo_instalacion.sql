-- =================================================================================================
-- ACTUALIZACIÓN DE VISTAS PARA INCLUIR COSTO FIJO DE INSTALACIÓN
-- Fecha: 2026-02-07
-- =================================================================================================

-- Vista de Totales actualizada
DROP VIEW IF EXISTS vw_cotizaciones_totales CASCADE;

CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
SELECT 
    c.*,
    -- Suma de costos directos de todas las lineas
    COALESCE((
        SELECT SUM(COALESCE((
            SELECT SUM(costo_total_item) 
            FROM trx_desglose_materiales 
            WHERE id_linea_cot = d.id_linea_cot
        ), 0)) 
        FROM trx_cotizaciones_detalle d
        WHERE d.id_cotizacion = c.id_cotizacion
    ), 0) as _vc_total_costo_materiales,

    -- Suma de precios de venta (Subtotal antes de IGV + costo fijo instalación)
    COALESCE((
        SELECT SUM(
            COALESCE((
                SELECT SUM(costo_total_item) 
                FROM trx_desglose_materiales 
                WHERE id_linea_cot = d.id_linea_cot
            ), 0) * (1 + c.markup_aplicado) * d.cantidad
        )
        FROM trx_cotizaciones_detalle d
        WHERE d.id_cotizacion = c.id_cotizacion
    ), 0) + COALESCE(c.costo_fijo_instalacion, 0) as _vc_subtotal_venta,

    -- IGV (aplicado sobre subtotal + costo de instalación)
    CASE WHEN c.incluye_igv THEN 
        (COALESCE((
            SELECT SUM(
                COALESCE((
                    SELECT SUM(costo_total_item) 
                    FROM trx_desglose_materiales 
                    WHERE id_linea_cot = d.id_linea_cot
                ), 0) * (1 + c.markup_aplicado) * d.cantidad
            )
            FROM trx_cotizaciones_detalle d
            WHERE d.id_cotizacion = c.id_cotizacion
        ), 0) + COALESCE(c.costo_fijo_instalacion, 0)) * (SELECT COALESCE(igv, 0.18) FROM mst_config_general LIMIT 1)
    ELSE 0 END as _vc_monto_igv,

    -- Total Final con IGV
    (
        COALESCE((
            SELECT SUM(
                COALESCE((
                    SELECT SUM(costo_total_item) 
                    FROM trx_desglose_materiales 
                    WHERE id_linea_cot = d.id_linea_cot
                ), 0) * (1 + c.markup_aplicado) * d.cantidad
            )
            FROM trx_cotizaciones_detalle d
            WHERE d.id_cotizacion = c.id_cotizacion
        ), 0) + COALESCE(c.costo_fijo_instalacion, 0)
    ) 
    * (CASE WHEN c.incluye_igv THEN (1 + (SELECT COALESCE(igv, 0.18) FROM mst_config_general LIMIT 1)) ELSE 1 END)
    as _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c;

-- Vista Detallada (sin cambios, pero recreada por dependencia)
DROP VIEW IF EXISTS vw_cotizaciones_detalladas CASCADE;

CREATE OR REPLACE VIEW vw_cotizaciones_detalladas AS
SELECT 
    d.*,
    -- _Costo_Materiales (Suma del desglose)
    COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0) as _costo_materiales,
    
    -- Precio_Unit_Oferta con markup
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + c.markup_aplicado)
    ) as _vc_precio_unit_oferta_calc,

    -- Subtotal Linea
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + c.markup_aplicado)
    ) * d.cantidad as _vc_subtotal_linea_calc

FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;
