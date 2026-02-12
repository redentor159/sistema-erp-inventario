-- Sprint 3: Dashboard & Delivery Logic (STEP 1: DATABASE STRUCTURE)
-- Description: Adds 'Finalizada' status and Delivery Date columns.
-- IMPORTANT: Run this script FIRST. It must be committed before running Step 2.

-- 1. Add 'Finalizada' to ENUM 'estado_cotizacion'
-- This needs to be committed before it can be used in Views.
DO $$ BEGIN
    ALTER TYPE estado_cotizacion ADD VALUE IF NOT EXISTS 'Finalizada' AFTER 'Aprobada';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Delivery Date Columns (Idempotent)
ALTER TABLE trx_cotizaciones_cabecera
ADD COLUMN IF NOT EXISTS fecha_prometida TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_entrega_real TIMESTAMP;

-- 3. Confirm success
DO $$ BEGIN
    RAISE NOTICE 'Step 1 Completed: Enum and Columns updated. Now run Step 2.';
END $$;
