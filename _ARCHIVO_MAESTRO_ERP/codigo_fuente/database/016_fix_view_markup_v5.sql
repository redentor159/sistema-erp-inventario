-- 016_fix_view_markup_v5.sql
-- Fixes "Snapshot" behavior:
-- Instead of linking dynamically to config, we "freeze" the current config value into the table.
-- This ensures future config changes DO NOT affect existing quotes.

-- 1. SNAPSHOT: Update all NULL markups to the current Global Config Default
-- This "locks" the current price for existing quotes.
UPDATE trx_cotizaciones_cabecera 
SET markup_aplicado = (SELECT markup_cotizaciones_default FROM mst_config_general LIMIT 1)
WHERE markup_aplicado IS NULL;

-- 2. View Logic (Safety Net)
-- We keep the COALESCE logic in the view just in case a row is manually inserted without markup,
-- but the primary logic is now data-driven in the table.
CREATE OR REPLACE VIEW vw_cotizaciones_detalladas AS
SELECT 
    d.*,
    -- _Costo_Materiales
    COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0) as _costo_materiales,
    
    -- Precio_Unit_Oferta calc
    -- Uses stored markup_aplicado. If NULL, falls back to config (but we try to avoid NULLs now).
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + COALESCE(c.markup_aplicado, (SELECT markup_cotizaciones_default FROM mst_config_general LIMIT 1), 0.35))
    ) as _vc_precio_unit_oferta_calc,

    -- Subtotal Linea
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + COALESCE(c.markup_aplicado, (SELECT markup_cotizaciones_default FROM mst_config_general LIMIT 1), 0.35))
    ) * d.cantidad as _vc_subtotal_linea_calc

FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;

-- 3. Refresh Totals View (Standard)
CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
SELECT 
    c.*,
    COALESCE((
        SELECT SUM(_costo_materiales) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _vc_total_costo_materiales,

    COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _vc_subtotal_venta,

    CASE WHEN c.incluye_igv THEN 
        COALESCE((
            SELECT SUM(_vc_subtotal_linea_calc) 
            FROM vw_cotizaciones_detalladas 
            WHERE id_cotizacion = c.id_cotizacion
        ), 0) * (SELECT igv FROM mst_config_general LIMIT 1)
    ELSE 0 END as _vc_monto_igv,

    (COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) * (CASE WHEN c.incluye_igv THEN (1 + (SELECT igv FROM mst_config_general LIMIT 1)) ELSE 1 END)) 
    as _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c;
