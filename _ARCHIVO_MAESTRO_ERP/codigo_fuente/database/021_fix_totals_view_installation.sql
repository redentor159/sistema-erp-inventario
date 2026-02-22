-- 021_fix_totals_view_installation.sql
-- Fix vw_cotizaciones_totales to include costo_fijo_instalacion in totals

DROP VIEW IF EXISTS vw_cotizaciones_totales;

-- Refresh Totals View
CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
SELECT 
    c.*,
    COALESCE((
        SELECT SUM(_costo_materiales) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _vc_total_costo_materiales,

    -- Subtotal Venta (Items + Instalación)
    (COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) + COALESCE(c.costo_fijo_instalacion, 0)) as _vc_subtotal_venta,

    CASE WHEN c.incluye_igv THEN 
        (COALESCE((
            SELECT SUM(_vc_subtotal_linea_calc) 
            FROM vw_cotizaciones_detalladas 
            WHERE id_cotizacion = c.id_cotizacion
        ), 0) + COALESCE(c.costo_fijo_instalacion, 0)) * (SELECT igv FROM mst_config_general LIMIT 1)
    ELSE 0 END as _vc_monto_igv,

    ((COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) + COALESCE(c.costo_fijo_instalacion, 0)) * (CASE WHEN c.incluye_igv THEN (1 + (SELECT igv FROM mst_config_general LIMIT 1)) ELSE 1 END)) 
    as _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c;
