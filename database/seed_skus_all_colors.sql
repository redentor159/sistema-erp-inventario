-- =================================================================================================
-- SEED: GENERAR SKUs PARA TODAS LAS COMBINACIONES DE COLOR Y PLANTILLA
-- Fecha: 2026-02-07
-- 
-- Este script genera SKUs para todos los perfiles con cada color disponible.
-- Formato: AL-{plantilla}-{color}-GEN
-- =================================================================================================

-- 1. Asegurar que existen los acabados de perfiles
INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado, sufijo_sku) VALUES
('BLA', 'Blanco Pintura', 'P'),
('CHA', 'Champagne', 'C'),
('MAD', 'Madera', 'M'),
('MAT', 'Mate / Natural', 'A'),
('NEG', 'Negro', 'B')
ON CONFLICT (id_acabado) DO UPDATE SET nombre_acabado = EXCLUDED.nombre_acabado;

-- 2. Generar SKUs para cada combinación Plantilla + Color para marca GEN
-- Usamos un CROSS JOIN para generar todas las combinaciones

-- Para cada color en la lista
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion
)
SELECT 
    'AL-' || p.id_plantilla || '-' || c.id_acabado || '-GEN',
    p.id_plantilla,
    'GEN',
    'GEN',
    c.id_acabado,
    p.nombre_generico || ' - ' || c.nombre_acabado,
    'UND6M',
    150.00,  -- Costo dummy, actualizar con precios reales
    'PEN'
FROM cat_plantillas p
CROSS JOIN mst_acabados_colores c
WHERE p.id_familia = 'PERF'
AND c.id_acabado IN ('BLA', 'CHA', 'MAD', 'MAT', 'NEG')
ON CONFLICT (id_sku) DO NOTHING;

-- 3. También crear SKUs con marca LIM (Limatambo) que es común
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion
)
SELECT 
    'AL-' || p.id_plantilla || '-' || c.id_acabado || '-LIM',
    p.id_plantilla,
    'LIM',
    'GEN',
    c.id_acabado,
    p.nombre_generico || ' - ' || c.nombre_acabado || ' (Limatambo)',
    'UND6M',
    160.00,  -- Limatambo suele ser un poco más caro
    'PEN'
FROM cat_plantillas p
CROSS JOIN mst_acabados_colores c
WHERE p.id_familia = 'PERF'
AND c.id_acabado IN ('BLA', 'CHA', 'MAD', 'MAT', 'NEG')
ON CONFLICT (id_sku) DO NOTHING;

-- 4. Crear marca LIM si no existe
INSERT INTO mst_marcas (id_marca, nombre_marca, pais_origen)
VALUES ('LIM', 'Corporación Limatambo', 'Perú')
ON CONFLICT (id_marca) DO NOTHING;

-- 5. Verificar cuántos SKUs se crearon
-- SELECT COUNT(*) as total_skus FROM cat_productos_variantes WHERE id_sku LIKE 'AL-%';
