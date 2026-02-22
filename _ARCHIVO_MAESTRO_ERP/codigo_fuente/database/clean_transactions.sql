-- =================================================================================================
-- CLEAN TRANSACTIONS SCRIPT
-- =================================================================================================
-- Purpose: Delete ALL transactional data (Movements, Quotations, Entries, Exits).
-- Usage: Run this script in your Supabase SQL Editor.
-- WARNING: This action is IRREVERSIBLE.
-- =================================================================================================

BEGIN;

-- 1. Truncate Transactional Tables (Cascade handles details)
TRUNCATE TABLE trx_movimientos CASCADE;
TRUNCATE TABLE trx_entradas_cabecera CASCADE;
TRUNCATE TABLE trx_salidas_cabecera CASCADE;
TRUNCATE TABLE trx_cotizaciones_cabecera CASCADE;

-- 2. Truncate Operational Data (Retazos - dependent on production/consumption)
TRUNCATE TABLE dat_retazos_disponibles CASCADE;

-- 3. Reset Sequences (Optional but recommended for a clean slate)
-- (Supabase TRUNCATE usually resets identity columns if RESTART IDENTITY is used, 
--  but default TRUNCATE just empties. Let's add RESTART IDENTITY to be sure)

TRUNCATE TABLE trx_movimientos RESTART IDENTITY CASCADE;
TRUNCATE TABLE trx_entradas_cabecera RESTART IDENTITY CASCADE;
TRUNCATE TABLE trx_salidas_cabecera RESTART IDENTITY CASCADE;
TRUNCATE TABLE trx_cotizaciones_cabecera RESTART IDENTITY CASCADE;
TRUNCATE TABLE dat_retazos_disponibles RESTART IDENTITY CASCADE;

COMMIT;

-- Verify (Counts should be 0)
SELECT count(*) as movimientos FROM trx_movimientos;
SELECT count(*) as cotizaciones FROM trx_cotizaciones_cabecera;
