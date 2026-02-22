-- VIEW LATEST DESPIECE RESULTS (FORMATO OPEN 2D2)
-- Muestra el despiece con columnas similares a tu referencia.

SELECT 
    m.tipo_componente AS "Tipo",
    COALESCE(m.sku_real, m.nombre_componente) AS "Elemento",
    m.cantidad_calculada AS "Cantidad",
    m.medida_corte_mm AS "Corte (mm)",
    m.detalle_acabado AS "Color",
    m.nombre_componente AS "Ubicación / Parte",
    m.angulo_corte AS "Corte (°)",
    m.costo_total_item AS "Costo (S/)"
    -- "Con IVA" y "Ganancia" se calculan en la vista vw_cotizaciones_detalladas, no aquí.
FROM trx_desglose_materiales m
JOIN trx_cotizaciones_detalle d ON m.id_linea_cot = d.id_linea_cot
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion
WHERE c.id_cotizacion = (
    SELECT id_cotizacion 
    FROM trx_cotizaciones_cabecera 
    ORDER BY fecha_emision DESC 
    LIMIT 1
)
ORDER BY m.tipo_componente, m.nombre_componente;
