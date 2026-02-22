-- =================================================================================================
-- SEED DATA: RECETAS DE INGENIERÍA - PARTE 2 (SISTEMAS 25, 3825, 3131)
-- Fecha: 2026-02-07
-- =================================================================================================

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, id_sistema, id_plantilla, id_material_receta, id_acabado_receta, id_marca_receta, nombre_componente, tipo, cantidad_base, factor_cantidad_ancho, factor_cantidad_alto, factor_cantidad_area, factor_corte_ancho, factor_corte_alto, constante_corte_mm, angulo, condicion) VALUES
-- Sistema 25 - 2 Hojas
('S25_2H-2501-7', 'S25_2H', 'SYS_25', '2501', 'AL', NULL, NULL, 'Marco Sup', 'Perfil', 1, 0, 0, 0, 1, 0, -16, 90, 'BASE'),
('S25_2H-2502-8', 'S25_2H', 'SYS_25', '2502', 'AL', NULL, NULL, 'Marco Inf', 'Perfil', 1, 0, 0, 0, 1, 0, -16, 90, 'BASE'),
('S25_2H-2504-10', 'S25_2H', 'SYS_25', '2504', 'AL', NULL, NULL, 'Zócalo Sup', 'Perfil', 2, 0, 0, 0, 0.5, 0, 4, 90, 'BASE'),
('S25_2H-2505-11', 'S25_2H', 'SYS_25', '2505', 'AL', NULL, NULL, 'Zócalo Inf', 'Perfil', 2, 0, 0, 0, 0.5, 0, 4, 90, 'BASE'),
('S25_2H-2507-12', 'S25_2H', 'SYS_25', '2507', 'AL', NULL, NULL, 'Enganche', 'Perfil', 2, 0, 0, 0, 0, 1, -34, 90, 'BASE'),
('S25_2H-2509-9', 'S25_2H', 'SYS_25', '2509', 'AL', NULL, NULL, 'Jamba', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 90, 'BASE'),
('S25_2H-2510-13', 'S25_2H', 'SYS_25', '2510', 'AL', NULL, NULL, 'Parante', 'Perfil', 2, 0, 0, 0, 0, 1, -34, 90, 'BASE'),
('S25_2H-ACCM2-22', 'S25_2H', 'SYS_25', 'ACCM2', 'GEN', NULL, NULL, 'Acc. Por m2', 'Servicio', 0, 0, 0, 0.000001, 0, 0, 0, 0, 'BASE'),
('S25_2H-CI25F-14', 'S25_2H', 'SYS_25', 'CI25F', 'GEN', NULL, NULL, 'Cierre Lateral', 'Accesorio', 2, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_2H-FESYB-19', 'S25_2H', 'SYS_25', 'FESYB', 'GEN', NULL, NULL, 'Felpa Systral', 'Accesorio', 0, 0.004, 0.006, 0, 0, 0, 0, 0, 'BASE'),
('S25_2H-GA25D-15', 'S25_2H', 'SYS_25', 'GA25D', 'GEN', NULL, NULL, 'Garrucha Doble', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_2H-GUSI25-16', 'S25_2H', 'SYS_25', 'GUSI25', 'GEN', NULL, NULL, 'Guia S25', 'Accesorio', 8, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_2H-S25-18', 'S25_2H', 'SYS_25', 'S25', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S25_2H-T25-17', 'S25_2H', 'SYS_25', 'T25', 'GEN', NULL, NULL, 'Tornillos S25', 'Accesorio', 16, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_2H-TA14-21', 'S25_2H', 'SYS_25', 'TA14', 'GEN', NULL, NULL, 'Tarugos', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 25 - 4 Hojas FCCF
('S25_4H_FCCF-2501-23', 'S25_4H_FCCF', 'SYS_25', '2501', 'AL', NULL, NULL, 'Marco Sup', 'Perfil', 1, 0, 0, 0, 1, 0, -16, 90, 'BASE'),
('S25_4H_FCCF-2502-24', 'S25_4H_FCCF', 'SYS_25', '2502', 'AL', NULL, NULL, 'Marco Inf', 'Perfil', 1, 0, 0, 0, 1, 0, -16, 90, 'BASE'),
('S25_4H_FCCF-2504-26', 'S25_4H_FCCF', 'SYS_25', '2504', 'AL', NULL, NULL, 'Zócalo Sup', 'Perfil', 4, 0, 0, 0, 0.25, 0, 9, 90, 'BASE'),
('S25_4H_FCCF-2505-27', 'S25_4H_FCCF', 'SYS_25', '2505', 'AL', NULL, NULL, 'Zócalo Inf', 'Perfil', 4, 0, 0, 0, 0.25, 0, 9, 90, 'BASE'),
('S25_4H_FCCF-2507-28', 'S25_4H_FCCF', 'SYS_25', '2507', 'AL', NULL, NULL, 'Enganche', 'Perfil', 4, 0, 0, 0, 0, 1, -34, 90, 'BASE'),
('S25_4H_FCCF-2509-25', 'S25_4H_FCCF', 'SYS_25', '2509', 'AL', NULL, NULL, 'Jamba', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 90, 'BASE'),
('S25_4H_FCCF-2510-29', 'S25_4H_FCCF', 'SYS_25', '2510', 'AL', NULL, NULL, 'Parante', 'Perfil', 4, 0, 0, 0, 0, 1, -34, 90, 'BASE'),
('S25_4H_FCCF-2521-30', 'S25_4H_FCCF', 'SYS_25', '2521', 'AL', NULL, NULL, 'Adaptador', 'Perfil', 1, 0, 0, 0, 0, 1, -34, 90, 'BASE'),
('S25_4H_FCCF-CHPLR-31', 'S25_4H_FCCF', 'SYS_25', 'CHPLR', 'GEN', NULL, NULL, 'Pico Loro', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-FESYB-36', 'S25_4H_FCCF', 'SYS_25', 'FESYB', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.004, 0.01, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-GA25D-32', 'S25_4H_FCCF', 'SYS_25', 'GA25D', 'GEN', NULL, NULL, 'Garrucha Doble', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-GUSI25-33', 'S25_4H_FCCF', 'SYS_25', 'GUSI25', 'GEN', NULL, NULL, 'Guia S25', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-JASIM-39', 'S25_4H_FCCF', 'SYS_25', 'JASIM', 'GEN', NULL, NULL, 'Jalador', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-S25-35', 'S25_4H_FCCF', 'SYS_25', 'S25', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.008, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-T25-34', 'S25_4H_FCCF', 'SYS_25', 'T25', 'GEN', NULL, NULL, 'Tornillos', 'Accesorio', 32, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S25_4H_FCCF-TA14-38', 'S25_4H_FCCF', 'SYS_25', 'TA14', 'GEN', NULL, NULL, 'Tarugos', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 3825 - 2 Hojas
('S3825_2H-2620-71', 'S3825_2H', 'SYS_3825', '2620', 'AL', NULL, NULL, 'Riel Inf', 'Perfil', 1, 0, 0, 0, 1, 0, 0, 90, 'BASE'),
('S3825_2H-2621-70', 'S3825_2H', 'SYS_3825', '2621', 'AL', NULL, NULL, 'Riel Sup', 'Perfil', 1, 0, 0, 0, 1, 0, 0, 90, 'BASE'),
('S3825_2H-2622-75', 'S3825_2H', 'SYS_3825', '2622', 'AL', NULL, NULL, 'Traslapo', 'Perfil', 2, 0, 0, 0, 0, 1, -20, 90, 'BASE'),
('S3825_2H-2623-74', 'S3825_2H', 'SYS_3825', '2623', 'AL', NULL, NULL, 'Pierna', 'Perfil', 2, 0, 0, 0, 0, 1, -20, 90, 'BASE'),
('S3825_2H-2624-73', 'S3825_2H', 'SYS_3825', '2624', 'AL', NULL, NULL, 'Zocalo', 'Perfil', 4, 0, 0, 0, 0.5, 0, -3, 90, 'BASE'),
('S3825_2H-2628-72', 'S3825_2H', 'SYS_3825', '2628', 'AL', NULL, NULL, 'Jamba', 'Perfil', 2, 0, 0, 0, 0, 1, -11, 90, 'BASE'),
('S3825_2H-FESYB-82', 'S3825_2H', 'SYS_3825', 'FESYB', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S3825_2H-GA3825-77', 'S3825_2H', 'SYS_3825', 'GA3825', 'GEN', NULL, NULL, 'Garrucha', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3825_2H-GUI3825-78', 'S3825_2H', 'SYS_3825', 'GUI3825', 'GEN', NULL, NULL, 'Guia Inf', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3825_2H-GUS3825-79', 'S3825_2H', 'SYS_3825', 'GUS3825', 'GEN', NULL, NULL, 'Guia Sup', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3825_2H-SEC3825-76', 'S3825_2H', 'SYS_3825', 'SEC3825', 'GEN', NULL, NULL, 'Seguro Caracol', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3825_2H-SI3825-81', 'S3825_2H', 'SYS_3825', 'SI3825', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S3825_2H-T3825-80', 'S3825_2H', 'SYS_3825', 'T3825', 'GEN', NULL, NULL, 'Tornillo', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 3131 - 2 Hojas
('S3131_2H-VCO3101-85', 'S3131_2H', 'SYS_29', 'VCO3101', 'AL', NULL, NULL, 'Riel Inf', 'Perfil', 1, 0, 0, 0, 1, 0, 0, 90, 'BASE'),
('S3131_2H-VCO3103-84', 'S3131_2H', 'SYS_29', 'VCO3103', 'AL', NULL, NULL, 'Riel Sup', 'Perfil', 1, 0, 0, 0, 1, 0, 0, 90, 'BASE'),
('S3131_2H-VCO3105-86', 'S3131_2H', 'SYS_29', 'VCO3105', 'AL', NULL, NULL, 'Jamba', 'Perfil', 2, 0, 0, 0, 0, 1, -10, 90, 'BASE'),
('S3131_2H-VCO3107-87', 'S3131_2H', 'SYS_29', 'VCO3107', 'AL', NULL, NULL, 'Zocalo', 'Perfil', 4, 0, 0, 0, 0.5, 0, -3, 90, 'BASE'),
('S3131_2H-VCO3109-89', 'S3131_2H', 'SYS_29', 'VCO3109', 'AL', NULL, NULL, 'Traslapo', 'Perfil', 2, 0, 0, 0, 0, 1, -20, 90, 'BASE'),
('S3131_2H-VCO3113-88', 'S3131_2H', 'SYS_29', 'VCO3113', 'AL', NULL, NULL, 'Pierna', 'Perfil', 2, 0, 0, 0, 0, 1, -20, 90, 'BASE'),
('S3131_2H-FESYB-94', 'S3131_2H', 'SYS_29', 'FESYB', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.004, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S3131_2H-GA3131-91', 'S3131_2H', 'SYS_29', 'GA3131', 'GEN', NULL, NULL, 'Garrucha', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3131_2H-GU31-92', 'S3131_2H', 'SYS_29', 'GU31', 'GEN', NULL, NULL, 'Guia', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3131_2H-SEC3825-90', 'S3131_2H', 'SYS_29', 'SEC3825', 'GEN', NULL, NULL, 'Seguro', 'Accesorio', 1, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S3131_2H-SI3825-93', 'S3131_2H', 'SYS_29', 'SI3825', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE')

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
