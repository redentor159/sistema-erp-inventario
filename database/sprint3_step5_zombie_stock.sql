-- Sprint 3: Dashboard & Delivery Logic (STEP 5: ZOMBIE STOCK)
-- Description: Identifies stagnant inventory (Stock > 0 but no accumulation of exits in 90 days).

CREATE OR REPLACE VIEW vw_kpi_stock_zombie AS
WITH movimientos_recientes AS (
    -- Get SKUs that HAVE moved in the last 90 days
    SELECT DISTINCT id_sku
    FROM trx_movimientos
    WHERE tipo_movimiento IN ('VENTA', 'SALIDA', 'PRODUCCION')
    AND fecha_hora >= (NOW() - INTERVAL '90 days')
)
SELECT 
    s.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    s.stock_actual,
    s.costo_pmp as costo_unitario,
    (s.stock_actual * s.costo_pmp) as valor_estancado,
    MAX(m.fecha_hora) as ultima_salida_registrada
FROM vw_dashboard_stock_realtime s
JOIN cat_productos_variantes p ON s.id_sku = p.id_sku
LEFT JOIN trx_movimientos m ON s.id_sku = m.id_sku AND m.tipo_movimiento IN ('VENTA', 'SALIDA', 'PRODUCCION')
WHERE s.stock_actual > 0
AND s.id_sku NOT IN (SELECT id_sku FROM movimientos_recientes)
GROUP BY s.id_sku, p.nombre_completo, p.unidad_medida, s.stock_actual, s.costo_pmp
ORDER BY valor_estancado DESC;
