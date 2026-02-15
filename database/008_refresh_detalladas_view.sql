-- 008_refresh_detalladas_view.sql
-- Refresh the view to include columns added to existing tables (like opciones_seleccionadas)

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
