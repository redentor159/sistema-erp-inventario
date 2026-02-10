-- INSERTAR VARIANTES DE CRISTALES - PARTE 5 (TEM8, TEM10)
-- Fecha: 2026-02-07

-- TEM8 - Cristal Templado 8mm (11 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-TEM8-BRO-GEN', 'TEM8', 'GEN', 'CR', 'BRO', 'TEM8BR', 'Cristal Templado 8mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-GRI-GEN', 'TEM8', 'GEN', 'CR', 'GRI', 'TEM8G', 'Cristal Templado 8mm Gris', 'M2', 18.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-INC-GEN', 'TEM8', 'GEN', 'CR', 'INC', 'TEM8I', 'Cristal Templado 8mm Incoloro', 'M2', 14.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-UCL-GEN', 'TEM8', 'GEN', 'CR', 'UCL', 'TEM8UC', 'Cristal Templado 8mm Ultra Claro', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-ACI-GEN', 'TEM8', 'GEN', 'CR', 'ACI', 'TEM8ACI', 'Cristal Templado 8mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-SBR-GEN', 'TEM8', 'GEN', 'CR', 'SBR', 'TEM8SB', 'Cristal Templado 8mm Stopsol Bronce', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-SDA-GEN', 'TEM8', 'GEN', 'CR', 'SDA', 'TEM8SD', 'Cristal Templado 8mm Stopsol Dark Blue', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-SGR-GEN', 'TEM8', 'GEN', 'CR', 'SGR', 'TEM8SG', 'Cristal Templado 8mm Stopsol Gris', 'M2', 37.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-SIN-GEN', 'TEM8', 'GEN', 'CR', 'SIN', 'TEM8SI', 'Cristal Templado 8mm Stopsol Incoloro', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-SPR-GEN', 'TEM8', 'GEN', 'CR', 'SPR', 'TEM8SP', 'Cristal Templado 8mm Stopsol Priva Blue', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0),
('CR-TEM8-SVE-GEN', 'TEM8', 'GEN', 'CR', 'SVE', 'TEM8SV', 'Cristal Templado 8mm Stopsol Verde', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 8, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;

-- TEM10 - Cristal Templado 10mm (5 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-TEM10-BRO-GEN', 'TEM10', 'GEN', 'CR', 'BRO', 'TEM10BR', 'Cristal Templado 10mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 10, 0),
('CR-TEM10-GRI-GEN', 'TEM10', 'GEN', 'CR', 'GRI', 'TEM10G', 'Cristal Templado 10mm Gris', 'M2', 21.00, 'PEN', '2026-02-07', TRUE, 10, 0),
('CR-TEM10-INC-GEN', 'TEM10', 'GEN', 'CR', 'INC', 'TEM10I', 'Cristal Templado 10mm Incoloro', 'M2', 18.00, 'PEN', '2026-02-07', TRUE, 10, 0),
('CR-TEM10-UCL-GEN', 'TEM10', 'GEN', 'CR', 'UCL', 'TEM10UC', 'Cristal Templado 10mm Ultra Claro', 'M2', 18.00, 'PEN', '2026-02-07', TRUE, 10, 0),
('CR-TEM10-ACI-GEN', 'TEM10', 'GEN', 'CR', 'ACI', 'TEM10ACI', 'Cristal Templado 10mm al Ácido', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 10, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;
