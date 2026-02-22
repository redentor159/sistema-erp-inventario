-- DATA SEEDING SCRIPT
-- Run this in Supabase SQL Editor to populate your catalog with sample data

-- 1. Maestros (Master Data)
INSERT INTO mst_familias (id_familia, nombre_familia) VALUES 
('FAM_ALU', 'Perfiles de Aluminio'),
('FAM_VID', 'Vidrios y Cristales'),
('FAM_ACC', 'Accesorios'),
('FAM_HER', 'Herrajes')
ON CONFLICT DO NOTHING;

INSERT INTO mst_marcas (id_marca, nombre_marca, pais_origen) VALUES
('MAR_LIM', 'Corporación Limatambo', 'Peru'),
('MAR_FUR', 'Furukawa', 'Japon'),
('MAR_MIY', 'Miyasato', 'Peru'),
('MAR_GEN', 'Genérico', 'Varios')
ON CONFLICT DO NOTHING;

INSERT INTO mst_materiales (id_material, nombre_material) VALUES
('MAT_ALU_6063', 'Aluminio 6063'),
('MAT_VID_TEM', 'Vidrio Templado'),
('MAT_ACERO', 'Acero Inoxidable'),
('MAT_GOMA', 'Goma / EPDM')
ON CONFLICT DO NOTHING;

INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado) VALUES
('ACAB_NAT', 'Natural / Mate'),
('ACAB_NEG', 'Negro Anodizado'),
('ACAB_BLA', 'Blanco Pintura'),
('ACAB_INC', 'Incoloro (Transparente)')
ON CONFLICT DO NOTHING;

INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial) VALUES
('SIS_MOD', 'Serie Modena'),
('SIS_20', 'Serie 20'),
('SIS_25', 'Serie 25'),
('SIS_42', 'Serie 42')
ON CONFLICT DO NOTHING;

INSERT INTO mst_config_general (id_config, margen_ganancia_default, igv, markup_cotizaciones_default, costo_mo_m2_default, tipo_cambio_referencial, texto_condiciones_base) VALUES
('CONFIG_MAIN', 0.35, 0.18, 0.40, 25.00, 3.80, 'Entrega 15 días hábiles. 50% adelanto.')
ON CONFLICT DO NOTHING;

-- 2. Plantillas (Templates)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm) VALUES
('PLT_RIEL_SUP', 'Riel Superior Corrediza', 'FAM_ALU', 'SIS_20', 6000),
('PLT_JAMBA', 'Jamba Lateral', 'FAM_ALU', 'SIS_20', 6000),
('PLT_VID_6MM', 'Vidrio Crudo 6mm', 'FAM_VID', NULL, NULL),
('PLT_RODA_SIMPLE', 'Rodamiento Simple', 'FAM_ACC', 'SIS_20', NULL)
ON CONFLICT DO NOTHING;

-- 3. Productos SKU (The Real Items)
INSERT INTO cat_productos_variantes (
    id_sku, id_plantilla, id_marca, id_material, id_acabado,
    cod_proveedor, nombre_completo, unidad_medida, 
    costo_mercado_unit, moneda_reposicion, es_templado
) VALUES
('ALU-20-RIEL-NAT', 'PLT_RIEL_SUP', 'MAR_LIM', 'MAT_ALU_6063', 'ACAB_NAT', 'LIM-1001', 'Perfil Riel Superior S20 Natural x 6m', 'UND', 45.00, 'PEN', FALSE),
('ALU-20-RIEL-NEG', 'PLT_RIEL_SUP', 'MAR_LIM', 'MAT_ALU_6063', 'ACAB_NEG', 'LIM-1002', 'Perfil Riel Superior S20 Negro x 6m', 'UND', 52.00, 'PEN', FALSE),
('ALU-20-JAMB-NAT', 'PLT_JAMBA', 'MAR_LIM', 'MAT_ALU_6063', 'ACAB_NAT', 'LIM-2001', 'Perfil Jamba S20 Natural x 6m', 'UND', 38.00, 'PEN', FALSE),
('VID-6MM-INC', 'PLT_VID_6MM', 'MAR_MIY', 'MAT_VID_TEM', 'ACAB_INC', 'MIY-600', 'Plancha Vidrio 6mm Incoloro (3.30x2.14)', 'M2', 65.00, 'USD', FALSE),
('ACC-ROD-S20', 'PLT_RODA_SIMPLE', 'MAR_GEN', 'MAT_ACERO', 'ACAB_NAT', 'ROD-001', 'Rodamiento Simple S20 (Par)', 'PAR', 12.00, 'PEN', FALSE)
ON CONFLICT DO NOTHING;

-- 4. Initial Stock (Movimientos)
-- Let's give them some stock to see colors
INSERT INTO trx_movimientos (tipo_movimiento, id_sku, cantidad, costo_total_pen, id_almacen) VALUES
-- Positive Stock (Green)
('COMPRA', 'ALU-20-RIEL-NAT', 20, 900.00, 'PRINCIPAL'),
('COMPRA', 'ALU-20-JAMB-NAT', 50, 1900.00, 'PRINCIPAL'),
-- Negative Stock (Red / Quiebre) - e.g. sold before entry registered
('VENTA', 'ALU-20-RIEL-NEG', -5, -260.00, 'PRINCIPAL'), 
-- Zero Stock
('COMPRA', 'VID-6MM-INC', 10, 2470.00, 'PRINCIPAL'), -- 10 * 65 * 3.8
('VENTA', 'VID-6MM-INC', -10, -2470.00, 'PRINCIPAL');

-- Refresh the view logic implicitly by querying it
-- (No command needed, view is dynamic)
