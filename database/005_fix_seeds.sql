-- 005_fix_seeds.sql
-- Fix missing Master Data codes used in 'seed_accesorios_diversos.sql'
-- This ensures that products like 'AC-BRA25-MAT-GEN' have valid Foreign Keys.

-- 1. Ensure Materials (Short Codes)
INSERT INTO mst_materiales (id_material, nombre_material) VALUES
('AC', 'Acero (Short Code)'),
('AL', 'Aluminio (Short Code)'),
('FE', 'Fierro (Short Code)'),
('PVC', 'PVC (Short Code)'),
('ZA', 'Zamac (Short Code)'),
('CR', 'Cristal (Short Code)')
ON CONFLICT (id_material) DO NOTHING;

-- 2. Ensure Brands (Short Codes)
INSERT INTO mst_marcas (id_marca, nombre_marca, pais_origen) VALUES
('GEN', 'Generico (Short Code)', 'Varios'),
('FER', 'Fermax (Short Code)', 'Brasil'),
('UDI', 'Udinese (Short Code)', 'Brasil'),
('HPD', 'HPD (Short Code)', 'China'),
('DOR', 'Dorma (Short Code)', 'Alemania')
ON CONFLICT (id_marca) DO NOTHING;

-- 3. Ensure Finishes (Short Codes)
-- Note: 'MAT', 'NEG', 'BLA' might already exist or conflict if handled differently.
-- Checking typical codes.
INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado) VALUES
('MAT', 'Mate'),
('NEG', 'Negro'),
('PUL', 'Pulido'),
('SAT', 'Satinado'),
('BLA', 'Blanco'),
('BRO', 'Bronce'),
('GRI', 'Gris')
ON CONFLICT (id_acabado) DO NOTHING;

-- 4. Re-run Seed Accessories (Optional / Manual by User)
-- The user should run 'seed_accesorios_diversos.sql' AFTER this script if they haven't already.
