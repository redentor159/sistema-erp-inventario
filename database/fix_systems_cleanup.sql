-- MIGRATION: CLEANUP SYSTEMS (MST_SERIES_EQUIVALENCIAS)
-- Goal: Standardize on 'SYS_' codes and remove 'SIS_' duplicates.

BEGIN;

-- 1. Ensure Target Systems (SYS_) Exist
-- (User provided list, we make sure they are in the master table)
INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial, cod_corrales, cod_eduholding, cod_hpd, cod_limatambo, uso_principal) VALUES 
('SYS_20', 'Serie 20 Clásica', '20', '20', 'VCO 036', '19', 'Ventana Corrediza'),
('SYS_25', 'Serie 25 Clásica', '25', '25', '-', '26', 'Mampara y/o Ventana Corrediza'),
('SYS_28', 'Serie 28 (3142/3642)', '28(3142/3642)', '-', 'VCO 042 (MCO)', 'VL / ML 42', 'Mampara y/o Ventana Corrediza'),
('SYS_29', 'Serie 29 (3131/8131)', '29(3131/8131)', '-', 'VCO 031', NULL, 'Ventana Corrediza economica'),
('SYS_35', 'Serie 35 Batiente', '35', '35', 'MBT 035', '45', 'Puerta Batiente'),
('SYS_36', 'Serie 36 / PB71', '36', 'PB71', 'MBT 036', 'MBL 46', 'Puerta y mampara Batiente Clasica'),
('SYS_3825', 'Serie 3825 Económica', '3825', '3825', '-', '35', 'Ventana Corrediza economica'),
('SYS_3831', 'Serie 3831 Proyectante', '3831', '3831', '-', '38', 'Ventana Proyectante economica'),
('SYS_42', 'Serie 42 Proyectante', '42', '42', ' VPR 036', '-', 'Ventana Proyectante'),
('SYS_43M', 'Serie 43 (MCO)', '-', '-', 'MCO 043', 'ML46', 'Mampara Corrediza'),
('SYS_43V', 'Serie 43 (VCO)', '-', '-', 'VCO 043', 'VL46', 'Ventana Corrediza'),
('SYS_45', 'Serie 45 Muro Cortina', '45', '45', '-', '44', 'Muro Cortina/Fachada'),
('SYS_62', 'Serie 62 Europea', '62', '62', '-', 'VL48', 'Ventana Europea Corrediza Perimetral'),
('SYS_80', 'Serie 80 Europea', '80', '80', '-', 'ML48', 'Mampara Europea Corrediza Perimetral'),
('SYS_GEN', 'Sistema Generico', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id_sistema) DO UPDATE SET
    nombre_comercial = EXCLUDED.nombre_comercial,
    cod_corrales = EXCLUDED.cod_corrales,
    uso_principal = EXCLUDED.uso_principal;

-- 2. Migrate CAT_PLANTILLAS references
UPDATE cat_plantillas SET id_sistema = 'SYS_20' WHERE id_sistema = 'SIS_20';
UPDATE cat_plantillas SET id_sistema = 'SYS_25' WHERE id_sistema = 'SIS_25';
UPDATE cat_plantillas SET id_sistema = 'SYS_3825' WHERE id_sistema = 'SIS_3825';
UPDATE cat_plantillas SET id_sistema = 'SYS_42' WHERE id_sistema = 'SIS_42';
UPDATE cat_plantillas SET id_sistema = 'SYS_62' WHERE id_sistema = 'SIS_62';
UPDATE cat_plantillas SET id_sistema = 'SYS_80' WHERE id_sistema = 'SIS_80';
UPDATE cat_plantillas SET id_sistema = 'SYS_GEN' WHERE id_sistema = 'SIS_GEN';

-- 3. Delete Old 'SIS_' Systems
DELETE FROM mst_series_equivalencias WHERE id_sistema LIKE 'SIS_%';

COMMIT;
