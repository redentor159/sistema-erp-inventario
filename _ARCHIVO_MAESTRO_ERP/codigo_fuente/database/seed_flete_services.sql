-- SEED: FLETE SERVICES BY THICKNESS
-- User wants different prices for Embalaje+Flete based on glass thickness (6, 8, 10mm).

-- 1. Ensure Family 'SER' exists (or use GEN/ACC)
-- We will use 'GEN' family and 'Servicio' type implicitly via the logic.

-- 2. Insert Service Products
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion
) VALUES 
('SER-FLETE-06MM', 'E+F', 'GEN', 'GEN', 'GEN', 'Emb+Flete (6mm)', 'M2', 15.00, 'PEN'),
('SER-FLETE-08MM', 'E+F', 'GEN', 'GEN', 'GEN', 'Emb+Flete (8mm)', 'M2', 20.00, 'PEN'),
('SER-FLETE-10MM', 'E+F', 'GEN', 'GEN', 'GEN', 'Emb+Flete (10mm)', 'M2', 25.00, 'PEN')
ON CONFLICT (id_sku) DO UPDATE SET 
    costo_mercado_unit = EXCLUDED.costo_mercado_unit;

-- 3. Update the Glass used in tests to have correct thickness
UPDATE cat_productos_variantes 
SET espesor_mm = 10 
WHERE id_sku = 'VID-TEMPLADO 10mm-GEN';
