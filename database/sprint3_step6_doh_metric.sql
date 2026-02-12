-- Sprint 3: Dashboard & Delivery Logic (STEP 6: DOH METRIC)
-- Description: Adds 'dias_inventario' (Days on Hand) based on 90-day usage history.

-- 1. DROP dependent views first
DROP VIEW IF EXISTS vw_kpi_valorizacion;
DROP VIEW IF EXISTS vw_kpi_stock_zombie;
DROP VIEW IF EXISTS vw_dashboard_stock_realtime; -- The core view to update

-- 2. RECREATE CORE VIEW with DOH Logic
CREATE OR REPLACE VIEW vw_dashboard_stock_realtime AS
WITH stock_calc AS (
    SELECT 
        id_sku,
        COALESCE(SUM(cantidad), 0) as stock_actual
    FROM trx_movimientos
    GROUP BY id_sku
),
consumo_90d AS (
    SELECT 
        id_sku,
        ABS(SUM(cantidad)) as consumo_total,
        ABS(SUM(cantidad)) / 90.0 as consumo_diario_promedio
    FROM trx_movimientos
    WHERE tipo_movimiento IN ('VENTA', 'PRODUCCION', 'SALIDA')
    AND fecha_hora >= (NOW() - INTERVAL '90 days')
    GROUP BY id_sku
),
costos_ref AS (
    -- Get cost from Catalog as fallback (or calculated PMP if we had it stored)
    SELECT id_sku, costo_mercado_unit FROM cat_productos_variantes
)
SELECT 
    sc.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    COALESCE(p.stock_minimo, 0) as stock_minimo,
    COALESCE(p.punto_pedido, 0) as punto_pedido,
    sc.stock_actual,
    p.costo_mercado_unit as costo_pmp, -- Simplified for now
    (sc.stock_actual * p.costo_mercado_unit) as valor_total_pen,
    -- DOH Calculation
    ROUND(
        CASE 
            WHEN c.consumo_diario_promedio > 0 THEN sc.stock_actual / c.consumo_diario_promedio
            ELSE 999 -- Infinite days (no consumption)
        END, 
        1
    ) as dias_inventario,
    -- Status Calculation
    CASE 
        WHEN sc.stock_actual <= 0 THEN 'CRITICO' -- Out of Stock
        WHEN sc.stock_actual <= p.stock_minimo THEN 'CRITICO' -- Safety Stock Breach
        WHEN sc.stock_actual <= p.punto_pedido THEN 'ALERTA'  -- Reorder Point
        ELSE 'OK'
    END as estado_abastecimiento
FROM stock_calc sc
JOIN cat_productos_variantes p ON sc.id_sku = p.id_sku
LEFT JOIN consumo_90d c ON sc.id_sku = c.id_sku;


-- 3. RESTORE DEPENDENT VIEWS 
-- (Re-run their definitions from previous steps, abbreviated here for dependency)

-- 3.1 KPI VALORIZACION (Depends on stock_realtime)
CREATE OR REPLACE VIEW vw_kpi_valorizacion AS
SELECT
    COUNT(*) as total_skus,
    SUM(valor_total_pen) as valor_inventario_pen,
    SUM(valor_total_pen) / (SELECT COALESCE(tipo_cambio_referencial, 3.75) FROM mst_config_general LIMIT 1) as valor_inventario_usd, 
    SUM(CASE WHEN estado_abastecimiento = 'CRITICO' THEN 1 ELSE 0 END) as skus_criticos,
    SUM(CASE WHEN estado_abastecimiento = 'ALERTA' THEN 1 ELSE 0 END) as skus_alerta
FROM vw_dashboard_stock_realtime;

-- 3.2 ZOMBIE STOCK (Depends on stock_realtime)
CREATE OR REPLACE VIEW vw_kpi_stock_zombie AS
WITH movimientos_recientes AS (
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
