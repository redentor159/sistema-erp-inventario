-- Sprint 3: Dashboard & Delivery Logic (STEP 3: REAL METRICS)
-- Description: Adds Commercial KPIs and Inventory Value recovery.
-- Run this AFTER Step 2.

-- 1. VIEW: KPI CONVERSION RATE (Win Rate)
CREATE OR REPLACE VIEW vw_kpi_conversion AS
SELECT 
    COUNT(*) as total_cotizaciones,
    SUM(CASE WHEN estado IN ('Aprobada', 'Finalizada') THEN 1 ELSE 0 END) as ganadas,
    SUM(CASE WHEN estado = 'Rechazada' THEN 1 ELSE 0 END) as perdidas,
    SUM(CASE WHEN estado = 'Borrador' THEN 1 ELSE 0 END) as pendientes,
    ROUND(
        (SUM(CASE WHEN estado IN ('Aprobada', 'Finalizada') THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
        1
    ) as tasa_conversion_pct
FROM trx_cotizaciones_cabecera
WHERE estado != 'Anulada'; -- Exclude Annulled from stats

-- 2. VIEW: TICKET PROMEDIO (Average Deal Size)
CREATE OR REPLACE VIEW vw_kpi_ticket_promedio AS
SELECT 
    COALESCE(AVG(total_precio_venta), 0) as ticket_promedio_pen,
    COALESCE(MAX(total_precio_venta), 0) as max_ticket_pen,
    COALESCE(MIN(total_precio_venta), 0) as min_ticket_pen,
    COUNT(*) as total_ventas_cerradas
FROM trx_cotizaciones_cabecera
WHERE estado IN ('Aprobada', 'Finalizada');

-- 3. VIEW: TOP PRODUCTOS/SISTEMAS (Product Mix)
CREATE OR REPLACE VIEW vw_kpi_top_productos AS
SELECT 
    d.id_modelo, -- e.g. "V-CORREDIZA-20"
    COUNT(*) as cantidad_vendida,
    SUM(d.subtotal_linea) as volumen_ventas_pen,
    ROUND(
        (SUM(d.subtotal_linea) / NULLIF((SELECT SUM(total_precio_venta) FROM trx_cotizaciones_cabecera WHERE estado IN ('Aprobada', 'Finalizada')), 0)) * 100,
        1
    ) as pct_volumen_ventas
FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion
WHERE c.estado IN ('Aprobada', 'Finalizada')
GROUP BY d.id_modelo
ORDER BY volumen_ventas_pen DESC
LIMIT 10;

-- 4. VIEW: RETAZOS VALORIZADOS (Capital Recovery)
CREATE OR REPLACE VIEW vw_kpi_retazos_valorizados AS
WITH retazos_calc AS (
    SELECT 
        r.id_retazo,
        r.longitud_mm,
        p.costo_mercado_unit,
        pl.largo_estandar_mm,
        -- Calculate Value: (Length / Standard_Length) * Unit_Cost
        (r.longitud_mm / COALESCE(NULLIF(pl.largo_estandar_mm, 0), 6000)) * COALESCE(p.costo_mercado_unit, 0) as valor_estimado
    FROM dat_retazos_disponibles r
    JOIN cat_productos_variantes p ON r.id_sku_padre = p.id_sku
    LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
    WHERE r.estado = 'DISPONIBLE'
)
SELECT 
    COUNT(*) as cantidad_retazos,
    SUM(longitud_mm) / 1000.0 as total_metros_lineales,
    SUM(valor_estimado) as valor_recuperable_pen
FROM retazos_calc;
