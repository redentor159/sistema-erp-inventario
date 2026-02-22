-- 018_add_manual_engineering_flag.sql
-- Add boolean flag 'es_despiece_manual' to detailed items table.
-- Default is FALSE, meaning the system calculates automatically.

ALTER TABLE trx_cotizaciones_detalle 
ADD COLUMN IF NOT EXISTS es_despiece_manual BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN trx_cotizaciones_detalle.es_despiece_manual IS 'Indica si la ingenieria ha sido modificada manualmente. Si es TRUE, el sistema no debe recalcular automaticamente salvo confirmacion.';
