-- INSERTAR VARIANTES DE CRISTALES - PARTE 2 (CRU5, CRU8)
-- Fecha: 2026-02-07

-- CRU5 - Cristal Crudo 5.5mm (7 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-CRU5-ACI-GEN', 'CRU5', 'GEN', 'CR', 'ACI', 'CRU5ACI', 'Cristal Crudo 5.5mm al Ácido', 'M2', 221.00, 'PEN', '2026-02-07', FALSE, 5.5, 0),
('CR-CRU5-BRO-GEN', 'CRU5', 'GEN', 'CR', 'BRO', 'CRU5BR', 'Cristal Crudo 5.5mm Bronce', 'M2', 34.00, 'PEN', '2026-02-07', FALSE, 5.5, 0),
('CR-CRU5-GRI-GEN', 'CRU5', 'GEN', 'CR', 'GRI', 'CRU5G', 'Cristal Crudo 5.5mm Gris', 'M2', 35.00, 'PEN', '2026-02-07', FALSE, 5.5, 0),
('CR-CRU5-INC-GEN', 'CRU5', 'GEN', 'CR', 'INC', 'CRU5I', 'Cristal Crudo 5.5mm Incoloro', 'M2', 30.00, 'PEN', '2026-02-07', FALSE, 5.5, 0),
('CR-CRU5-RAZ-GEN', 'CRU5', 'GEN', 'CR', 'RAZ', 'CRU5RA', 'Cristal Crudo 5.5mm Reflectante Azul', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 5.5, 0),
('CR-CRU5-RBR-GEN', 'CRU5', 'GEN', 'CR', 'RBR', 'CRU5RB', 'Cristal Crudo 5.5mm Reflectante Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 5.5, 0),
('CR-CRU5-RPA-GEN', 'CRU5', 'GEN', 'CR', 'RPA', 'CRU5RP', 'Cristal Crudo 5.5mm Reflectante Papiro', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 5.5, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- CRU8 - Cristal Crudo 8mm (7 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-CRU8-ACI-GEN', 'CRU8', 'GEN', 'CR', 'ACI', 'CRU8ACI', 'Cristal Crudo 8mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-CRU8-BRO-GEN', 'CRU8', 'GEN', 'CR', 'BRO', 'CRU8BR', 'Cristal Crudo 8mm Bronce', 'M2', 51.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-CRU8-GRI-GEN', 'CRU8', 'GEN', 'CR', 'GRI', 'CRU8G', 'Cristal Crudo 8mm Gris', 'M2', 51.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-CRU8-INC-GEN', 'CRU8', 'GEN', 'CR', 'INC', 'CRU8I', 'Cristal Crudo 8mm Incoloro', 'M2', 49.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-CRU8-RAZ-GEN', 'CRU8', 'GEN', 'CR', 'RAZ', 'CRU8RA', 'Cristal Crudo 8mm Reflectante Azul', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-CRU8-RBR-GEN', 'CRU8', 'GEN', 'CR', 'RBR', 'CRU8RB', 'Cristal Crudo 8mm Reflectante Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0),
('CR-CRU8-RPA-GEN', 'CRU8', 'GEN', 'CR', 'RPA', 'CRU8RP', 'Cristal Crudo 8mm Reflectante Papiro', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 8, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;
