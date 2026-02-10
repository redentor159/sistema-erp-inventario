-- ============================================================================
-- ACCESORIOS PARTE 5: OTROS (Base Perno, Burletes, Canoplas, Clips, Conectores, Contraseguros)
-- Fecha: 2026-02-07
-- Familia: ACC y ACCTE
-- ============================================================================

-- PLANTILLAS (25 plantillas)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
-- Base para Perno
('BAPCAC', 'Base para Perno cuadrado Acero', 'ACC', 'SYS_GEN', NULL, 0.00),
('BAPCFI', 'Base para Perno cuadrado Fierro', 'ACC', 'SYS_GEN', NULL, 0.00),
('BAPRAC', 'Base para Perno Rectangular Acero', 'ACC', 'SYS_GEN', NULL, 0.00),
('BAPRFI', 'Base para Perno Rectangular Fierro', 'ACC', 'SYS_GEN', NULL, 0.00),
-- Bisagra hidráulica
('BIHID', 'Bisagras hidráulicas para cristal templado', 'ACC', 'SYS_GEN', NULL, 0.00),
-- Burletes
('BUDC', 'Burlete DC Serie 3831/42/45', 'ACC', 'SYS_3831', NULL, 0.00),
('BU20', 'Burlete P/4mm Serie 20', 'ACC', 'SYS_20', NULL, 0.00),
('BU8062', 'Burlete P/8mm Serie 62/80', 'ACC', 'SYS_8062', NULL, 0.00),
-- Canoplas
('CA11', 'Canopla de 1 x 1 cuadrada', 'ACC', 'SYS_GEN', NULL, 0.00),
('CA112', 'Canoplas de 1 1/2 cuadrada', 'ACC', 'SYS_GEN', NULL, 0.00),
('CA2431', 'Canopla para tubo cuadrado balaustre 2431', 'ACC', 'SYS_GEN', NULL, 0.00),
-- Clips
('CLPVITR', 'Clip Sistema Vitroven', 'ACC', 'SYS_GEN', NULL, 0.00),
-- Conectores
('DR800E5', 'Conector cristal-cristal Doretti', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('DRSH6015', 'Conector cristal-cristal Doretti SH', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('DR8200E3', 'Conector Doretti 8200E3', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('DRSH6060', 'Conector muro-cristal Doretti', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('SH5060', 'Conector tipo U muro a vidrio', 'ACCTE', 'SYS_GEN', NULL, 0.00),
-- Contraseguros
('CTRAS20', 'Contraseguro Serie 20/25', 'ACC', 'SYS_20', NULL, 0.00),
-- Cinta
('CIDC', 'Cinta doble contacto', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- ============================================================================
-- VARIANTES: Base para Perno (8 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BAPCAC-MAT-GEN', 'BAPCAC', 'GEN', 'AC', 'MAT', 'BAPCACA', 'Base Perno cuadrado Acero Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPCAC-NEG-GEN', 'BAPCAC', 'GEN', 'AC', 'NEG', 'BAPCACB', 'Base Perno cuadrado Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPCFI-MAT-GEN', 'BAPCFI', 'GEN', 'FE', 'MAT', 'BAPCFIA', 'Base Perno cuadrado Fierro Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPCFI-NEG-GEN', 'BAPCFI', 'GEN', 'FE', 'NEG', 'BAPCFIB', 'Base Perno cuadrado Fierro Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPRAC-MAT-GEN', 'BAPRAC', 'GEN', 'AC', 'MAT', 'BAPRACA', 'Base Perno rectangular Acero Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPRAC-NEG-GEN', 'BAPRAC', 'GEN', 'AC', 'NEG', 'BAPRACB', 'Base Perno rectangular Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPRFI-MAT-GEN', 'BAPRFI', 'GEN', 'FE', 'MAT', 'BAPRFIA', 'Base Perno rectangular Fierro Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BAPRFI-NEG-GEN', 'BAPRFI', 'GEN', 'FE', 'NEG', 'BAPRFiB', 'Base Perno rectangular Fierro Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Bisagra hidráulica (1 variante)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BIHID-GEN', 'BIHID', 'GEN', 'AC', 'MAT', 'BI', 'Bisagras hidráulicas para cristal templado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Burletes (3 variantes) - por metro
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BUDC-NEG-GEN', 'BUDC', 'GEN', 'PVC', 'NEG', 'BUDCB', 'Burlete DC Serie 3831/42/45 Negro', 'METRO', 0.97, 'PEN', '2026-02-07', FALSE, 0, 10),
('BU20-NEG-GEN', 'BU20', 'GEN', 'PVC', 'NEG', 'BU20B', 'Burlete P/4mm Serie 20 Negro', 'METRO', 1.29, 'PEN', '2026-02-07', FALSE, 0, 10),
('BU8062-NEG-GEN', 'BU8062', 'GEN', 'PVC', 'NEG', 'BU8062B', 'Burlete P/8mm Serie 62/80 Negro', 'METRO', 1.77, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Canoplas (3 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CA11-GEN', 'CA11', 'GEN', 'AC', 'MAT', 'CA11', 'Canopla 1 x 1 cuadrada', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CA112-GEN', 'CA112', 'GEN', 'AC', 'MAT', 'CA112', 'Canopla 1 1/2 cuadrada', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CA2431-GEN', 'CA2431', 'GEN', 'AC', 'MAT', 'CA2431', 'Canopla tubo cuadrado balaustre 2431', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Clips Vitroven (3 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CLPVITR-BLA-GEN', 'CLPVITR', 'GEN', 'PVC', 'BLA', 'CLPVITRP', 'Clip Sistema Vitroven Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CLPVITR-MAT-GEN', 'CLPVITR', 'GEN', 'PVC', 'MAT', 'CLPVITRA', 'Clip Sistema Vitroven Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CLPVITR-NEG-GEN', 'CLPVITR', 'GEN', 'PVC', 'NEG', 'CLPVITRB', 'Clip Sistema Vitroven Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Conectores Doretti (8 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('DR800E5-DOR', 'DR800E5', 'DOR', 'AC', 'MAT', 'DR-800E5', 'Conector cristal-cristal Doretti', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('DRSH6015-DOR', 'DRSH6015', 'DOR', 'AC', 'MAT', 'DR-SH6015', 'Conector cristal-cristal Doretti SH', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('DR8200E3-DOR', 'DR8200E3', 'DOR', 'AC', 'MAT', 'DR-8200E3', 'Conector Doretti 8200E3', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('DRSH6060-DOR', 'DRSH6060', 'DOR', 'AC', 'MAT', 'DR-SH6060', 'Conector muro-cristal Doretti', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH5060-NEG-DOR', 'SH5060', 'DOR', 'AC', 'NEG', 'DR-SH5060-B', 'Conector tipo U muro-vidrio Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH5060-PUL-DOR', 'SH5060', 'DOR', 'AC', 'PUL', 'DR-SH5060-PU', 'Conector tipo U muro-vidrio Pulido', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('SH5060-SAT-DOR', 'SH5060', 'DOR', 'AC', 'SAT', 'DR-SH5060-ST', 'Conector tipo U muro-vidrio Satinado', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Contraseguros Fermax (2 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CTRAS20-BLA-FER', 'CTRAS20', 'FER', 'AL', 'BLA', 'CTRASFP', 'Contraseguro Fermax S-20/25 Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CTRAS20-MAT-FER', 'CTRAS20', 'FER', 'AL', 'MAT', 'CTRASFA', 'Contraseguro Fermax S-20/25 Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cinta doble contacto (1 variante)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CIDC-GEN', 'CIDC', 'GEN', 'PVC', 'MAT', 'CIDC', 'Cinta doble contacto', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- RESUMEN PARTE 5:
-- Plantillas: 19
-- Variantes: 32
-- ============================================================================
