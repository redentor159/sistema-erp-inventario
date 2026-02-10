-- =================================================================================================
-- SEED DATA: RECETAS DE INGENIERÍA - PARTE 3 (SISTEMAS 3831, 42, 62, 80, GEN)
-- Fecha: 2026-02-07
-- =================================================================================================

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, id_sistema, id_plantilla, id_material_receta, id_acabado_receta, id_marca_receta, nombre_componente, tipo, cantidad_base, factor_cantidad_ancho, factor_cantidad_alto, factor_cantidad_area, factor_corte_ancho, factor_corte_alto, constante_corte_mm, angulo, condicion) VALUES
-- Sistema 3831 - 1 Hoja Proyectante
('S3831_1H-173-108', 'S3831_1H', 'SYS_3831', '173', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 1, 0, 0, 45, 'BASE'),
('S3831_1H-173-109', 'S3831_1H', 'SYS_3831', '173', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 45, 'BASE'),
('S3831_1H-176-110', 'S3831_1H', 'SYS_3831', '176', 'AL', NULL, NULL, 'Hoja', 'Perfil', 2, 0, 0, 0, 1, 0, -22, 45, 'BASE'),
('S3831_1H-176-111', 'S3831_1H', 'SYS_3831', '176', 'AL', NULL, NULL, 'Hoja', 'Perfil', 2, 0, 0, 0, 0, 1, -22, 45, 'BASE'),
('S3831_1H-177-112', 'S3831_1H', 'SYS_3831', '177', 'AL', NULL, NULL, 'Junquillo', 'Perfil', 2, 0, 0, 0, 1, 0, -81, 90, 'BASE'),
('S3831_1H-177-113', 'S3831_1H', 'SYS_3831', '177', 'AL', NULL, NULL, 'Junquillo', 'Perfil', 2, 0, 0, 0, 0, 1, -81, 45, 'BASE'),
('S3831_1H-BRA25F-114', 'S3831_1H', 'SYS_3831', 'BRA25F', 'GEN', NULL, NULL, 'Brazo', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3831_1H-BUDCB-116', 'S3831_1H', 'SYS_3831', 'BUDCB', 'GEN', NULL, NULL, 'Burlete', 'Accesorio', 0, 0.004, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S3831_1H-MA3831-115', 'S3831_1H', 'SYS_3831', 'MA3831', 'GEN', NULL, NULL, 'Manija', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3831_1H-SI42-118', 'S3831_1H', 'SYS_3831', 'SI42', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.002, 0, 0, 0, 0, 0, 'BASE'),
('S3831_1H-T42-117', 'S3831_1H', 'SYS_3831', 'T42', 'GEN', NULL, NULL, 'Tornillo', 'Accesorio', 5, 0, 0, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 42 - 1 Hoja Proyectante
('S42_1H-4209-96', 'S42_1H', 'SYS_42', '4209', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 1, 0, 0, 45, 'BASE'),
('S42_1H-4209-97', 'S42_1H', 'SYS_42', '4209', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 45, 'BASE'),
('S42_1H-4202-98', 'S42_1H', 'SYS_42', '4202', 'AL', NULL, NULL, 'Hoja', 'Perfil', 2, 0, 0, 0, 1, 0, -18, 45, 'BASE'),
('S42_1H-4202-99', 'S42_1H', 'SYS_42', '4202', 'AL', NULL, NULL, 'Hoja', 'Perfil', 2, 0, 0, 0, 0, 1, -18, 45, 'BASE'),
('S42_1H-4203-100', 'S42_1H', 'SYS_42', '4203', 'AL', NULL, NULL, 'Junquillo', 'Perfil', 2, 0, 0, 0, 1, 0, -90, 90, 'BASE'),
('S42_1H-4203-101', 'S42_1H', 'SYS_42', '4203', 'AL', NULL, NULL, 'Junquillo', 'Perfil', 2, 0, 0, 0, 0, 1, -90, 45, 'BASE'),
('S42_1H-BRA25F-102', 'S42_1H', 'SYS_42', 'BRA25F', 'GEN', NULL, NULL, 'Brazo', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S42_1H-BUDCB-104', 'S42_1H', 'SYS_42', 'BUDCB', 'GEN', NULL, NULL, 'Burlete', 'Accesorio', 0, 0.004, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S42_1H-MA3831-103', 'S42_1H', 'SYS_42', 'MA3831', 'GEN', NULL, NULL, 'Manija', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S42_1H-SI42-106', 'S42_1H', 'SYS_42', 'SI42', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.002, 0, 0, 0, 0, 0, 'BASE'),
('S42_1H-T42-105', 'S42_1H', 'SYS_42', 'T42', 'GEN', NULL, NULL, 'Tornillo', 'Accesorio', 6, 0, 0, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 62 - 2 Hojas
('S62_2H-62701-156', 'S62_2H', 'SYS_62', '62701', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 1, 0, 0, 45, 'BASE'),
('S62_2H-62701-157', 'S62_2H', 'SYS_62', '62701', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 45, 'BASE'),
('S62_2H-62703-158', 'S62_2H', 'SYS_62', '62703', 'AL', NULL, NULL, 'Hoja', 'Perfil', 4, 0, 0, 0, 0.5, 0, 7, 45, 'BASE'),
('S62_2H-62703-159', 'S62_2H', 'SYS_62', '62703', 'AL', NULL, NULL, 'Hoja', 'Perfil', 4, 0, 0, 0, 0, 1, -48, 45, 'BASE'),
('S62_2H-62705-160', 'S62_2H', 'SYS_62', '62705', 'AL', NULL, NULL, 'Traslapo', 'Perfil', 2, 0, 0, 0, 0, 1, -48, 90, 'BASE'),
('S62_2H-CI8062-162', 'S62_2H', 'SYS_62', 'CI8062', 'GEN', NULL, NULL, 'Cierre Lat', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S62_2H-CR60-161', 'S62_2H', 'SYS_62', 'CR60', 'GEN', NULL, NULL, 'Cierre', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S62_2H-FE80-165', 'S62_2H', 'SYS_62', 'FE80', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.004, 0.006, 0, 0, 0, 0, 0, 'BASE'),
('S62_2H-GA80-163', 'S62_2H', 'SYS_62', 'GA80', 'GEN', NULL, NULL, 'Garrucha', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S62_2H-SI80-164', 'S62_2H', 'SYS_62', 'SI80', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 80 - 2 Hojas
('S80_2H-80501-119', 'S80_2H', 'SYS_80', '80501', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 1, 0, 0, 45, 'BASE'),
('S80_2H-80501-120', 'S80_2H', 'SYS_80', '80501', 'AL', NULL, NULL, 'Marco', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 45, 'BASE'),
('S80_2H-80503-121', 'S80_2H', 'SYS_80', '80503', 'AL', NULL, NULL, 'Hoja', 'Perfil', 4, 0, 0, 0, 0.5, 0, 11, 45, 'BASE'),
('S80_2H-80503-122', 'S80_2H', 'SYS_80', '80503', 'AL', NULL, NULL, 'Hoja', 'Perfil', 4, 0, 0, 0, 0, 1, -56, 45, 'BASE'),
('S80_2H-80505-123', 'S80_2H', 'SYS_80', '80505', 'AL', NULL, NULL, 'Traslapo', 'Perfil', 2, 0, 0, 0, 0, 1, -56, 90, 'BASE'),
('S80_2H-CI8062-125', 'S80_2H', 'SYS_80', 'CI8062', 'GEN', NULL, NULL, 'Cierre Lat', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S80_2H-CR60-124', 'S80_2H', 'SYS_80', 'CR60', 'GEN', NULL, NULL, 'Cierre C/L', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S80_2H-GA80-126', 'S80_2H', 'SYS_80', 'GA80', 'GEN', NULL, NULL, 'Garrucha', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S80_2H-FESYB-133', 'S80_2H', 'SYS_80', 'FESYB', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.004, 0.008, 0, 0, 0, 0, 0, 'BASE'),
('S80_2H-SI80-132', 'S80_2H', 'SYS_80', 'SI80', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE'),

-- Sobreluz Genérico
('SOBRELUZ_25_20-5230-1', 'SOBRELUZ_25_20', 'SYS_GEN', '5230', 'AL', NULL, NULL, 'Tubo Sobreluz', 'Perfil', 1, 0, 0, 0, 2, 2, 0, 90, 'BASE'),
('SOBRELUZ_25_20-7001-2', 'SOBRELUZ_25_20', 'SYS_GEN', '7001', 'AL', NULL, NULL, 'Hoja Sobreluz', 'Perfil', 1, 0, 0, 0, 4, 4, 0, 90, 'BASE'),
('SOBRELUZ_25_20-7003-3', 'SOBRELUZ_25_20', 'SYS_GEN', '7003', 'AL', NULL, NULL, 'Junquillo', 'Perfil', 1, 0, 0, 0, 0.8, 0.8, 0, 90, 'BASE'),
('SOBRELUZ_25_20-7955-4', 'SOBRELUZ_25_20', 'SYS_GEN', '7955', 'AL', NULL, NULL, 'Perfil U', 'Perfil', 1, 0, 0, 0, 1, 0, 0, 90, 'BASE'),
('SOBRELUZ_25_20-3004-5', 'SOBRELUZ_25_20', 'SYS_GEN', '3004', 'AL', NULL, NULL, 'Perfil H', 'Perfil', 1, 0, 0, 0, 1, 2, 0, 90, 'BASE'),
('SOBRELUZ_25_20-SISOBR-6', 'SOBRELUZ_25_20', 'SYS_GEN', 'SISOBR', 'GEN', NULL, NULL, 'Silicona Sobreluz', 'Accesorio', 0, 0.002, 0.003, 0, 0, 0, 0, 0, 'BASE')

ON CONFLICT (id_receta) DO UPDATE SET 
    id_modelo = EXCLUDED.id_modelo,
    id_sistema = EXCLUDED.id_sistema,
    id_plantilla = EXCLUDED.id_plantilla,
    id_material_receta = EXCLUDED.id_material_receta,
    nombre_componente = EXCLUDED.nombre_componente,
    tipo = EXCLUDED.tipo,
    cantidad_base = EXCLUDED.cantidad_base,
    factor_cantidad_ancho = EXCLUDED.factor_cantidad_ancho,
    factor_cantidad_alto = EXCLUDED.factor_cantidad_alto,
    factor_cantidad_area = EXCLUDED.factor_cantidad_area,
    factor_corte_ancho = EXCLUDED.factor_corte_ancho,
    factor_corte_alto = EXCLUDED.factor_corte_alto,
    constante_corte_mm = EXCLUDED.constante_corte_mm,
    angulo = EXCLUDED.angulo,
    condicion = EXCLUDED.condicion;
