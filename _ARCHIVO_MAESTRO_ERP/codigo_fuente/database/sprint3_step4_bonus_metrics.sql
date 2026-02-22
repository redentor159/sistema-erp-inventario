-- Sprint 3: Dashboard & Delivery Logic (STEP 4: BONUS FINANCIAL METRICS)
-- Description: Adds Real Profit Margin and Sales Cycle Time.
-- Run this AFTER Step 3.

-- 1. VIEW: MARGEN DE CONTRIBUCIÓN REAL (Profitability)
-- This is critical: Compares Sales Price vs Direct Cost (Materials + Labor calculated)
CREATE OR REPLACE VIEW vw_kpi_margen_real AS
SELECT 
    DATE_TRUNC('month', fecha_emision) as mes,
    SUM(total_precio_venta) as ventas_totales,
    SUM(total_costo_directo) as costos_directos,
    SUM(total_precio_venta - total_costo_directo) as utilidad_bruta,
    -- Margin %: (Profit / Sales) * 100
    ROUND(
        (SUM(total_precio_venta - total_costo_directo) / NULLIF(SUM(total_precio_venta), 0)) * 100,
        1
    ) as margen_promedio_pct
FROM trx_cotizaciones_cabecera
WHERE estado IN ('Aprobada', 'Finalizada')
GROUP BY DATE_TRUNC('month', fecha_emision)
ORDER BY mes DESC
LIMIT 6; -- Last 6 months trend

-- 2. VIEW: CICLO DE VENTA PROMEDIO (Efficiency)
-- How many days does it take to close a deal?
CREATE OR REPLACE VIEW vw_kpi_ciclo_ventas AS
SELECT 
    -- Avg difference between Emission and Approval
    ROUND(AVG(EXTRACT(DAY FROM (fecha_aprobacion - fecha_emision)))::numeric, 1) as dias_promedio_cierre,
    MIN(EXTRACT(DAY FROM (fecha_aprobacion - fecha_emision))) as cierre_mas_rapido_dias,
    MAX(EXTRACT(DAY FROM (fecha_aprobacion - fecha_emision))) as cierre_mas_lento_dias
FROM trx_cotizaciones_cabecera
WHERE estado IN ('Aprobada', 'Finalizada')
AND fecha_aprobacion IS NOT NULL;
