-- Sprint 3: Dashboard & Delivery Logic (STEP 8: DYNAMIC ABC ANALYSIS)
-- Description: Creates an RPC function to calculate ABC Analysis with variable timeframe.

-- 1. DROP EXISTING FUNCTION IF EXISTS
DROP FUNCTION IF EXISTS get_abc_analysis_v2;

-- 2. CREATE DYNAMIC FUNCTION
-- Returns TABLE structure matching the previous view
CREATE OR REPLACE FUNCTION get_abc_analysis_v2(p_dias INT DEFAULT 90)
RETURNS TABLE (
    id_sku TEXT,
    nombre_completo TEXT,
    valor_salida NUMERIC,
    pct_participacion NUMERIC,
    pct_acumulado NUMERIC,
    clasificacion_abc TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH salidas_recent AS (
        SELECT 
            m.id_sku,
            ABS(SUM(m.cantidad)) as cantidad_salida,
            ABS(SUM(m.costo_total_pen)) as valor_salida
        FROM trx_movimientos m
        WHERE m.tipo_movimiento IN ('VENTA', 'PRODUCCION', 'SALIDA')
        -- Logic: If p_dias is NULL or 0, ignore date filter (ALL TIME). Else, apply filter.
        AND (p_dias IS NULL OR p_dias <= 0 OR m.fecha_hora >= (NOW() - (p_dias || ' days')::INTERVAL))
        GROUP BY m.id_sku
    ),
    total_valor AS (
        SELECT COALESCE(SUM(s.valor_salida), 0) as grand_total FROM salidas_recent s
    )
    SELECT 
        s.id_sku,
        p.nombre_completo,
        s.valor_salida,
        CASE 
            WHEN t.grand_total = 0 THEN 0 
            ELSE (s.valor_salida / t.grand_total) * 100 
        END as pct_participacion,
        
        SUM(case when t.grand_total = 0 then 0 else s.valor_salida / t.grand_total end) 
            OVER (ORDER BY s.valor_salida DESC) as pct_acumulado,
            
        CASE 
            WHEN SUM(case when t.grand_total = 0 then 0 else s.valor_salida / t.grand_total end) 
                OVER (ORDER BY s.valor_salida DESC) <= 0.80 THEN 'A'
            WHEN SUM(case when t.grand_total = 0 then 0 else s.valor_salida / t.grand_total end) 
                OVER (ORDER BY s.valor_salida DESC) <= 0.95 THEN 'B'
            ELSE 'C'
        END as clasificacion_abc
    FROM salidas_recent s
    CROSS JOIN total_valor t
    JOIN cat_productos_variantes p ON s.id_sku = p.id_sku
    ORDER BY s.valor_salida DESC;
END;
$$;
