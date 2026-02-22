-- INSERTAR PLANTILLAS DE CRISTALES (11 registros)
-- Fecha: 2026-02-07

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('CAT3', 'Cristal Catedral 3mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('CRU3', 'Cristal Crudo 3mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('CRU4', 'Cristal Crudo 4mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('CRU5', 'Cristal Crudo 5.5mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('CRU8', 'Cristal Crudo 8mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('LM6', 'Cristal Laminado 6mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('LM8', 'Cristal Laminado 8mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('LM10', 'Cristal Laminado 10mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('TEM6', 'Cristal Templado 6mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('TEM8', 'Cristal Templado 8mm', 'CRIS', 'SYS_GEN', NULL, 0.00),
('TEM10', 'Cristal Templado 10mm', 'CRIS', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;
