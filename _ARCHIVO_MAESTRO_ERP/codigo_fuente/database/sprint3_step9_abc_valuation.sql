-- Sprint 3: Dashboard & Delivery Logic (STEP 9: ABC BY INVENTORY VALUE)
-- Description: Creates an RPC function for ABC Analysis based on Current Inventory Value (Cash Flow).

DROP FUNCTION IF EXISTS get_abc_inventory_valuation;

CREATE OR REPLACE FUNCTION get_abc_inventory_valuation()
RETURNS TABLE (
    id_sku TEXT,
    nombre_completo TEXT,
    valor_metric NUMERIC,    -- This will be 'valor_total_pen' (Stock * Cost)
    pct_participacion NUMERIC,
    pct_acumulado NUMERIC,
    clasificacion_abc TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH stock_val AS (
        -- Source from the realtime view which already calculates Stock * Cost
        SELECT 
            s.id_sku,
            p.nombre_completo,
            s.valor_total_pen as metric_value
        FROM vw_dashboard_stock_realtime s
        JOIN cat_productos_variantes p ON s.id_sku = p.id_sku
        WHERE s.valor_total_pen > 0 -- Only items with value
    ),
    total_val AS (
        SELECT COALESCE(SUM(metric_value), 0) as grand_total FROM stock_val
    )
    SELECT 
        s.id_sku,
        s.nombre_completo,
        s.metric_value,
        CASE 
            WHEN t.grand_total = 0 THEN 0 
            ELSE (s.metric_value / t.grand_total) * 100 
        END as pct_participacion,
        
        SUM(case when t.grand_total = 0 then 0 else s.metric_value / t.grand_total end) 
            OVER (ORDER BY s.metric_value DESC) as pct_acumulado,
            
        CASE 
            WHEN SUM(case when t.grand_total = 0 then 0 else s.metric_value / t.grand_total end) 
                OVER (ORDER BY s.metric_value DESC) <= 0.80 THEN 'A'
            WHEN SUM(case when t.grand_total = 0 then 0 else s.metric_value / t.grand_total end) 
                OVER (ORDER BY s.metric_value DESC) <= 0.95 THEN 'B'
            ELSE 'C'
        END as clasificacion_abc
    FROM stock_val s
    CROSS JOIN total_val t
    ORDER BY s.metric_value DESC;
END;
$$;
