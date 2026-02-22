-- SEED: MISSING PRODUCTS (SKUs) FOR COTIZACIONES (FIXED V3)
-- Generates SKUs using real codes (MAT, GEN) based on Plantillas.
-- Ensures dependencies (Master Data) exist to avoid FK errors.

-- 0a. ENSURE BRAND 'GEN' EXISTS
INSERT INTO mst_marcas (id_marca, nombre_marca, pais_origen) 
VALUES ('GEN', 'Generico', 'China') 
ON CONFLICT (id_marca) DO NOTHING;

-- 0b. ENSURE MATERIAL 'GEN' EXISTS
INSERT INTO mst_materiales (id_material, nombre_material) 
VALUES ('GEN', 'Generico') 
ON CONFLICT (id_material) DO NOTHING;

-- 0c. ENSURE FINISH 'GEN' EXISTS
INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado, sufijo_sku) 
VALUES ('GEN', 'Generico', 'GEN') 
ON CONFLICT (id_acabado) DO NOTHING;

-- 1. Insert Products (Profiles -> AL-PLANTILLA-MAT-GEN)
-- We insert a default 'MAT' (Mate/Natural) variant for every Aluminium Profile
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion
)
SELECT 
    'AL-' || id_plantilla || '-MAT-GEN', -- Generated SKU using MAT and GEN
    id_plantilla,
    'GEN', -- Brand
    'GEN', -- Material
    'MAT', -- Color (Mate/Natural) - User confirmed this exists
    nombre_generico || ' - Mate/Natural',
    'UND6M', -- Assume 6m bars
    150.00, -- Dummy Price
    'PEN'
FROM cat_plantillas
WHERE id_familia = 'PERF'
ON CONFLICT (id_sku) DO NOTHING;

-- 2. Insert Products (Accessories -> AC-PLANTILLA-GEN-GEN)
-- We insert a default 'GEN' variant for Accessories
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion
)
SELECT 
    'AC-' || id_plantilla || '-GEN-GEN', -- Generated SKU
    id_plantilla,
    'GEN', -- Brand
    'GEN', -- Material
    'GEN', -- Finish (Acabado)
    nombre_generico,
    'UND',
    5.00, -- Dummy Price
    'PEN'
FROM cat_plantillas
WHERE id_familia IN ('ACC', 'GEN')
ON CONFLICT (id_sku) DO NOTHING;

-- 3. Specific Fix for Vidrio (Tests use 'VID-TEMPLADO 10mm-GEN')
INSERT INTO cat_productos_variantes (
    id_sku, nombre_completo, costo_mercado_unit, es_templado, costo_flete_m2
) VALUES 
('VID-TEMPLADO 10mm-GEN', 'Vidrio Templado 10mm Incoloro', 85.00, TRUE, 15.00)
ON CONFLICT (id_sku) DO NOTHING;
