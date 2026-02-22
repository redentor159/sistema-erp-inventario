-- 016_fix_view_markup_v4.sql
-- Fixes "Markup" issue: Uses Config value if available
-- Removes hardcoded 0.35 fallback
-- Syncs existing quotes by clearing markup_aplicado to use default

-- 1. CLEANUP existing '0.35' patch which came from script v2/v3
-- By setting to NULL, we force the view to look up the Global Config Default
UPDATE trx_cotizaciones_cabecera 
SET markup_aplicado = NULL 
WHERE markup_aplicado = 0.35;

-- 2. Drop Views to avoid rename conflicts (Standard Safety)
DROP VIEW IF EXISTS vw_cotizaciones_totales CASCADE;
DROP VIEW IF EXISTS vw_cotizaciones_detalladas CASCADE;

-- 3. Recreate Detailed View
CREATE OR REPLACE VIEW vw_cotizaciones_detalladas AS
SELECT 
    d.*,
    -- _Costo_Materiales
    COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0) as _costo_materiales,
    
    -- Precio_Unit_Oferta calc
    -- Formula: Costo * (1 + MARKUP)
    -- MARKUP Logic: 
    -- 1. Use Quote-Specific Markup (c.markup_aplicado) if set.
    -- 2. Fallback to Global Config (cfg.markup_cotizaciones_default).
    -- 3. Absolute Last Resort: 0.35 (Only if config is missing too).
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

-- 4. Recreate Totals View (Standard)
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
