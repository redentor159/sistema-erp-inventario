-- =================================================================================================
-- SEED DATA: RECETAS DE INGENIERÍA ACTUALIZADAS
-- Fecha: 2026-02-07
-- =================================================================================================

-- Limpiar recetas anteriores (opcional, descomentar si se quiere reemplazar todo)
-- DELETE FROM mst_recetas_ingenieria;

-- INSERTAR NUEVAS RECETAS
INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, id_sistema, id_plantilla, id_material_receta, id_acabado_receta, id_marca_receta, nombre_componente, tipo, cantidad_base, factor_cantidad_ancho, factor_cantidad_alto, factor_cantidad_area, factor_corte_ancho, factor_corte_alto, constante_corte_mm, angulo, condicion) VALUES
-- Sistema 20 - 2 Hojas
('S20_2H-2001-40', 'S20_2H', 'SYS_20', '2001', 'AL', NULL, NULL, 'Riel Sup', 'Perfil', 1, 0, 0, 0, 1, 0, -12, 90, 'BASE'),
('S20_2H-2002-41', 'S20_2H', 'SYS_20', '2002', 'AL', NULL, NULL, 'Riel Inf', 'Perfil', 1, 0, 0, 0, 1, 0, -12, 90, 'BASE'),
('S20_2H-2004-43', 'S20_2H', 'SYS_20', '2004', 'AL', NULL, NULL, 'Zocalo Sup', 'Perfil', 2, 0, 0, 0, 0.5, 0, -4, 90, 'BASE'),
('S20_2H-2005-44', 'S20_2H', 'SYS_20', '2005', 'AL', NULL, NULL, 'Zocalo Inf', 'Perfil', 2, 0, 0, 0, 0.5, 0, -4, 90, 'BASE'),
('S20_2H-2009-42', 'S20_2H', 'SYS_20', '2009', 'AL', NULL, NULL, 'Jamba', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 90, 'BASE'),
('S20_2H-2010-46', 'S20_2H', 'SYS_20', '2010', 'AL', NULL, NULL, 'Traslapo', 'Perfil', 2, 0, 0, 0, 0, 1, -28, 90, 'BASE'),
('S20_2H-2011-45', 'S20_2H', 'SYS_20', '2011', 'AL', NULL, NULL, 'Pierna', 'Perfil', 2, 0, 0, 0, 0, 1, -28, 90, 'BASE'),
('S20_2H-CI25F-47', 'S20_2H', 'SYS_20', 'CI25F', 'GEN', NULL, NULL, 'Cierre', 'Accesorio', 2, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_2H-FESYB-52', 'S20_2H', 'SYS_20', 'FESYB', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.004, 0.006, 0, 0, 0, 0, 0, 'BASE'),
('S20_2H-GA20-48', 'S20_2H', 'SYS_20', 'GA20', 'GEN', NULL, NULL, 'Garrucha', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_2H-GUS20-49', 'S20_2H', 'SYS_20', 'GUS20', 'GEN', NULL, NULL, 'Guia', 'Accesorio', 8, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_2H-S25-51', 'S20_2H', 'SYS_20', 'S25', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.004, 0, 0, 0, 0, 0, 'BASE'),
('S20_2H-T25-50', 'S20_2H', 'SYS_20', 'T25', 'GEN', NULL, NULL, 'Tornillo', 'Accesorio', 16, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_2H-TA14-54', 'S20_2H', 'SYS_20', 'TA14', 'GEN', NULL, NULL, 'Tarugos', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE'),

-- Sistema 20 - 4 Hojas FCCF
('S20_4H_FCCF-2001-55', 'S20_4H_FCCF', 'SYS_20', '2001', 'AL', NULL, NULL, 'Riel Sup', 'Perfil', 1, 0, 0, 0, 1, 0, -12, 90, 'BASE'),
('S20_4H_FCCF-2002-56', 'S20_4H_FCCF', 'SYS_20', '2002', 'AL', NULL, NULL, 'Riel Inf', 'Perfil', 1, 0, 0, 0, 1, 0, -12, 90, 'BASE'),
('S20_4H_FCCF-2004-58', 'S20_4H_FCCF', 'SYS_20', '2004', 'AL', NULL, NULL, 'Zocalo Sup', 'Perfil', 4, 0, 0, 0, 0.25, 0, -4, 90, 'BASE'),
('S20_4H_FCCF-2005-59', 'S20_4H_FCCF', 'SYS_20', '2005', 'AL', NULL, NULL, 'Zocalo Inf', 'Perfil', 4, 0, 0, 0, 0.25, 0, -4, 90, 'BASE'),
('S20_4H_FCCF-2009-57', 'S20_4H_FCCF', 'SYS_20', '2009', 'AL', NULL, NULL, 'Jamba', 'Perfil', 2, 0, 0, 0, 0, 1, 0, 90, 'BASE'),
('S20_4H_FCCF-2010-61', 'S20_4H_FCCF', 'SYS_20', '2010', 'AL', NULL, NULL, 'Traslapo', 'Perfil', 4, 0, 0, 0, 0, 1, -28, 90, 'BASE'),
('S20_4H_FCCF-2011-60', 'S20_4H_FCCF', 'SYS_20', '2011', 'AL', NULL, NULL, 'Pierna', 'Perfil', 4, 0, 0, 0, 0, 1, -28, 90, 'BASE'),
('S20_4H_FCCF-2021-62', 'S20_4H_FCCF', 'SYS_20', '2021', 'AL', NULL, NULL, 'Adaptador', 'Perfil', 1, 0, 0, 0, 0, 1, -28, 90, 'BASE'),
('S20_4H_FCCF-CI25F-63', 'S20_4H_FCCF', 'SYS_20', 'CI25F', 'GEN', NULL, NULL, 'Cierre', 'Accesorio', 2, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_4H_FCCF-FESYB-68', 'S20_4H_FCCF', 'SYS_20', 'FESYB', 'GEN', NULL, NULL, 'Felpa', 'Accesorio', 0, 0.004, 0.01, 0, 0, 0, 0, 0, 'BASE'),
('S20_4H_FCCF-GA20-64', 'S20_4H_FCCF', 'SYS_20', 'GA20', 'GEN', NULL, NULL, 'Garrucha', 'Accesorio', 4, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_4H_FCCF-GUS20-65', 'S20_4H_FCCF', 'SYS_20', 'GUS20', 'GEN', NULL, NULL, 'Guia', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_4H_FCCF-S25-67', 'S20_4H_FCCF', 'SYS_20', 'S25', 'GEN', NULL, NULL, 'Silicona', 'Accesorio', 0, 0.002, 0.008, 0, 0, 0, 0, 0, 'BASE'),
('S20_4H_FCCF-T25-66', 'S20_4H_FCCF', 'SYS_20', 'T25', 'GEN', NULL, NULL, 'Tornillo', 'Accesorio', 32, 0, 0, 0, 0, 0, 0, 0, 'BASE'),
('S20_4H_FCCF-TA14-69', 'S20_4H_FCCF', 'SYS_20', 'TA14', 'GEN', NULL, NULL, 'Tarugos', 'Accesorio', 12, 0, 0, 0, 0, 0, 0, 0, 'BASE')

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
