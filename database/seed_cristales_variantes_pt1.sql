-- INSERTAR VARIANTES DE CRISTALES - PARTE 1 (CAT3, CRU3, CRU4)
-- Fecha: 2026-02-07

-- CAT3 - Cristal Catedral 3mm (3 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-CAT3-BFL-GEN', 'CAT3', 'GEN', 'CR', 'BFL', 'CAT3BO', 'Cristal Catedral 3mm Botón', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CAT3-CUA-GEN', 'CAT3', 'GEN', 'CR', 'CUA', 'CAT3CUA', 'Cristal Catedral 3mm Cuadriculado', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CAT3-LLO-GEN', 'CAT3', 'GEN', 'CR', 'LLO', 'CAT3LL', 'Cristal Catedral 3mm Llovizna', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- CRU3 - Cristal Crudo 3mm (7 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-CRU3-ACI-GEN', 'CRU3', 'GEN', 'CR', 'ACI', 'CRU3ACI', 'Cristal Crudo 3mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CRU3-BRO-GEN', 'CRU3', 'GEN', 'CR', 'BRO', 'CRU3BR', 'Cristal Crudo 3mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CRU3-GRI-GEN', 'CRU3', 'GEN', 'CR', 'GRI', 'CRU3G', 'Cristal Crudo 3mm Gris', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CRU3-INC-GEN', 'CRU3', 'GEN', 'CR', 'INC', 'CRU3I', 'Cristal Crudo 3mm Incoloro', 'M2', 160.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CRU3-RAZ-GEN', 'CRU3', 'GEN', 'CR', 'RAZ', 'CRU3RA', 'Cristal Crudo 3mm Reflectante Azul', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CRU3-RBR-GEN', 'CRU3', 'GEN', 'CR', 'RBR', 'CRU3RB', 'Cristal Crudo 3mm Reflectante Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0),
('CR-CRU3-RPA-GEN', 'CRU3', 'GEN', 'CR', 'RPA', 'CRU3RP', 'Cristal Crudo 3mm Reflectante Papiro', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 3, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- CRU4 - Cristal Crudo 4mm (7 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-CRU4-ACI-GEN', 'CRU4', 'GEN', 'CR', 'ACI', 'CRU4ACI', 'Cristal Crudo 4mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 4, 0),
('CR-CRU4-BRO-GEN', 'CRU4', 'GEN', 'CR', 'BRO', 'CRU4BR', 'Cristal Crudo 4mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 4, 0),
('CR-CRU4-GRI-GEN', 'CRU4', 'GEN', 'CR', 'GRI', 'CRU4G', 'Cristal Crudo 4mm Gris', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 4, 0),
('CR-CRU4-INC-GEN', 'CRU4', 'GEN', 'CR', 'INC', 'CRU4I', 'Cristal Crudo 4mm Incoloro', 'M2', 22.00, 'PEN', '2026-02-07', FALSE, 4, 0),
('CR-CRU4-RAZ-GEN', 'CRU4', 'GEN', 'CR', 'RAZ', 'CRU4RA', 'Cristal Crudo 4mm Reflectante Azul', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 4, 0),
('CR-CRU4-RBR-GEN', 'CRU4', 'GEN', 'CR', 'RBR', 'CRU4RB', 'Cristal Crudo 4mm Reflectante Bronce', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 4, 0),
('CR-CRU4-RPA-GEN', 'CRU4', 'GEN', 'CR', 'RPA', 'CRU4RP', 'Cristal Crudo 4mm Reflectante Papiro', 'M2', 0.00, 'PEN', '2026-02-07', FALSE, 4, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;
