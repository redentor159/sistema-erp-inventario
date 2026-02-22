-- INSERTAR VARIANTES DE CRISTALES - PARTE 3 (LM6, LM8, LM10)
-- Fecha: 2026-02-07

-- LM6 - Cristal Laminado 6mm (4 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-LM6-ACI-GEN', 'LM6', 'GEN', 'CR', 'ACI', 'LM6ACI', 'Cristal Laminado 6mm al Ácido', 'M2', 61.00, 'PEN', '2026-02-07', FALSE, 6, 0),
('CR-LM6-BRO-GEN', 'LM6', 'GEN', 'CR', 'BRO', 'LM6BR', 'Cristal Laminado 6mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 6, 0),
('CR-LM6-GRI-GEN', 'LM6', 'GEN', 'CR', 'GRI', 'LM6G', 'Cristal Laminado 6mm Gris', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 6, 0),
('CR-LM6-INC-GEN', 'LM6', 'GEN', 'CR', 'INC', 'LM6I', 'Cristal Laminado 6mm Incoloro', 'M2', 42.00, 'PEN', '2026-02-07', FALSE, 6, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- LM8 - Cristal Laminado 8mm (4 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-LM8-ACI-GEN', 'LM8', 'GEN', 'CR', 'ACI', 'LM8ACI', 'Cristal Laminado 8mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-LM8-BRO-GEN', 'LM8', 'GEN', 'CR', 'BRO', 'LM8BR', 'Cristal Laminado 8mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-LM8-GRI-GEN', 'LM8', 'GEN', 'CR', 'GRI', 'LM8G', 'Cristal Laminado 8mm Gris', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-LM8-INC-GEN', 'LM8', 'GEN', 'CR', 'INC', 'LM8I', 'Cristal Laminado 8mm Incoloro', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- LM10 - Cristal Laminado 10mm (4 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-LM10-ACI-GEN', 'LM10', 'GEN', 'CR', 'ACI', 'LM10ACI', 'Cristal Laminado 10mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 10, 0),
('CR-LM10-BRO-GEN', 'LM10', 'GEN', 'CR', 'BRO', 'LM10BR', 'Cristal Laminado 10mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 10, 0),
('CR-LM10-GRI-GEN', 'LM10', 'GEN', 'CR', 'GRI', 'LM10G', 'Cristal Laminado 10mm Gris', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 10, 0),
('CR-LM10-INC-GEN', 'LM10', 'GEN', 'CR', 'INC', 'LM10I', 'Cristal Laminado 10mm Incoloro', 'M2', 80.00, 'PEN', '2026-02-07', FALSE, 10, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;
