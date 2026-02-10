-- CLEANUP SCRIPT: MOVEMENT HISTORY & PROFILES ONLY
-- GOAL: Clear all transaction history (to fix FK errors) and delete ONLY Profile data for replacement.

BEGIN;

-- 1. DELETE STOCK MOVEMENTS & HISTORY (The Blocker)
-- We MUST clear this first because previous test profiles are referenced here.
TRUNCATE TABLE trx_movimientos CASCADE;

-- 2. DELETE INVENTORY TRANSACTIONS (In/Out)
TRUNCATE TABLE trx_entradas_detalle CASCADE;
TRUNCATE TABLE trx_entradas_cabecera CASCADE;
TRUNCATE TABLE trx_salidas_detalle CASCADE;
TRUNCATE TABLE trx_salidas_cabecera CASCADE;

-- 2.1 DELETE RETAZOS (Scrap Stock)
TRUNCATE TABLE dat_retazos_disponibles CASCADE;

-- 3. DELETE QUOTES & BREAKDOWNS
TRUNCATE TABLE trx_desglose_materiales CASCADE;
TRUNCATE TABLE trx_cotizaciones_detalle CASCADE;
TRUNCATE TABLE trx_cotizaciones_cabecera CASCADE;

-- 4. DO NOT DELETE RECIPES (Master Data Preserved)
-- The user explicitly requested to keep recipes intact.

-- 5. DELETE UNUSED PROFILES (Safe Mode)
-- We delete Profiles ONLY if they are NOT used in any recipe.

-- 5.1 Delete Variants first (skipping those whose templates are used)
DELETE FROM cat_productos_variantes 
WHERE id_plantilla IN (
    SELECT id_plantilla FROM cat_plantillas 
    WHERE (id_familia = 'PERF' OR id_familia IS NULL)
    AND id_plantilla NOT IN (SELECT DISTINCT id_plantilla FROM mst_recetas_ingenieria)
);

-- 5.2 Delete Templates (skipping those used in recipes)
DELETE FROM cat_plantillas 
WHERE (id_familia = 'PERF' OR id_familia IS NULL)
AND id_plantilla NOT IN (SELECT DISTINCT id_plantilla FROM mst_recetas_ingenieria);

-- 6. REPORT PRESERVED PROFILES
-- Show the user which profiles were kept because they are used in recipes
SELECT p.id_plantilla, p.nombre_generico, COUNT(r.id_receta) as num_recetas_usando
FROM cat_plantillas p
JOIN mst_recetas_ingenieria r ON p.id_plantilla = r.id_plantilla
WHERE p.id_familia = 'PERF' OR p.id_familia IS NULL
GROUP BY p.id_plantilla, p.nombre_generico;

COMMIT;

-- 6. RESET SEQUENCES (Optional)
-- ALTER SEQUENCE ... RESTART WITH 1;

COMMIT;
