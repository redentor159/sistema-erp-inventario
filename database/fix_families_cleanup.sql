-- MIGRATION: CLEANUP FAMILIES (MST_FAMILIAS)
-- Goal: Remove 'FAM_' prefix and consolidate duplicates as requested.

BEGIN;

-- 1. Ensure Target Families Exist (with correct Odoo categories if available)
INSERT INTO mst_familias (id_familia, nombre_familia, categoria_odoo) VALUES
('ACC', 'Accesorios', 'Component'),
('PERF', 'Perfilería Aluminio', 'Raw Material'),
('VID', 'Cristales / Vidrios', 'Raw Material'),
('GEN', 'Familia Genérica', 'Consumable')
ON CONFLICT (id_familia) DO UPDATE SET
    nombre_familia = EXCLUDED.nombre_familia,
    categoria_odoo = COALESCE(mst_familias.categoria_odoo, EXCLUDED.categoria_odoo);

-- 2. Migrate CAT_PLANTILLAS references
-- FAM_ACC -> ACC
UPDATE cat_plantillas SET id_familia = 'ACC' WHERE id_familia = 'FAM_ACC';

-- FAM_ALU -> PERF
UPDATE cat_plantillas SET id_familia = 'PERF' WHERE id_familia = 'FAM_ALU';

-- FAM_VID -> VID
UPDATE cat_plantillas SET id_familia = 'VID' WHERE id_familia = 'FAM_VID';

-- FAM_GEN -> GEN
UPDATE cat_plantillas SET id_familia = 'GEN' WHERE id_familia = 'FAM_GEN';

-- 3. Delete Old 'FAM_' Families
DELETE FROM mst_familias WHERE id_familia IN ('FAM_ACC', 'FAM_ALU', 'FAM_VID', 'FAM_GEN');

COMMIT;
