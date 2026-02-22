-- ============================================================================
-- ACCESORIOS PARTE 1: BASES DE ROTACIÓN
-- Fecha: 2026-02-07
-- Familia: ACCTE (Accesorios de Cristal Templado)
-- ============================================================================

-- PLANTILLAS DE BASES (15 plantillas)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('401', 'Base alta de rotación', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('402', 'Base baja de rotación', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('403', 'Base de rotación para puertas sin sobreluz', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('411', 'Base de rotación y fijación de un cristal', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('421', 'Base de rotación y fijación para dos cristales', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('432', 'Base de rotación y unión entre 2 o 3 cristales a 90 grados', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('4311', 'Base de rotación y fijación de tres cristales en ángulo de 90-derecha', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('4312', 'Base de rotación y fijación de tres cristales en ángulo de 90-izquierda', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('4411', 'Base de rotación entre cuatro cristales derechos', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('4412', 'Base de rotación entre cuatro cristales izquierdos', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('4511', 'Base de rotación entre cinco cristales derechos', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('4512', 'Base de rotación entre cinco cristales izquierdos', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('471', 'Base de rotación entre siete cristales', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('722', 'Bípode', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('611', 'Chapa para piso 6001', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- ============================================================================
-- VARIANTES: Base 401 - Base alta de rotación (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-401-NEG-GEN', '401', 'GEN', 'AC', 'NEG', 'AC401B', 'Base alta de rotación Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-401-PUL-GEN', '401', 'GEN', 'AC', 'PUL', 'AC401PU', 'Base alta de rotación Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-401-SAT-GEN', '401', 'GEN', 'AC', 'SAT', 'AC401ST', 'Base alta de rotación Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-401-MAT-GEN', '401', 'GEN', 'AL', 'MAT', 'AL401A', 'Base alta de rotación Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-401-NEG-GEN', '401', 'GEN', 'AL', 'NEG', 'AL401B', 'Base alta de rotación Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Base 402 - Base baja de rotación (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-402-NEG-GEN', '402', 'GEN', 'AC', 'NEG', 'AC402B', 'Base baja de rotación Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-402-PUL-GEN', '402', 'GEN', 'AC', 'PUL', 'AC402PU', 'Base baja de rotación Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-402-SAT-GEN', '402', 'GEN', 'AC', 'SAT', 'AC402ST', 'Base baja de rotación Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-402-MAT-GEN', '402', 'GEN', 'AL', 'MAT', 'AL402A', 'Base baja de rotación Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-402-NEG-GEN', '402', 'GEN', 'AL', 'NEG', 'AL402B', 'Base baja de rotación Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Base 403 - Base sin sobreluz (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-403-NEG-GEN', '403', 'GEN', 'AC', 'NEG', 'AC403B', 'Base rotación puertas sin sobreluz Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-403-PUL-GEN', '403', 'GEN', 'AC', 'PUL', 'AC403PU', 'Base rotación puertas sin sobreluz Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-403-SAT-GEN', '403', 'GEN', 'AC', 'SAT', 'AC403ST', 'Base rotación puertas sin sobreluz Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-403-MAT-GEN', '403', 'GEN', 'AL', 'MAT', 'AL403A', 'Base rotación puertas sin sobreluz Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-403-NEG-GEN', '403', 'GEN', 'AL', 'NEG', 'AL403B', 'Base rotación puertas sin sobreluz Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Base 411 - Fijación 1 cristal (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-411-NEG-GEN', '411', 'GEN', 'AC', 'NEG', 'AC411B', 'Base rotación y fijación 1 cristal Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-411-PUL-GEN', '411', 'GEN', 'AC', 'PUL', 'AC411PU', 'Base rotación y fijación 1 cristal Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-411-SAT-GEN', '411', 'GEN', 'AC', 'SAT', 'AC411ST', 'Base rotación y fijación 1 cristal Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-411-MAT-GEN', '411', 'GEN', 'AL', 'MAT', 'AL411A', 'Base rotación y fijación 1 cristal Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-411-NEG-GEN', '411', 'GEN', 'AL', 'NEG', 'AL411B', 'Base rotación y fijación 1 cristal Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Base 421 - Fijación 2 cristales (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-421-NEG-GEN', '421', 'GEN', 'AC', 'NEG', 'AC421B', 'Base rotación y fijación 2 cristales Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-421-PUL-GEN', '421', 'GEN', 'AC', 'PUL', 'AC421PU', 'Base rotación y fijación 2 cristales Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-421-SAT-GEN', '421', 'GEN', 'AC', 'SAT', 'AC421ST', 'Base rotación y fijación 2 cristales Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-421-MAT-GEN', '421', 'GEN', 'AL', 'MAT', 'AL421A', 'Base rotación y fijación 2 cristales Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-421-NEG-GEN', '421', 'GEN', 'AL', 'NEG', 'AL421B', 'Base rotación y fijación 2 cristales Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Base 432 - Unión 90 grados (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-432-NEG-GEN', '432', 'GEN', 'AC', 'NEG', 'AC432B', 'Base rotación y unión 90 grados Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-432-PUL-GEN', '432', 'GEN', 'AC', 'PUL', 'AC432PU', 'Base rotación y unión 90 grados Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-432-SAT-GEN', '432', 'GEN', 'AC', 'SAT', 'AC432ST', 'Base rotación y unión 90 grados Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-432-MAT-GEN', '432', 'GEN', 'AL', 'MAT', 'AL432A', 'Base rotación y unión 90 grados Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-432-NEG-GEN', '432', 'GEN', 'AL', 'NEG', 'AL432B', 'Base rotación y unión 90 grados Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bases multi-cristal (4311, 4312, 4411, 4412, 4511, 4512, 471)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- 4311 - 3 cristales derecha
('AC-4311-NEG-GEN', '4311', 'GEN', 'AC', 'NEG', 'AC4311B', 'Base 3 cristales 90° derecha Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4311-PUL-GEN', '4311', 'GEN', 'AC', 'PUL', 'AC4311PU', 'Base 3 cristales 90° derecha Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4311-SAT-GEN', '4311', 'GEN', 'AC', 'SAT', 'AC4311ST', 'Base 3 cristales 90° derecha Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4311-MAT-GEN', '4311', 'GEN', 'AL', 'MAT', 'AL4311A', 'Base 3 cristales 90° derecha Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4311-NEG-GEN', '4311', 'GEN', 'AL', 'NEG', 'AL4311B', 'Base 3 cristales 90° derecha Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- 4312 - 3 cristales izquierda
('AC-4312-NEG-GEN', '4312', 'GEN', 'AC', 'NEG', 'AC4312B', 'Base 3 cristales 90° izquierda Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4312-PUL-GEN', '4312', 'GEN', 'AC', 'PUL', 'AC4312PU', 'Base 3 cristales 90° izquierda Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4312-SAT-GEN', '4312', 'GEN', 'AC', 'SAT', 'AC4312ST', 'Base 3 cristales 90° izquierda Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4312-MAT-GEN', '4312', 'GEN', 'AL', 'MAT', 'AL4312A', 'Base 3 cristales 90° izquierda Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4312-NEG-GEN', '4312', 'GEN', 'AL', 'NEG', 'AL4312B', 'Base 3 cristales 90° izquierda Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- 4411 - 4 cristales derecha
('AC-4411-NEG-GEN', '4411', 'GEN', 'AC', 'NEG', 'AC4411B', 'Base 4 cristales derecha Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4411-PUL-GEN', '4411', 'GEN', 'AC', 'PUL', 'AC4411PU', 'Base 4 cristales derecha Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4411-SAT-GEN', '4411', 'GEN', 'AC', 'SAT', 'AC4411ST', 'Base 4 cristales derecha Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4411-MAT-GEN', '4411', 'GEN', 'AL', 'MAT', 'AL4411A', 'Base 4 cristales derecha Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4411-NEG-GEN', '4411', 'GEN', 'AL', 'NEG', 'AL4411B', 'Base 4 cristales derecha Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- 4412 - 4 cristales izquierda
('AC-4412-NEG-GEN', '4412', 'GEN', 'AC', 'NEG', 'AC4412B', 'Base 4 cristales izquierda Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4412-PUL-GEN', '4412', 'GEN', 'AC', 'PUL', 'AC4412PU', 'Base 4 cristales izquierda Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4412-SAT-GEN', '4412', 'GEN', 'AC', 'SAT', 'AC4412ST', 'Base 4 cristales izquierda Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4412-MAT-GEN', '4412', 'GEN', 'AL', 'MAT', 'AL4412A', 'Base 4 cristales izquierda Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4412-NEG-GEN', '4412', 'GEN', 'AL', 'NEG', 'AL4412B', 'Base 4 cristales izquierda Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- 4511 - 5 cristales derecha
('AC-4511-NEG-GEN', '4511', 'GEN', 'AC', 'NEG', 'AC4511B', 'Base 5 cristales derecha Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4511-PUL-GEN', '4511', 'GEN', 'AC', 'PUL', 'AC4511PU', 'Base 5 cristales derecha Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4511-SAT-GEN', '4511', 'GEN', 'AC', 'SAT', 'AC4511ST', 'Base 5 cristales derecha Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4511-MAT-GEN', '4511', 'GEN', 'AL', 'MAT', 'AL4511A', 'Base 5 cristales derecha Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4511-NEG-GEN', '4511', 'GEN', 'AL', 'NEG', 'AL4511B', 'Base 5 cristales derecha Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- 4512 - 5 cristales izquierda
('AC-4512-NEG-GEN', '4512', 'GEN', 'AC', 'NEG', 'AC4512B', 'Base 5 cristales izquierda Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4512-PUL-GEN', '4512', 'GEN', 'AC', 'PUL', 'AC4512PU', 'Base 5 cristales izquierda Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-4512-SAT-GEN', '4512', 'GEN', 'AC', 'SAT', 'AC4512ST', 'Base 5 cristales izquierda Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4512-MAT-GEN', '4512', 'GEN', 'AL', 'MAT', 'AL4512A', 'Base 5 cristales izquierda Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-4512-NEG-GEN', '4512', 'GEN', 'AL', 'NEG', 'AL4512B', 'Base 5 cristales izquierda Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- 471 - 7 cristales
('AC-471-NEG-GEN', '471', 'GEN', 'AC', 'NEG', 'AC471B', 'Base 7 cristales Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-471-PUL-GEN', '471', 'GEN', 'AC', 'PUL', 'AC471PU', 'Base 7 cristales Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-471-SAT-GEN', '471', 'GEN', 'AC', 'SAT', 'AC471ST', 'Base 7 cristales Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-471-MAT-GEN', '471', 'GEN', 'AL', 'MAT', 'AL471A', 'Base 7 cristales Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-471-NEG-GEN', '471', 'GEN', 'AL', 'NEG', 'AL471B', 'Base 7 cristales Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bípode 722 (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-722-NEG-GEN', '722', 'GEN', 'AC', 'NEG', 'AC722B', 'Bípode Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-722-PUL-GEN', '722', 'GEN', 'AC', 'PUL', 'AC722PU', 'Bípode Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-722-SAT-GEN', '722', 'GEN', 'AC', 'SAT', 'AC722ST', 'Bípode Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-722-MAT-GEN', '722', 'GEN', 'AL', 'MAT', 'AL722A', 'Bípode Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-722-NEG-GEN', '722', 'GEN', 'AL', 'NEG', 'AL722B', 'Bípode Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Chapa piso 611 (3 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-611-NEG-GEN', '611', 'GEN', 'AC', 'NEG', 'AC611B', 'Chapa para piso 6001 Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-611-PUL-GEN', '611', 'GEN', 'AC', 'PUL', 'AC611PU', 'Chapa para piso 6001 Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-611-SAT-GEN', '611', 'GEN', 'AC', 'SAT', 'AC611ST', 'Chapa para piso 6001 Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- RESUMEN PARTE 1:
-- Plantillas: 15
-- Variantes: 73
-- ============================================================================
