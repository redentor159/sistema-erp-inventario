-- ============================================================================
-- SCRIPT MAESTRO PARA INSERTAR CRISTALES
-- Ejecutar los scripts en orden:
-- 1. seed_cristales_acabado.sql      (prerequisitos)
-- 2. seed_cristales_plantillas.sql   (11 plantillas)
-- 3. seed_cristales_variantes_pt1.sql (CAT3, CRU3, CRU4)
-- 4. seed_cristales_variantes_pt2.sql (CRU5, CRU8)
-- 5. seed_cristales_variantes_pt3.sql (LM6, LM8, LM10)
-- 6. seed_cristales_variantes_pt4.sql (TEM6)
-- 7. seed_cristales_variantes_pt5.sql (TEM8, TEM10)
-- ============================================================================

-- Ejecutar en orden:
\i seed_cristales_acabado.sql
\i seed_cristales_plantillas.sql
\i seed_cristales_variantes_pt1.sql
\i seed_cristales_variantes_pt2.sql
\i seed_cristales_variantes_pt3.sql
\i seed_cristales_variantes_pt4.sql
\i seed_cristales_variantes_pt5.sql

-- RESUMEN:
-- Plantillas: 11 registros
-- Variantes:  72 registros
-- TOTAL:      83 registros
