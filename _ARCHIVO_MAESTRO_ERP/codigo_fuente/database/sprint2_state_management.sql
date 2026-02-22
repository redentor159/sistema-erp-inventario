-- Migration: Quotation State Management (Fixed Dependencies)
-- Description: Adds ENUM for states and audit columns. Converts existing 'estado' column.
-- Handles dependencies on views vw_kpi_otif and vw_cotizaciones_totales.

-- 1. Drop Dependent Views
DROP VIEW IF EXISTS vw_kpi_otif;
DROP VIEW IF EXISTS vw_cotizaciones_totales;

-- 2. Create ENUM Type
DO $$ BEGIN
    CREATE TYPE estado_cotizacion AS ENUM ('Borrador', 'Aprobada', 'Rechazada', 'Anulada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Standardize existing data
UPDATE trx_cotizaciones_cabecera 
SET estado = 'Borrador' 
WHERE estado IS NULL OR estado::text NOT IN ('Borrador', 'Aprobada', 'Rechazada', 'Anulada');

-- 4. Alter Table
ALTER TABLE trx_cotizaciones_cabecera
    ALTER COLUMN estado TYPE estado_cotizacion USING estado::estado_cotizacion,
    ALTER COLUMN estado SET DEFAULT 'Borrador',
    ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fecha_rechazo TIMESTAMP,
    ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;

-- 5. Recreate Views

-- 5.1 Recreate vw_cotizaciones_totales (Updated Definition)
CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
SELECT 
    c.id_cotizacion,
    c.fecha_emision,
    c.estado,  -- Now returns the ENUM type
    c.id_cliente,
    c.id_marca,
    c.nombre_proyecto,
    c.moneda,
    c.validez_dias,
    c.plazo_entrega,
    c.condicion_pago,
    c.markup_aplicado,
    c.incluye_igv,
    c.aplica_detraccion,
    c.costo_mano_obra_m2,
    c.costo_global_instalacion,
    c.costo_fijo_instalacion,
    c.observaciones,
    c.link_pdf,
    -- Audit fields
    c.fecha_aprobacion,
    c.fecha_rechazo,
    c.motivo_rechazo,
    -- Calculated Totals
    COALESCE(SUM(d.subtotal_linea), 0) as _vc_subtotal_items,
    COALESCE(SUM(d.costo_base_ref), 0) as _vc_total_costo_materiales,
    -- Installation logic
    COALESCE(c.costo_fijo_instalacion, 0) as _vc_costo_instalacion,
    -- Base Imponible (Items + Instalación)
    (COALESCE(SUM(d.subtotal_linea), 0) + COALESCE(c.costo_fijo_instalacion, 0)) as _vc_base_imponible,
    -- IGV Logic
    CASE 
        WHEN c.incluye_igv THEN (COALESCE(SUM(d.subtotal_linea), 0) + COALESCE(c.costo_fijo_instalacion, 0)) * 0.18
        ELSE 0 
    END as _vc_monto_igv,
    -- Final Price
    CASE 
        WHEN c.incluye_igv THEN (COALESCE(SUM(d.subtotal_linea), 0) + COALESCE(c.costo_fijo_instalacion, 0)) * 1.18
        ELSE (COALESCE(SUM(d.subtotal_linea), 0) + COALESCE(c.costo_fijo_instalacion, 0))
    END as _vc_precio_final_cliente
FROM trx_cotizaciones_cabecera c
LEFT JOIN trx_cotizaciones_detalle d ON c.id_cotizacion = d.id_cotizacion
GROUP BY c.id_cotizacion;

-- 5.2 Recreate vw_kpi_otif (Updated Logic for new States)
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
WHERE estado = 'Aprobada' -- Updated from ENTREGADO/FINALIZADO
AND fecha_entrega_real IS NOT NULL
GROUP BY DATE_TRUNC('month', fecha_entrega_real)
ORDER BY mes DESC;
