-- SEED: REAL MASTER DATA (MARCAS & ACABADOS)
-- Data provided by user

-- 1. MST_MARCAS
INSERT INTO mst_marcas (id_marca, nombre_marca, pais_origen) VALUES 
('COR', 'Corrales', 'Perú'),
('EDU', 'Eduholding', 'Perú'),
('HPD', 'HPD', 'Estados Unidos'),
('LIM', 'Limatambo', 'Perú'),
('DOR', 'Doretti', 'Italia'),
('TEM', 'Templex', 'Perú'),
('GEN', 'Genérico', 'China'),
('FER', 'Fermax', 'Brasil'),
('UDI', 'Udinese', 'Brasil')
ON CONFLICT (id_marca) DO UPDATE SET 
    nombre_marca = EXCLUDED.nombre_marca,
    pais_origen = EXCLUDED.pais_origen;

-- 2. MST_ACABADOS_COLORES
INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado, sufijo_sku) VALUES 
('NEG', 'Negro', 'B'),
('MAT', 'Mate / Natural', 'A'),
('CHA', 'Champagne', 'C'),
('MAD', 'Madera', 'M'),
('PUL', 'Pulido Brillante', 'PU'),
('SAT', 'Satinado', 'ST'),
('BLA', 'Blanco Pintura', 'P'),
('BRO', 'Bronce', 'BR'),
('INC', 'Incoloro', 'I'),
('GRI', 'Gris', 'G'),
('UCL', 'Ultra claro', 'UC'),
('ACI', 'Al acido / Pavonado', 'AC'),
('RAZ', 'Reflectante Azul', 'RA'),
('RPA', 'Reflectante Papiro', 'RP'),
('RBR', 'Reflectante Bronce', 'RB'),
('BFL', 'Botón Flora', 'BO'),
('LLO', 'Llovizna', 'LL'),
('SBR', 'Stopsol Bronce', 'SBR'),
('SDA', 'Stopsol Dark Blue', 'SDA'),
('SGR', 'Stopsol Gris', 'SGR'),
('SIN', 'Stopsol Incoloro', 'SIN'),
('SPR', 'Stopsol Priva Blue', 'SPR'),
('SVE', 'Stopsol Verde', 'SVE')
ON CONFLICT (id_acabado) DO UPDATE SET 
    nombre_acabado = EXCLUDED.nombre_acabado,
    sufijo_sku = EXCLUDED.sufijo_sku;
