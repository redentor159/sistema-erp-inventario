-- INSERTAR VARIANTES DE CRISTALES - PARTE 4 (TEM6)
-- Fecha: 2026-02-07

-- TEM6 - Cristal Templado 6mm (11 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('CR-TEM6-BRO-GEN', 'TEM6', 'GEN', 'CR', 'BRO', 'TEM6BR', 'Cristal Templado 6mm Bronce', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-GRI-GEN', 'TEM6', 'GEN', 'CR', 'GRI', 'TEM6G', 'Cristal Templado 6mm Gris', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-INC-GEN', 'TEM6', 'GEN', 'CR', 'INC', 'TEM6I', 'Cristal Templado 6mm Incoloro', 'M2', 10.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-UCL-GEN', 'TEM6', 'GEN', 'CR', 'UCL', 'TEM6UC', 'Cristal Templado 6mm Ultra Claro', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-ACI-GEN', 'TEM6', 'GEN', 'CR', 'ACI', 'TEM6ACI', 'Cristal Templado 6mm al Ácido', 'M2', 22.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-SBR-GEN', 'TEM6', 'GEN', 'CR', 'SBR', 'TEM6SB', 'Cristal Templado 6mm Stopsol Bronce', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-SDA-GEN', 'TEM6', 'GEN', 'CR', 'SDA', 'TEM6SD', 'Cristal Templado 6mm Stopsol Dark Blue', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-SGR-GEN', 'TEM6', 'GEN', 'CR', 'SGR', 'TEM6SG', 'Cristal Templado 6mm Stopsol Gris', 'M2', 31.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-SIN-GEN', 'TEM6', 'GEN', 'CR', 'SIN', 'TEM6SI', 'Cristal Templado 6mm Stopsol Incoloro', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-SPR-GEN', 'TEM6', 'GEN', 'CR', 'SPR', 'TEM6SP', 'Cristal Templado 6mm Stopsol Priva Blue', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0),
('CR-TEM6-SVE-GEN', 'TEM6', 'GEN', 'CR', 'SVE', 'TEM6SV', 'Cristal Templado 6mm Stopsol Verde', 'M2', 0.00, 'PEN', '2026-02-07', TRUE, 6, 0)
ON CONFLICT (id_sku) DO UPDATE SET costo_mercado_unit = EXCLUDED.costo_mercado_unit, fecha_act_precio = EXCLUDED.fecha_act_precio;
