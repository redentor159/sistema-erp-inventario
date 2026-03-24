-- =================================================================================================
-- SEED: AGREGAR NUEVA PLANTILLA VCO 04202 Y SUS VARIANTES
-- Fecha: 2026-03-19
--
-- Plantilla: Marco inferior (VCO 04202)
-- Sistema: Serie 28 (3142/3642) 25 peq. (SYS_28)
-- Marcas: CORRALES, HPD, EDUHOLGIN, LIMATAMBO
-- Colores: MATE, NEGRO, BLANCO, MADERA, CHAMPAGNE
-- =================================================================================================

-- 0. Limpieza de ID incorrecto (con espacio) si existe
DELETE FROM cat_productos_variantes WHERE id_plantilla = 'VCO 04202';
DELETE FROM cat_plantillas WHERE id_plantilla = 'VCO 04202';

-- 1. Asegurar que la plantilla existe
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm)
VALUES ('VCO4202', 'Marco inferior', 'PERF', 'SYS_28', 6000)
ON CONFLICT (id_plantilla) DO UPDATE SET
    nombre_generico = EXCLUDED.nombre_generico,
    id_familia = EXCLUDED.id_familia,
    id_sistema = EXCLUDED.id_sistema;

-- 2. Generar las 20 variantes (4 marcas x 5 acabados)
WITH marcas AS (
    SELECT id as id_brand, name as name_brand FROM (VALUES 
        ('COR', 'CORRALES'),
        ('HPD', 'HPD'),
        ('EDU', 'EDUHOLGIN'),
        ('LIM', 'LIMATAMBO')
    ) as m(id, name)
),
acabados AS (
    SELECT id as id_finish, name as name_finish FROM (VALUES 
        ('MAT', 'MATE'),
        ('NEG', 'NEGRO'),
        ('BLA', 'BLANCO'),
        ('MAD', 'MADERA'),
        ('CHA', 'CHAMPAGNE')
    ) as c(id, name)
)
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    nombre_completo, unidad_medida, id_almacen, costo_mercado_unit, moneda_reposicion
)
SELECT 
    'AL-VCO4202-' || a.id_finish || '-' || m.id_brand,
    'VCO4202',
    m.id_brand,
    'AL', -- Material Aluminio (AL)
    a.id_finish,
    'Marco inferior ' || a.name_finish || ' ' || m.name_brand,
    'UND',
    'PERFILES',
    150.00, -- Precio estimado referencial
    'PEN'
FROM marcas m
CROSS JOIN acabados a
ON CONFLICT (id_sku) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    id_marca = EXCLUDED.id_marca,
    id_acabado = EXCLUDED.id_acabado,
    id_material = EXCLUDED.id_material,
    unidad_medida = EXCLUDED.unidad_medida,
    id_almacen = EXCLUDED.id_almacen;

-- 3. Verificación
-- SELECT COUNT(*) FROM cat_productos_variantes WHERE id_sku LIKE 'AL-VCO4202%';
