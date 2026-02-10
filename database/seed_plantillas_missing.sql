-- FIX: SEED MISSING TEMPLATES FOR RECIPES
-- The recipes reference template IDs that don't exist in CAT_PLANTILLAS.
-- This script populates them with generic names to satisfy the Foreign Key constraint.

-- 1. Ensure Dependencies (Family, System) exist
INSERT INTO mst_familias (id_familia, nombre_familia) VALUES 
('GEN', 'Familia Generica'),
('PERF', 'Perfiles de Aluminio'),
('ACC', 'Accesorios'),
('VID', 'Vidrios')
ON CONFLICT DO NOTHING;

INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial) VALUES 
('SIS_GEN', 'Sistema Generico'),
('SIS_20', 'Serie 20'),
('SIS_25', 'Serie 25'),
('SIS_3825', 'Serie 3825'),
('SIS_42', 'Serie 42'),
('SIS_80', 'Serie 80 Europa'),
('SIS_62', 'Serie 62')
ON CONFLICT DO NOTHING;

-- 2. Insert Missing Plantillas
-- We use ON CONFLICT DO NOTHING to avoid errors if some already exist.
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm) VALUES 
-- SOBRELUZ
('5230',   'Tv Tubo Sobreluz', 'PERF', 'SIS_25', 6000),
('7001',   'Tv Hoja Sobreluz', 'PERF', 'SIS_25', 6000),
('7003',   'Tv Junquillo',     'PERF', 'SIS_25', 6000),
('7955',   'Tv Perfil U',      'PERF', 'SIS_25', 6000),
('3004',   'Tv Perfil H',      'PERF', 'SIS_25', 6000),
('SISOBR', 'Silicona Sobreluz', 'ACC', 'SIS_GEN', NULL),

-- SERIE 25
('2501',   'S25 Marco Sup',    'PERF', 'SIS_25', 6000),
('2502',   'S25 Marco Inf',    'PERF', 'SIS_25', 6000),
('2509',   'S25 Jamba',        'PERF', 'SIS_25', 6000),
('2504',   'S25 Zocalo Sup',   'PERF', 'SIS_25', 6000),
('2505',   'S25 Zocalo Inf',   'PERF', 'SIS_25', 6000),
('2507',   'S25 Enganche',     'PERF', 'SIS_25', 6000),
('2510',   'S25 Parante',      'PERF', 'SIS_25', 6000),
('2521',   'S25 Adaptador',    'PERF', 'SIS_25', 6000),
('CI25F',  'Cierre Lateral',   'ACC', 'SIS_25', NULL),
('GA25D',  'Garrucha Doble',   'ACC', 'SIS_25', NULL),
('GUSI25', 'Guia S25',         'ACC', 'SIS_25', NULL),
('T25',    'Tornillo S25',     'ACC', 'SIS_25', NULL),
('S25',    'Silicona Gen',     'ACC', 'SIS_GEN', NULL),
('FESYB',  'Felpa Systral',    'ACC', 'SIS_GEN', NULL),
('E+F',    'Emb+Flete',        'GEN', 'SIS_GEN', NULL),
('TA14',   'Tarugo',           'ACC', 'SIS_GEN', NULL),
('ACCM2',  'Accesorios M2',    'ACC', 'SIS_GEN', NULL),
('CHPLR',  'Pico Loro',        'ACC', 'SIS_25', NULL),
('JASIM',  'Jalador Simple',   'ACC', 'SIS_GEN', NULL),

-- SERIE 20
('2001',   'S20 Riel Sup',     'PERF', 'SIS_20', 6000),
('2002',   'S20 Riel Inf',     'PERF', 'SIS_20', 6000),
('2009',   'S20 Jamba',        'PERF', 'SIS_20', 6000),
('2004',   'S20 Zocalo Sup',   'PERF', 'SIS_20', 6000),
('2005',   'S20 Zocalo Inf',   'PERF', 'SIS_20', 6000),
('2011',   'S20 Pierna',       'PERF', 'SIS_20', 6000),
('2010',   'S20 Traslapo',     'PERF', 'SIS_20', 6000),
('2021',   'S20 Adaptador',    'PERF', 'SIS_20', 6000),
('GA20',   'S20 Garrucha',     'ACC', 'SIS_20', NULL),
('GUS20',  'S20 Guia',         'ACC', 'SIS_20', NULL),

-- SERIE 3825 / 3131
('2621',   'S3825 Riel Sup',   'PERF', 'SIS_3825', 6000),
('2620',   'S3825 Riel Inf',   'PERF', 'SIS_3825', 6000),
('2628',   'S3825 Jamba',      'PERF', 'SIS_3825', 6000),
('2624',   'S3825 Zocalo',     'PERF', 'SIS_3825', 6000),
('2623',   'S3825 Pierna',     'PERF', 'SIS_3825', 6000),
('2622',   'S3825 Traslapo',   'PERF', 'SIS_3825', 6000),
('SEC3825','Seguro Caracol',   'ACC', 'SIS_3825', NULL),
('GA3825', 'Garrucha 3825',    'ACC', 'SIS_3825', NULL),
('GUI3825','Guia Inf 3825',    'ACC', 'SIS_3825', NULL),
('GUS3825','Guia Sup 3825',    'ACC', 'SIS_3825', NULL),
('T3825',  'Tornillo 3825',    'ACC', 'SIS_3825', NULL),
('SI3825', 'Silicona 3825',    'ACC', 'SIS_3825', NULL),
('VCO3103','S31 Riel Sup',     'PERF', 'SIS_3825', 6000),
('VCO3101','S31 Riel Inf',     'PERF', 'SIS_3825', 6000),
('VCO3105','S31 Jamba',        'PERF', 'SIS_3825', 6000),
('VCO3107','S31 Zocalo',       'PERF', 'SIS_3825', 6000),
('VCO3113','S31 Pierna',       'PERF', 'SIS_3825', 6000),
('VCO3109','S31 Traslapo',     'PERF', 'SIS_3825', 6000),
('GA3131', 'Garrucha 3131',    'ACC', 'SIS_3825', NULL),
('GU31',   'Guia 3131',        'ACC', 'SIS_3825', NULL),

-- SERIE 42 / 3831
('4209',   'S42 Marco',        'PERF', 'SIS_42', 6000),
('4202',   'S42 Hoja',         'PERF', 'SIS_42', 6000),
('4203',   'S42 Junquillo',    'PERF', 'SIS_42', 6000),
('BRA25F', 'Brazo Proy',       'ACC', 'SIS_42', NULL),
('MA3831', 'Manija',           'ACC', 'SIS_42', NULL),
('BUDCB',  'Burlete',          'ACC', 'SIS_42', NULL),
('T42',    'Tornillo 42',      'ACC', 'SIS_42', NULL),
('SI42',   'Silicona 42',      'ACC', 'SIS_42', NULL),
('173',    'S38 Marco',        'PERF', 'SIS_42', 6000),
('176',    'S38 Hoja',         'PERF', 'SIS_42', 6000),
('177',    'S38 Junquillo',    'PERF', 'SIS_42', 6000),

-- SERIE 80 / 62
('80501',  'S80 Marco',        'PERF', 'SIS_80', 6000),
('80502',  'S80 Marco 3R',     'PERF', 'SIS_80', 6000),
('80503',  'S80 Hoja',         'PERF', 'SIS_80', 6000),
('80505',  'S80 Traslapo',     'PERF', 'SIS_80', 6000),
('80506',  'S80 Encuentro',    'PERF', 'SIS_80', 6000),
('CR60',   'Cierre CR60',      'ACC', 'SIS_80', NULL),
('CI8062', 'Cierre Lat 80',    'ACC', 'SIS_80', NULL),
('GA80',   'Garrucha 80',      'ACC', 'SIS_80', NULL),
('EPRS80', 'Esq Precision',    'ACC', 'SIS_80', NULL),
('EALS80', 'Esq Alineam',      'ACC', 'SIS_80', NULL),
('EENS80', 'Esq Ensamble',     'ACC', 'SIS_80', NULL),
('GU80',   'Guia 80',          'ACC', 'SIS_80', NULL),
('SI80',   'Silicona 80',      'ACC', 'SIS_80', NULL),
('62701',  'S62 Marco',        'PERF', 'SIS_62', 6000),
('62703',  'S62 Hoja',         'PERF', 'SIS_62', 6000),
('62705',  'S62 Traslapo',     'PERF', 'SIS_62', 6000),
('62506',  'S62 Encuentro',    'PERF', 'SIS_62', 6000),
('FE80',   'Felpa 80',         'ACC', 'SIS_62', NULL),
('DESCONOCIDO', 'Perfil Desconocido', 'PERF', 'SIS_GEN', 6000)

ON CONFLICT DO NOTHING;
