-- ============================================================================
-- ACCESORIOS PARTE 3: BRAZOS Y CIERRES LATERALES
-- Fecha: 2026-02-07
-- Familia: ACC (Accesorios)
-- ============================================================================

-- PLANTILLAS BRAZOS (7 plantillas)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('BRA25', 'Brazo Extensor 25cm', 'ACC', 'SYS_3831', 250, 0.00),
('BRA30', 'Brazo Extensor 30cm', 'ACC', 'SYS_3831', 300, 0.00),
('BRA40', 'Brazo Extensor 40cm', 'ACC', 'SYS_3831', 400, 0.00),
('BRA60', 'Brazo Extensor 60cm', 'ACC', 'SYS_3831', 600, 0.00),
('BRA65', 'Brazo Extensor 65cm', 'ACC', 'SYS_3831', 650, 0.00),
('BRA90', 'Brazo Extensor 90cm', 'ACC', 'SYS_3831', 900, 0.00),
('BRA95', 'Brazo Extensor 95cm', 'ACC', 'SYS_3831', 950, 0.00),
('BRALIM', 'Brazo Limitador para hoja batiente aluminio', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- PLANTILLAS CIERRES (6 plantillas)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('CI20', 'Cierre lateral 14cm Serie 20', 'ACC', 'SYS_20', 140, 0.00),
('CI25', 'Cierre lateral 19cm Serie 25', 'ACC', 'SYS_25', 190, 0.00),
('CI8062', 'Cierre lateral Serie 80/62', 'ACC', 'SYS_8062', NULL, 0.00),
('CILL20', 'Cierre lateral con llave 14cm Serie 20', 'ACC', 'SYS_20', 140, 0.00),
('CILL25', 'Cierre lateral con llave 19cm Serie 25', 'ACC', 'SYS_25', 190, 0.00),
('CIMPI', 'Cierre MPI', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- ============================================================================
-- VARIANTES: Brazos Acero (4 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BRA25-MAT-GEN-AC', 'BRA25', 'GEN', 'AC', 'MAT', 'BRA25ACA', 'Brazo Ext. 25cm Acero Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA25-NEG-GEN-AC', 'BRA25', 'GEN', 'AC', 'NEG', 'BRA25ACB', 'Brazo Ext. 25cm Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA30-MAT-GEN-AC', 'BRA30', 'GEN', 'AC', 'MAT', 'BRA30ACA', 'Brazo Ext. 30cm Acero Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA30-NEG-GEN-AC', 'BRA30', 'GEN', 'AC', 'NEG', 'BRA30ACB', 'Brazo Ext. 30cm Acero Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Brazos Fermax (14 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BRA25-MAT-FER', 'BRA25', 'FER', 'AC', 'MAT', 'BRA25FA', 'Brazo Ext. 25cm Fermax Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA25-NEG-FER', 'BRA25', 'FER', 'AC', 'NEG', 'BRA25FB', 'Brazo Ext. 25cm Fermax Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA30-MAT-FER', 'BRA30', 'FER', 'AC', 'MAT', 'BRA30FA', 'Brazo Ext. 30cm Fermax Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA30-NEG-FER', 'BRA30', 'FER', 'AC', 'NEG', 'BRA30FB', 'Brazo Ext. 30cm Fermax Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA40-MAT-FER', 'BRA40', 'FER', 'AC', 'MAT', 'BRA40FA', 'Brazo Ext. 40cm Fermax Mate', 'UND', 64.75, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA40-NEG-FER', 'BRA40', 'FER', 'AC', 'NEG', 'BRA40FB', 'Brazo Ext. 40cm Fermax Negro', 'UND', 64.75, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA60-MAT-FER', 'BRA60', 'FER', 'AC', 'MAT', 'BRA60FA', 'Brazo Ext. 60cm Fermax Mate', 'UND', 79.55, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA60-NEG-FER', 'BRA60', 'FER', 'AC', 'NEG', 'BRA60FB', 'Brazo Ext. 60cm Fermax Negro', 'UND', 79.55, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA95-MAT-FER', 'BRA95', 'FER', 'AC', 'MAT', 'BRA95FA', 'Brazo Ext. 95cm Fermax Mate', 'UND', 103.60, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA95-NEG-FER', 'BRA95', 'FER', 'AC', 'NEG', 'BRA95FB', 'Brazo Ext. 95cm Fermax Negro', 'UND', 103.60, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Brazos Udinese (8 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BRA40-MAT-UDI', 'BRA40', 'UDI', 'AC', 'MAT', 'BRA40UA', 'Brazo Ext. 40cm Udinese Mate', 'UND', 51.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA40-NEG-UDI', 'BRA40', 'UDI', 'AC', 'NEG', 'BRA40UB', 'Brazo Ext. 40cm Udinese Negro', 'UND', 51.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA65-MAT-UDI', 'BRA65', 'UDI', 'AC', 'MAT', 'BRA65UA', 'Brazo Ext. 65cm Udinese Mate', 'UND', 61.05, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA65-NEG-UDI', 'BRA65', 'UDI', 'AC', 'NEG', 'BRA65UB', 'Brazo Ext. 65cm Udinese Negro', 'UND', 90.65, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA90-MAT-UDI', 'BRA90', 'UDI', 'AC', 'MAT', 'BRA90UA', 'Brazo Ext. 90cm Udinese Mate', 'UND', 90.65, 'PEN', '2026-02-07', FALSE, 0, 10),
('BRA90-NEG-UDI', 'BRA90', 'UDI', 'AC', 'NEG', 'BRA90UB', 'Brazo Ext. 90cm Udinese Negro', 'UND', 61.05, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Brazo Limitador (1 variante)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('BRALIM-GEN', 'BRALIM', 'GEN', 'AL', 'MAT', 'BRALIAL', 'Brazo Limitador hoja batiente aluminio', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cierre lateral Serie 20 - Sin llave (16 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- Fermax
('CI20-BLA-FER', 'CI20', 'FER', 'AL', 'BLA', 'CI20FP', 'Cierre lateral S20 Fermax Blanco', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-BRO-FER', 'CI20', 'FER', 'AL', 'BRO', 'CI20FBR', 'Cierre lateral S20 Fermax Bronce', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-MAT-FER', 'CI20', 'FER', 'AL', 'MAT', 'CI20FA', 'Cierre lateral S20 Fermax Mate', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-NEG-FER', 'CI20', 'FER', 'AL', 'NEG', 'CI20FB', 'Cierre lateral S20 Fermax Negro', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Genérico
('CI20-BLA-GEN', 'CI20', 'GEN', 'AL', 'BLA', 'CI20GP', 'Cierre lateral S20 Genérico Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-BRO-GEN', 'CI20', 'GEN', 'AL', 'BRO', 'CI20GBR', 'Cierre lateral S20 Genérico Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-MAT-GEN', 'CI20', 'GEN', 'AL', 'MAT', 'CI20GA', 'Cierre lateral S20 Genérico Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-NEG-GEN', 'CI20', 'GEN', 'AL', 'NEG', 'CI20GB', 'Cierre lateral S20 Genérico Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Udinese
('CI20-BLA-UDI', 'CI20', 'UDI', 'AL', 'BLA', 'CI20UP', 'Cierre lateral S20 Udinese Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-BRO-UDI', 'CI20', 'UDI', 'AL', 'BRO', 'CI20UBR', 'Cierre lateral S20 Udinese Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-MAT-UDI', 'CI20', 'UDI', 'AL', 'MAT', 'CI20UA', 'Cierre lateral S20 Udinese Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI20-NEG-UDI', 'CI20', 'UDI', 'AL', 'NEG', 'CI20UB', 'Cierre lateral S20 Udinese Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cierre lateral Serie 25 - Sin llave (16 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- Fermax
('CI25-BLA-FER', 'CI25', 'FER', 'AL', 'BLA', 'CI25FP', 'Cierre lateral S25 Fermax Blanco', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-BRO-FER', 'CI25', 'FER', 'AL', 'BRO', 'CI25FBR', 'Cierre lateral S25 Fermax Bronce', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-MAT-FER', 'CI25', 'FER', 'AL', 'MAT', 'CI25FA', 'Cierre lateral S25 Fermax Mate', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-NEG-FER', 'CI25', 'FER', 'AL', 'NEG', 'CI25FB', 'Cierre lateral S25 Fermax Negro', 'UND', 14.80, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Genérico
('CI25-BLA-GEN', 'CI25', 'GEN', 'AL', 'BLA', 'CI25GP', 'Cierre lateral S25 Genérico Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-BRO-GEN', 'CI25', 'GEN', 'AL', 'BRO', 'CI25GBR', 'Cierre lateral S25 Genérico Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-MAT-GEN', 'CI25', 'GEN', 'AL', 'MAT', 'CI25GA', 'Cierre lateral S25 Genérico Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-NEG-GEN', 'CI25', 'GEN', 'AL', 'NEG', 'CI25GB', 'Cierre lateral S25 Genérico Negro', 'UND', 32.82, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Udinese
('CI25-BLA-UDI', 'CI25', 'UDI', 'AL', 'BLA', 'CI25UP', 'Cierre lateral S25 Udinese Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-BRO-UDI', 'CI25', 'UDI', 'AL', 'BRO', 'CI25UBR', 'Cierre lateral S25 Udinese Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-MAT-UDI', 'CI25', 'UDI', 'AL', 'MAT', 'CI25UA', 'Cierre lateral S25 Udinese Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI25-NEG-UDI', 'CI25', 'UDI', 'AL', 'NEG', 'CI25UB', 'Cierre lateral S25 Udinese Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cierre lateral Serie 80/62 (8 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- Fermax
('CI8062-BLA-FER', 'CI8062', 'FER', 'AL', 'BLA', 'CI8062FP', 'Cierre lateral S80/62 Fermax Blanco', 'UND', 30.39, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI8062-BRO-FER', 'CI8062', 'FER', 'AL', 'BRO', 'CI8062FBR', 'Cierre lateral S80/62 Fermax Bronce', 'UND', 30.39, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI8062-MAT-FER', 'CI8062', 'FER', 'AL', 'MAT', 'CI8062FA', 'Cierre lateral S80/62 Fermax Mate', 'UND', 30.39, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI8062-NEG-FER', 'CI8062', 'FER', 'AL', 'NEG', 'CI8062FB', 'Cierre lateral S80/62 Fermax Negro', 'UND', 30.39, 'PEN', '2026-02-07', FALSE, 0, 10),
-- HPD
('CI8062-BLA-HPD', 'CI8062', 'HPD', 'AL', 'BLA', 'CI8062HP', 'Cierre lateral S80/62 HPD Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI8062-BRO-HPD', 'CI8062', 'HPD', 'AL', 'BRO', 'CI8062HBR', 'Cierre lateral S80/62 HPD Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI8062-MAT-HPD', 'CI8062', 'HPD', 'AL', 'MAT', 'CI8062HA', 'Cierre lateral S80/62 HPD Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CI8062-NEG-HPD', 'CI8062', 'HPD', 'AL', 'NEG', 'CI8062HB', 'Cierre lateral S80/62 HPD Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cierre lateral con llave Serie 20 (12 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- Fermax
('CILL20-BLA-FER', 'CILL20', 'FER', 'AL', 'BLA', 'CILL20FP', 'Cierre c/llave S20 Fermax Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-BRO-FER', 'CILL20', 'FER', 'AL', 'BRO', 'CILL20FBR', 'Cierre c/llave S20 Fermax Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-MAT-FER', 'CILL20', 'FER', 'AL', 'MAT', 'CILL20FA', 'Cierre c/llave S20 Fermax Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-NEG-FER', 'CILL20', 'FER', 'AL', 'NEG', 'CILL20FB', 'Cierre c/llave S20 Fermax Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Genérico
('CILL20-BLA-GEN', 'CILL20', 'GEN', 'AL', 'BLA', 'CILL20GP', 'Cierre c/llave S20 Genérico Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-BRO-GEN', 'CILL20', 'GEN', 'AL', 'BRO', 'CILL20GBR', 'Cierre c/llave S20 Genérico Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-MAT-GEN', 'CILL20', 'GEN', 'AL', 'MAT', 'CILL20GA', 'Cierre c/llave S20 Genérico Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-NEG-GEN', 'CILL20', 'GEN', 'AL', 'NEG', 'CILL20GB', 'Cierre c/llave S20 Genérico Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Udinese
('CILL20-BLA-UDI', 'CILL20', 'UDI', 'AL', 'BLA', 'CILL20UP', 'Cierre c/llave S20 Udinese Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-BRO-UDI', 'CILL20', 'UDI', 'AL', 'BRO', 'CILL20UBR', 'Cierre c/llave S20 Udinese Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-MAT-UDI', 'CILL20', 'UDI', 'AL', 'MAT', 'CILL20UA', 'Cierre c/llave S20 Udinese Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL20-NEG-UDI', 'CILL20', 'UDI', 'AL', 'NEG', 'CILL20UB', 'Cierre c/llave S20 Udinese Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cierre lateral con llave Serie 25 (12 variantes)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- Fermax
('CILL25-BLA-FER', 'CILL25', 'FER', 'AL', 'BLA', 'CILL25FP', 'Cierre c/llave S25 Fermax Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-BRO-FER', 'CILL25', 'FER', 'AL', 'BRO', 'CILL25FBR', 'Cierre c/llave S25 Fermax Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-MAT-FER', 'CILL25', 'FER', 'AL', 'MAT', 'CILL25FA', 'Cierre c/llave S25 Fermax Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-NEG-FER', 'CILL25', 'FER', 'AL', 'NEG', 'CILL25FB', 'Cierre c/llave S25 Fermax Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Genérico
('CILL25-BLA-GEN', 'CILL25', 'GEN', 'AL', 'BLA', 'CILL25GP', 'Cierre c/llave S25 Genérico Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-BRO-GEN', 'CILL25', 'GEN', 'AL', 'BRO', 'CILL25GBR', 'Cierre c/llave S25 Genérico Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-MAT-GEN', 'CILL25', 'GEN', 'AL', 'MAT', 'CILL25GA', 'Cierre c/llave S25 Genérico Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-NEG-GEN', 'CILL25', 'GEN', 'AL', 'NEG', 'CILL25GB', 'Cierre c/llave S25 Genérico Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
-- Udinese
('CILL25-BLA-UDI', 'CILL25', 'UDI', 'AL', 'BLA', 'CILL25UP', 'Cierre c/llave S25 Udinese Blanco', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-BRO-UDI', 'CILL25', 'UDI', 'AL', 'BRO', 'CILL25UBR', 'Cierre c/llave S25 Udinese Bronce', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-MAT-UDI', 'CILL25', 'UDI', 'AL', 'MAT', 'CILL25UA', 'Cierre c/llave S25 Udinese Mate', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10),
('CILL25-NEG-UDI', 'CILL25', 'UDI', 'AL', 'NEG', 'CILL25UB', 'Cierre c/llave S25 Udinese Negro', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- VARIANTES: Cierre MPI (1 variante)
-- ============================================================================
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CIMPI-GEN', 'CIMPI', 'GEN', 'AL', 'MAT', 'CIMPI', 'Cierre MPI', 'UND', 0.00, 'PEN', '2026-02-07', FALSE, 0, 10)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- ============================================================================
-- RESUMEN PARTE 3:
-- Plantillas: 14
-- Variantes: 87
-- ============================================================================
