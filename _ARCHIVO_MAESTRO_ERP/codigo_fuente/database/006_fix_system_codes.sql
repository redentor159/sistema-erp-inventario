-- 006_fix_system_codes.sql (Corrected to use SYS_)
-- Fix System ID Mismatch (Standardizing to SYS_)
-- User confirmed 'SYS_' is the standard. This aligns Master Data (seed_catalog uses SIS_) with User Data (SYS_).

-- 1. Insert SIS_ equivalents using SYS_ prefix into Master Table
INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial, uso_principal) VALUES
('SYS_20',   'Serie 20', 'Ventana'),
('SYS_25',   'Serie 25', 'Ventana'),
('SYS_29',   'Serie 3131', 'Ventana'), -- Standard for S3131
('SYS_3825', 'Serie 3825', 'Ventana'),
('SYS_3831', 'Serie 3831', 'Proyectante'),
('SYS_42',   'Serie 42', 'Proyectante'),
('SYS_62',   'Serie 62', 'Ventana'),
('SYS_80',   'Serie 80', 'Ventana'),
('SYS_GEN',  'Sistema Genérico', 'Varios'),
('SYS_MOD',  'Serie Modena', 'Varios')
ON CONFLICT (id_sistema) DO NOTHING;

-- 2. Update PLANTILLAS (Templates) to point to SYS_
-- This fixes items from seed_catalog.sql which used SIS_
UPDATE cat_plantillas SET id_sistema = REPLACE(id_sistema, 'SIS_', 'SYS_') 
WHERE id_sistema LIKE 'SIS_%';

-- 3. Update Recipes Engineering (if applicable)
UPDATE mst_recetas_ingenieria SET id_sistema = REPLACE(id_sistema, 'SIS_', 'SYS_') 
WHERE id_sistema LIKE 'SIS_%';

-- 4. Update Recipes Modelos (User data already is SYS, but allow fixing accidental SIS)
UPDATE mst_recetas_modelos SET id_sistema = REPLACE(id_sistema, 'SIS_', 'SYS_') 
WHERE id_sistema LIKE 'SIS_%';
