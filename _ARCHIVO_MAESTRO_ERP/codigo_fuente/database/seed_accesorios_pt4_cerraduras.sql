-- ============================================================================
-- ACCESORIOS PARTE 4: CERRADURAS, CHAPAS Y OTROS
-- Fecha: 2026-02-07
-- Familia: ACC y ACCTE
-- ============================================================================

-- PLANTILLAS (24 plantillas)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
-- Cerraduras
('CH325U', 'Cerradura 325 Udinese', 'ACC', 'SYS_GEN', NULL, 0.00),
('CH323C', 'Cerradura embutir puerta corrediza aluminio', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHVISE', 'Cerradura de vitrina tipo serrucho', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHSBR', 'Cerradura sobreponer', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH56T', 'Cerradura vidrio templado tipo europeo 56mm', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHVIBO25', 'Cerradura vitrina Tipo Botón 25mm', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHVILE', 'Cerradura vitrina Tipo Lengüeta', 'ACC', 'SYS_GEN', NULL, 0.00),
('DL8700A', 'Cerradura y Contrachapa Doretti al cristal', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('ST446A', 'Cerradura de vidrio sin perforación', 'ACC', 'SYS_GEN', NULL, 0.00),
('DRT2008', 'Cerradura para puerta de vidrio Doretti', 'ACCTE', 'SYS_GEN', NULL, 0.00),
-- Chapas serie 35
('CH35', 'Chapa serie 35', 'ACC', 'SYS_35', NULL, 0.00),
-- Chapas especiales
('CHCO', 'Chapa cónica', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH40', 'Chapa de presión 40mm para tubo 1 1/2', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHPRE', 'Chapa para embutir pico recto', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHPLR', 'Chapa pico loro', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH612MA', 'Chapa pomo con manijas', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH612PE', 'Chapa pomo perilla', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHPR', 'Chapas pico recto', 'ACCTE', 'SYS_GEN', NULL, 0.00),
-- Contrachapaas
('614', 'Contrachapa al cristal para cerradura pomo', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CTR602', 'Contraplaca 602', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRPILR', 'Contraplaca cerradura pico de loro', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRPIRC', 'Contraplaca cerradura pico recto', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRPO', 'Contraplaca para cerradura de pomo', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRMPRY', 'Contraplaca para Manija Proyectante', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- ============================================================================
-- VARIANTES: Cerraduras varias (8 variantes simples)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CH325U-GEN', 'CH325U', 'UDI', 'AC', 'MAT', 'CH325U', 'Cerradura 325 Udinese', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH323C-GEN', 'CH323C', 'GEN', 'AL', 'MAT', 'CH323C', 'Cerradura embutir puerta corrediza aluminio', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHVISE-GEN', 'CHVISE', 'GEN', 'AC', 'MAT', 'CHVISE', 'Cerradura de vitrina tipo serrucho', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH56T-GEN', 'CH56T', 'GEN', 'AC', 'MAT', 'CH56T', 'Cerradura vidrio templado tipo europeo 56mm', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHVIBO25-GEN', 'CHVIBO25', 'GEN', 'AC', 'MAT', 'CHVIBO25', 'Cerradura vitrina Tipo Botón 25mm', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHVILE-GEN', 'CHVILE', 'GEN', 'AC', 'MAT', 'CHVILE', 'Cerradura vitrina Tipo Lengüeta', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('ST446A-GEN', 'ST446A', 'GEN', 'AC', 'MAT', 'ST-446A', 'Cerradura vidrio sin perforación', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('DRT2008-DOR', 'DRT2008', 'DOR', 'AC', 'MAT', 'DRT-2008', 'Cerradura puerta vidrio Doretti', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cerradura sobreponer (2 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CHSBR-PUL-GEN', 'CHSBR', 'GEN', 'AC', 'PUL', 'CHSBRACPU', 'Cerradura sobreponer Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHSBR-NEG-GEN', 'CHSBR', 'GEN', 'AC', 'NEG', 'CHSBRB', 'Cerradura sobreponer Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cerradura Doretti vidrio (1 variante)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('DL8700A-DOR', 'DL8700A', 'DOR', 'AC', 'MAT', 'DRT-DL8700A-20', 'Cerradura y Contrachapa Doretti al cristal', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Chapa serie 35 (4 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CH35-BLA-GEN', 'CH35', 'GEN', 'AL', 'BLA', 'CH35P', 'Chapa serie 35 Blanco', 'UND', 171.49, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH35-BRO-GEN', 'CH35', 'GEN', 'AL', 'BRO', 'CH35BR', 'Chapa serie 35 Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH35-MAT-GEN', 'CH35', 'GEN', 'AL', 'MAT', 'CH35A', 'Chapa serie 35 Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH35-NEG-GEN', 'CH35', 'GEN', 'AL', 'NEG', 'CH35B', 'Chapa serie 35 Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Chapas especiales (7 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CHCO-GEN', 'CHCO', 'GEN', 'AC', 'MAT', 'CHCO', 'Chapa cónica', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH40-GEN', 'CH40', 'GEN', 'AC', 'MAT', 'CH40', 'Chapa presión 40mm tubo 1 1/2', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHPRE-GEN', 'CHPRE', 'GEN', 'AC', 'MAT', 'CHPRE', 'Chapa embutir pico recto', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHPLR-GEN', 'CHPLR', 'GEN', 'AC', 'MAT', 'CHPLR', 'Chapa pico loro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH612MA-GEN', 'CH612MA', 'GEN', 'AC', 'MAT', 'CH612MA', 'Chapa pomo con manijas', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CH612PE-GEN', 'CH612PE', 'GEN', 'AC', 'MAT', 'CH612PE', 'Chapa pomo perilla', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CHPR-GEN', 'CHPR', 'GEN', 'AC', 'MAT', 'CHPR', 'Chapas pico recto', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Contrachapa 614 al cristal (5 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-614-NEG-GEN', '614', 'GEN', 'AC', 'NEG', 'AC614B', 'Contrachapa cerradura pomo Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-614-PUL-GEN', '614', 'GEN', 'AC', 'PUL', 'AC614PU', 'Contrachapa cerradura pomo Acero Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AC-614-SAT-GEN', '614', 'GEN', 'AC', 'SAT', 'AC614ST', 'Contrachapa cerradura pomo Acero Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-614-MAT-GEN', '614', 'GEN', 'AL', 'MAT', 'AL614A', 'Contrachapa cerradura pomo Aluminio Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('AL-614-NEG-GEN', '614', 'GEN', 'AL', 'NEG', 'AL614B', 'Contrachapa cerradura pomo Aluminio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Contraplacas varias (6 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CTR602-GEN', 'CTR602', 'GEN', 'AC', 'MAT', 'CTR602', 'Contraplaca 602', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CTRPILR-GEN', 'CTRPILR', 'GEN', 'AC', 'MAT', 'CTRPILR', 'Contraplaca cerradura pico de loro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CTRPIRC-GEN', 'CTRPIRC', 'GEN', 'AC', 'MAT', 'CTRPIRC', 'Contraplaca cerradura pico recto', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CTRPO-GEN', 'CTRPO', 'GEN', 'AC', 'MAT', 'CTRPO', 'Contraplaca para cerradura de pomo', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CTRMPRY-MAT-GEN', 'CTRMPRY', 'GEN', 'AL', 'MAT', 'CTRAPMPRYA', 'Contraplaca Manija Proyectante Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CTRMPRY-NEG-GEN', 'CTRMPRY', 'GEN', 'AL', 'NEG', 'CTRAPMPRYB', 'Contraplaca Manija Proyectante Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- RESUMEN PARTE 4:
-- Plantillas: 24
-- Variantes: 43
-- ============================================================================
