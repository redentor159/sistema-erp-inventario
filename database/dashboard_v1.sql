-- DASHBOARD MTO PHASE 2: DATA ARCHITECTURE
-- Author: Windsurf Agent
-- Date: 2026-02-05

-- 1. ADD REPLENISHMENT PARAMETERS TO PRODUCTS
ALTER TABLE cat_productos_variantes 
ADD COLUMN IF NOT EXISTS stock_minimo NUMERIC DEFAULT 0,       -- Stock de Seguridad (SS)
ADD COLUMN IF NOT EXISTS punto_pedido NUMERIC DEFAULT 0,       -- ROP (Reorder Point)
ADD COLUMN IF NOT EXISTS tiempo_reposicion_dias INT DEFAULT 7, -- Lead Time (L) en días
ADD COLUMN IF NOT EXISTS lote_econ_compra NUMERIC DEFAULT 1,   -- EOQ (Q)
ADD COLUMN IF NOT EXISTS demanda_promedio_diaria NUMERIC DEFAULT 0; -- D (Calculado job nocturno o manual)

-- 1.1 ADD OTIF PARAMETERS TO QUOTES
ALTER TABLE trx_cotizaciones_cabecera
ADD COLUMN IF NOT EXISTS fecha_prometida TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_entrega_real TIMESTAMP;

-- 2. VIEW: REAL-TIME STOCK & PMP (The Core Engine)
-- Calculates current stock and Weighted Average Cost (PMP)
CREATE OR REPLACE VIEW vw_dashboard_stock_realtime AS
WITH stock_calc AS (
    SELECT 
        id_sku,
        SUM(cantidad) as stock_actual,
        -- PMP Calculation Approximation:
        -- In a real complex system this is a recursive CTE or stored procedure using FIFO/Weighted Average.
        -- For this view, we will use a simplified approach:
        -- Average cost of all 'COMPRA' or 'SALDO_INICIAL' / Total Qty, OR just use the latest cost if PMP is too heavy for a view.
        -- Let's try to get a weighted average of inflows.
        CASE 
            WHEN SUM(CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END) = 0 THEN 0
            ELSE SUM(CASE WHEN cantidad > 0 THEN (cantidad * costo_unit_doc) ELSE 0 END) / SUM(CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END)
        END as costo_promedio_calculado
    FROM trx_movimientos
    GROUP BY id_sku
)
SELECT 
    sc.id_sku,
    p.nombre_completo,
    tpl.id_familia, -- Corrected: Fetched from Template
    p.unidad_medida,
    p.stock_minimo,
    p.punto_pedido,
    p.tiempo_reposicion_dias,
    p.demanda_promedio_diaria,
    p.moneda_reposicion,
    sc.stock_actual,
    sc.costo_promedio_calculado as costo_pmp,
    (sc.stock_actual * sc.costo_promedio_calculado) as valor_total_pen,
    -- Status Calculation
    CASE 
        WHEN sc.stock_actual <= p.stock_minimo THEN 'CRITICO' -- Rojo: Quiebre Inminente
        WHEN sc.stock_actual <= p.punto_pedido THEN 'ALERTA'  -- Amarillo: Pedir ya
        ELSE 'OK'                                             -- Verde
    END as estado_abastecimiento,
    -- DOH Calculation
    CASE 
        WHEN p.demanda_promedio_diaria > 0 THEN sc.stock_actual / p.demanda_promedio_diaria
        ELSE 999 -- Infinite/Unknown
    END as dias_inventario
FROM stock_calc sc
JOIN cat_productos_variantes p ON sc.id_sku = p.id_sku
LEFT JOIN cat_plantillas tpl ON p.id_plantilla = tpl.id_plantilla;

-- 3. VIEW: KPI VALORIZACION (Executive View)
CREATE OR REPLACE VIEW vw_kpi_valorizacion AS
SELECT
    COUNT(*) as total_skus,
    SUM(valor_total_pen) as valor_inventario_pen,
    -- Aproximación USD (TC Fijo por ahora o join con config)
    SUM(valor_total_pen) / 3.75 as valor_inventario_usd, 
    SUM(CASE WHEN estado_abastecimiento = 'CRITICO' THEN 1 ELSE 0 END) as skus_criticos,
    SUM(CASE WHEN estado_abastecimiento = 'ALERTA' THEN 1 ELSE 0 END) as skus_alerta
FROM vw_dashboard_stock_realtime;

-- 4. VIEW: ABC ANALYSIS (Pareto Base)
-- Based on consumption value in the last 90 days (Dynamic)
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

-- 5. VIEW: KPI OTIF (On-Time In-Full)
-- Measures delivery performance based on closed quotes/orders
CREATE OR REPLACE VIEW vw_kpi_otif AS
SELECT
    DATE_TRUNC('month', fecha_entrega_real) as mes,
    COUNT(*) as total_pedidos,
    SUM(CASE WHEN fecha_entrega_real <= fecha_prometida THEN 1 ELSE 0 END) as pedidos_a_tiempo,
    ROUND(
        (SUM(CASE WHEN fecha_entrega_real <= fecha_prometida THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100,
        2
    ) as pct_otif
FROM trx_cotizaciones_cabecera
WHERE estado IN ('ENTREGADO', 'FINALIZADO') -- Only finished orders
AND fecha_entrega_real IS NOT NULL
GROUP BY DATE_TRUNC('month', fecha_entrega_real)
ORDER BY mes DESC;

