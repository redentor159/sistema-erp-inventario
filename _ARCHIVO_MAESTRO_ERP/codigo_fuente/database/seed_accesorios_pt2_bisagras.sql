-- ============================================================================
-- ACCESORIOS PARTE 2: BISAGRAS
-- Fecha: 2026-02-07
-- Familia: ACCTE (Accesorios de Cristal Templado) y ACC (Accesorios)
-- ============================================================================

-- PLANTILLAS DE BISAGRAS (12 plantillas)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('BI35', 'Bisagra serie 35', 'ACC', 'SYS_GEN', NULL, 0.00),
('BI43', 'Bisagra serie 43', 'ACC', 'SYS_GEN', NULL, 0.00),
('111', 'Bisagra alta de rotación para puerta', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('112', 'Bisagra baja de rotación para puerta', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('113', 'Bisagra simple grande de puerta', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('121', 'Bisagra doble grande para puerta', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('BIDPLVM', 'Bisagra de ducha Plegadiza Vidrio a muro', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('BIDPLVV', 'Bisagra de ducha Plegadiza vidrio a vidrio', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('SH2330', 'Bisagra puerta de ducha 90° Vidrio a muro', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('SH2360', 'Bisagra puerta de ducha 180° vidrio a vidrio', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('SH2380', 'Bisagra puerta de ducha 135° vidrio a vidrio', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('SH2390', 'Bisagra puerta de ducha 90° vidrio a vidrio', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- ============================================================================
-- VARIANTES: Bisagra serie 35 (4 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BI35-BLA-GEN', 'BI35', 'GEN', 'GEN', 'BLA', 'BI35P', 'Bisagra serie 35 Blanco', 'UND', 11.79, 'PEN', '2026-02-07', FALSE, 0, 10),
('BI35-BRO-GEN', 'BI35', 'GEN', 'GEN', 'BRO', 'BI35BR', 'Bisagra serie 35 Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BI35-MAT-GEN', 'BI35', 'GEN', 'GEN', 'MAT', 'BI35A', 'Bisagra serie 35 Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BI35-NEG-GEN', 'BI35', 'GEN', 'GEN', 'NEG', 'BI35B', 'Bisagra serie 35 Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagra serie 43 (1 variante)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BI43-NEG-GEN', 'BI43', 'GEN', 'GEN', 'NEG', 'BI43B', 'Bisagra serie 43 Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 14)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagra 111 - Alta rotación puerta (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-111-NEG-GEN', '111', 'GEN', 'AC', 'NEG', 'AC111B', 'Bisagra alta rotación puerta Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-111-PUL-GEN', '111', 'GEN', 'AC', 'PUL', 'AC111PU', 'Bisagra alta rotación puerta Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-111-SAT-GEN', '111', 'GEN', 'AC', 'SAT', 'AC111ST', 'Bisagra alta rotación puerta Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-111-MAT-GEN', '111', 'GEN', 'AL', 'MAT', 'AL111A', 'Bisagra alta rotación puerta Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-111-NEG-GEN', '111', 'GEN', 'AL', 'NEG', 'AL111B', 'Bisagra alta rotación puerta Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagra 112 - Baja rotación puerta (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-112-NEG-GEN', '112', 'GEN', 'AC', 'NEG', 'AC112B', 'Bisagra baja rotación puerta Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-112-PUL-GEN', '112', 'GEN', 'AC', 'PUL', 'AC112PU', 'Bisagra baja rotación puerta Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-112-SAT-GEN', '112', 'GEN', 'AC', 'SAT', 'AC112ST', 'Bisagra baja rotación puerta Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-112-MAT-GEN', '112', 'GEN', 'AL', 'MAT', 'AL112A', 'Bisagra baja rotación puerta Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-112-NEG-GEN', '112', 'GEN', 'AL', 'NEG', 'AL112B', 'Bisagra baja rotación puerta Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagra 113 - Simple grande (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-113-NEG-GEN', '113', 'GEN', 'AC', 'NEG', 'AC113B', 'Bisagra simple grande puerta Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-113-PUL-GEN', '113', 'GEN', 'AC', 'PUL', 'AC113PU', 'Bisagra simple grande puerta Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-113-SAT-GEN', '113', 'GEN', 'AC', 'SAT', 'AC113ST', 'Bisagra simple grande puerta Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-113-MAT-GEN', '113', 'GEN', 'AL', 'MAT', 'AL113A', 'Bisagra simple grande puerta Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-113-NEG-GEN', '113', 'GEN', 'AL', 'NEG', 'AL113B', 'Bisagra simple grande puerta Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagra 121 - Doble grande (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-121-NEG-GEN', '121', 'GEN', 'AC', 'NEG', 'AC121B', 'Bisagra doble grande puerta Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-121-PUL-GEN', '121', 'GEN', 'AC', 'PUL', 'AC121PU', 'Bisagra doble grande puerta Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-121-SAT-GEN', '121', 'GEN', 'AC', 'SAT', 'AC121ST', 'Bisagra doble grande puerta Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-121-MAT-GEN', '121', 'GEN', 'AL', 'MAT', 'AL121A', 'Bisagra doble grande puerta Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-121-NEG-GEN', '121', 'GEN', 'AL', 'NEG', 'AL121B', 'Bisagra doble grande puerta Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagras ducha plegadizas BIDPL (4 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BIDPLVM-PUL-GEN', 'BIDPLVM', 'GEN', 'AC', 'PUL', 'BIDPLVM-PU', 'Bisagra ducha plegadiza vidrio-muro Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BIDPLVM-SAT-GEN', 'BIDPLVM', 'GEN', 'AC', 'SAT', 'BIDPLVM-ST', 'Bisagra ducha plegadiza vidrio-muro Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BIDPLVV-PUL-GEN', 'BIDPLVV', 'GEN', 'AC', 'PUL', 'BIDPLVV-PU', 'Bisagra ducha plegadiza vidrio-vidrio Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BIDPLVV-SAT-GEN', 'BIDPLVV', 'GEN', 'AC', 'SAT', 'BIDPLVV-ST', 'Bisagra ducha plegadiza vidrio-vidrio Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagras Doretti SH (8 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('SH2330-PUL-DOR', 'SH2330', 'DOR', 'AC', 'PUL', 'DR-SH2330-PU', 'Bisagra ducha 90° vidrio-muro Doretti Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2330-SAT-DOR', 'SH2330', 'DOR', 'AC', 'SAT', 'DR-SH2330-ST', 'Bisagra ducha 90° vidrio-muro Doretti Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2360-PUL-DOR', 'SH2360', 'DOR', 'AC', 'PUL', 'DR-SH2360-PU', 'Bisagra ducha 180° vidrio-vidrio Doretti Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2360-SAT-DOR', 'SH2360', 'DOR', 'AC', 'SAT', 'DR-SH2360-ST', 'Bisagra ducha 180° vidrio-vidrio Doretti Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2380-PUL-DOR', 'SH2380', 'DOR', 'AC', 'PUL', 'DR-SH2380-PU', 'Bisagra ducha 135° vidrio-vidrio Doretti Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2380-SAT-DOR', 'SH2380', 'DOR', 'AC', 'SAT', 'DR-SH2380-ST', 'Bisagra ducha 135° vidrio-vidrio Doretti Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2390-PUL-DOR', 'SH2390', 'DOR', 'AC', 'PUL', 'DR-SH2390-PU', 'Bisagra ducha 90° vidrio-vidrio Doretti Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH2390-SAT-DOR', 'SH2390', 'DOR', 'AC', 'SAT', 'DR-SH2390-ST', 'Bisagra ducha 90° vidrio-vidrio Doretti Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- RESUMEN PARTE 2:
-- Plantillas: 12
-- Variantes: 42
-- ============================================================================
