-- Sprint 3: Dashboard & Delivery Logic (STEP 2: VIEWS & KPIS)
-- Description: Recreates Dashboard Views using the new 'Finalizada' status.
-- IMPORTANT: Run this script AFTER Step 1 (Enum update) is committed.

-- 1. DROP dependent views first to update definitions cleanly if needed
DROP VIEW IF EXISTS vw_kpi_otif;
DROP VIEW IF EXISTS vw_kpi_valorizacion;
DROP VIEW IF EXISTS vw_kpi_abc_analisis;
DROP VIEW IF EXISTS vw_dashboard_stock_realtime;

-- 2. RECREATE VIEWS with logic for 'Finalizada' and Real Stock

-- 2.1 VIEW: REAL-TIME STOCK & PMP (Core Engine for Inventory)
CREATE OR REPLACE VIEW vw_dashboard_stock_realtime AS
WITH stock_calc AS (
    SELECT 
        id_sku,
        COALESCE(SUM(cantidad), 0) as stock_actual,
        CASE 
            WHEN SUM(CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END) = 0 THEN 0
            ELSE SUM(CASE WHEN cantidad > 0 THEN (cantidad * COALESCE(costo_unit_doc, 0)) ELSE 0 END) / SUM(CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END)
        END as costo_promedio_calculado
    FROM trx_movimientos
    GROUP BY id_sku
)
SELECT 
    sc.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    COALESCE(p.stock_minimo, 0) as stock_minimo,
    COALESCE(p.punto_pedido, 0) as punto_pedido,
    sc.stock_actual,
    sc.costo_promedio_calculado as costo_pmp,
    (sc.stock_actual * sc.costo_promedio_calculado) as valor_total_pen,
    -- Status Calculation
    CASE 
        WHEN sc.stock_actual <= 0 THEN 'CRITICO' -- Out of Stock
        WHEN sc.stock_actual <= p.stock_minimo THEN 'CRITICO' -- Safety Stock Breach
        WHEN sc.stock_actual <= p.punto_pedido THEN 'ALERTA'  -- Reorder Point
        ELSE 'OK'
    END as estado_abastecimiento
FROM stock_calc sc
JOIN cat_productos_variantes p ON sc.id_sku = p.id_sku;


-- 2.2 VIEW: KPI VALORIZACION (Executive View)
CREATE OR REPLACE VIEW vw_kpi_valorizacion AS
SELECT
    COUNT(*) as total_skus,
    SUM(valor_total_pen) as valor_inventario_pen,
    SUM(valor_total_pen) / (SELECT COALESCE(tipo_cambio_referencial, 3.75) FROM mst_config_general LIMIT 1) as valor_inventario_usd, 
    SUM(CASE WHEN estado_abastecimiento = 'CRITICO' THEN 1 ELSE 0 END) as skus_criticos,
    SUM(CASE WHEN estado_abastecimiento = 'ALERTA' THEN 1 ELSE 0 END) as skus_alerta
FROM vw_dashboard_stock_realtime;


-- 2.3 VIEW: KPI OTIF (On-Time In-Full)
-- Updated logic: Only consider 'Finalizada' orders for completed deliveries
CREATE OR REPLACE VIEW vw_kpi_otif AS
SELECT
    DATE_TRUNC('month', fecha_entrega_real) as mes,
    COUNT(*) as total_pedidos,
    SUM(CASE WHEN fecha_entrega_real <= fecha_prometida THEN 1 ELSE 0 END) as pedidos_a_tiempo,
    ROUND(
        (SUM(CASE WHEN fecha_entrega_real <= fecha_prometida THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        2
    ) as pct_otif
FROM trx_cotizaciones_cabecera
WHERE estado = 'Finalizada'::estado_cotizacion
AND fecha_entrega_real IS NOT NULL
GROUP BY DATE_TRUNC('month', fecha_entrega_real)
ORDER BY mes DESC;


-- 2.4 VIEW: ABC ANALYSIS (Pareto Base)
CREATE OR REPLACE VIEW vw_kpi_abc_analisis AS
WITH salidas_recent AS (
    SELECT 
        id_sku,
        ABS(SUM(cantidad)) as cantidad_salida,
        ABS(SUM(costo_total_pen)) as valor_salida
    FROM trx_movimientos
    WHERE tipo_movimiento IN ('VENTA', 'PRODUCCION', 'SALIDA')
    AND fecha_hora >= (NOW() - INTERVAL '90 days')
    GROUP BY id_sku
),
total_valor AS (
    SELECT SUM(valor_salida) as grand_total FROM salidas_recent
)
SELECT 
    s.id_sku,
    p.nombre_completo,
    s.valor_salida,
    (s.valor_salida / t.grand_total) * 100 as pct_participacion,
    SUM(s.valor_salida / t.grand_total) OVER (ORDER BY s.valor_salida DESC) as pct_acumulado,
    CASE 
        WHEN SUM(s.valor_salida / t.grand_total) OVER (ORDER BY s.valor_salida DESC) <= 0.80 THEN 'A'
        WHEN SUM(s.valor_salida / t.grand_total) OVER (ORDER BY s.valor_salida DESC) <= 0.95 THEN 'B'
        ELSE 'C'
    END as clasificacion_abc
FROM salidas_recent s
CROSS JOIN total_valor t
JOIN cat_productos_variantes p ON s.id_sku = p.id_sku;
