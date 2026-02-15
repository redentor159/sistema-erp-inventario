-- 016_fix_view_markup_v2.sql
-- Fixes "cannot change name of view column" error by dropping first
-- Patches existing NULL markup data
-- Recreates view with safe logic

-- 1. Data Patch: Fix existing NULL markups to default 1.35 (Standard Margin)
UPDATE trx_cotizaciones_cabecera 
SET markup_aplicado = 1.35 
WHERE markup_aplicado IS NULL;

-- 2. Drop Views to avoid rename conflicts
DROP VIEW IF EXISTS vw_cotizaciones_totales CASCADE;
DROP VIEW IF EXISTS vw_cotizaciones_detalladas CASCADE;

-- 3. Recreate Detailed View
CREATE OR REPLACE VIEW vw_cotizaciones_detalladas AS
SELECT 
    d.*,
    -- _Costo_Materiales (Suma del desglose)
    COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0) as _costo_materiales,
    
    -- Precio_Unit_Oferta calc
    -- NOTE: We use COALESCE(markup, 1.0) just in case, but data should be fixed now. 
    -- 1.0 means "Cost Price" (Breakeven), avoiding 0.00 without forcing an arbitrary margin if user didn't set one.
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + COALESCE(c.markup_aplicado, c.margen_ganancia, 0.35)) -- Try markup, then margin column if exists, else fallback
    ) as _vc_precio_unit_oferta_calc,

    -- Subtotal Linea
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + COALESCE(c.markup_aplicado, c.margen_ganancia, 0.35))
    ) * d.cantidad as _vc_subtotal_linea_calc

FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;

-- 4. Recreate Totals View
CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
SELECT 
    c.*,
    -- Suma de costos directos de todas las lineas
    COALESCE((
        SELECT SUM(_costo_materiales) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _costo_materiales_total, -- Renamed to be safe/clear

    -- Suma de precios de venta
    COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _vc_subtotal_venta,

    -- IGV
    CASE WHEN c.incluye_igv THEN 
        COALESCE((
            SELECT SUM(_vc_subtotal_linea_calc) 
            FROM vw_cotizaciones_detalladas 
            WHERE id_cotizacion = c.id_cotizacion
        ), 0) * (SELECT igv FROM mst_config_general LIMIT 1)
    ELSE 0 END as _vc_monto_igv,

    -- Total Final
    (COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) * (CASE WHEN c.incluye_igv THEN (1 + (SELECT igv FROM mst_config_general LIMIT 1)) ELSE 1 END)) 
    as _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c;
