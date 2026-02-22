-- =================================================================================================
-- MIGRACIÓN 003b: Fórmulas Part 2 - Series 3825, 3131, 42, 3831
-- Ejecutar DESPUÉS de 003_update_formulas_completas.sql
-- =================================================================================================

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 3825 - 2 HOJAS (S3825_2H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S3825-M-2621', 'S3825_2H', 'Perfil', '2621', 'Riel superior', 'MARCO', '1', 'ancho', 90, 1),
('S3825-M-2620', 'S3825_2H', 'Perfil', '2620', 'Riel inferior', 'MARCO', '1', 'ancho', 90, 2),
('S3825-M-2628', 'S3825_2H', 'Perfil', '2628', 'Jamba', 'MARCO', '2', 'alto-11', 90, 3),
('S3825-H-2624', 'S3825_2H', 'Perfil', '2624', 'Hoja 2624', 'HOJAS', '4', '(ancho/2)-3', 90, 1),
('S3825-H-2623', 'S3825_2H', 'Perfil', '2623', 'Hoja 2623', 'HOJAS', '2', 'alto-20', 90, 2),
('S3825-H-2622', 'S3825_2H', 'Perfil', '2622', 'Hoja 2622', 'HOJAS', '2', 'alto-20', 90, 3);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S3825-A-SEC',    'S3825_2H', 'Accesorio', 'SEC3825',  'Seguro Caracol 3825', 'ACCESORIOS_HOJAS', '1', 1),
('S3825-A-GA',     'S3825_2H', 'Accesorio', 'GA3825',   'Garrucha 3825', 'ACCESORIOS_HOJAS', '2*hojas', 2),
('S3825-A-GUII',   'S3825_2H', 'Accesorio', 'GUI3825',  'Guia inferior 3825', 'ACCESORIOS_HOJAS', 'hojas*2', 3),
('S3825-A-GUIS',   'S3825_2H', 'Accesorio', 'GUS3825',  'Guia superior 3825', 'ACCESORIOS_HOJAS', 'hojas*2', 4),
('S3825-A-T',      'S3825_2H', 'Accesorio', 'T3825',    'Tornillo 3825', 'ACCESORIOS_HOJAS', '6*hojas', 5),
('S3825-A-SI',     'S3825_2H', 'Accesorio', 'SI3825',   'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 6),
('S3825-A-FESYB',  'S3825_2H', 'Accesorio', 'FESYB',    'Felpa Systral', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 7),
('S3825-A-EF',     'S3825_2H', 'Accesorio', 'E+F',      'Embalaje + Flete', 'ACCESORIOS_HOJAS', '15*(alto/1000)*(ancho/1000)', 8),
('S3825-A-TA14',   'S3825_2H', 'Accesorio', 'TA14',     'Tarugos 1/4', 'ACCESORIOS_HOJAS', '8', 9);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S3825-I-1', 'S3825_2H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/2', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 3131 - 2 HOJAS (S3131_2H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S3131-M-3103', 'S3131_2H', 'Perfil', 'VCO3103', 'Riel superior', 'MARCO', '1', 'ancho', 90, 1),
('S3131-M-3101', 'S3131_2H', 'Perfil', 'VCO3101', 'Riel inferior', 'MARCO', '1', 'ancho', 90, 2),
('S3131-M-3105', 'S3131_2H', 'Perfil', 'VCO3105', 'Jamba', 'MARCO', '2', 'alto-10', 90, 3),
('S3131-H-3107', 'S3131_2H', 'Perfil', 'VCO3107', 'Hoja 3107', 'HOJAS', '4', '(ancho/2)-3', 90, 1),
('S3131-H-3113', 'S3131_2H', 'Perfil', 'VCO3113', 'Hoja 3113', 'HOJAS', '2', 'alto-20', 90, 2),
('S3131-H-3109', 'S3131_2H', 'Perfil', 'VCO3109', 'Hoja 3109', 'HOJAS', '2', 'alto-20', 90, 3);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S3131-A-SEC',    'S3131_2H', 'Accesorio', 'SEC3825',  'Seguro Caracol 3825', 'ACCESORIOS_HOJAS', '1', 1),
('S3131-A-GA',     'S3131_2H', 'Accesorio', 'GA3131',   'Garrucha 3131', 'ACCESORIOS_HOJAS', '2*hojas', 2),
('S3131-A-GU31',   'S3131_2H', 'Accesorio', 'GU31',     'Guia Superior 3131', 'ACCESORIOS_HOJAS', 'hojas*2', 3),
('S3131-A-T',      'S3131_2H', 'Accesorio', 'T3825',    'Tornillo 3825', 'ACCESORIOS_HOJAS', '6*hojas', 4),
('S3131-A-SI',     'S3131_2H', 'Accesorio', 'SI3825',   'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 5),
('S3131-A-FESYB',  'S3131_2H', 'Accesorio', 'FESYB',    'Felpa Systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(4*alto))/1000', 6),
('S3131-A-EF',     'S3131_2H', 'Accesorio', 'E+F',      'Embalaje + Flete', 'ACCESORIOS_HOJAS', '15*(alto/1000)*(ancho/1000)', 7),
('S3131-A-TA14',   'S3131_2H', 'Accesorio', 'TA14',     'Tarugos 1/4', 'ACCESORIOS_HOJAS', '8', 8);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S3131-I-1', 'S3131_2H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/2', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 42 - 1 HOJA Proyectante (S42_1H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S42-M-4209a', 'S42_1H', 'Perfil', '4209', 'Marco horizontal', 'MARCO', '2', 'ancho', 45, 1),
('S42-M-4209b', 'S42_1H', 'Perfil', '4209', 'Marco vertical', 'MARCO', '2', 'alto', 45, 2);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S42-AM-BRA25',  'S42_1H', 'Accesorio', 'BRA25F',  'Brazo Ext. 25cm Acero', 'ACCESORIOS_MARCO', '1', 1),
('S42-AM-BRA30',  'S42_1H', 'Accesorio', 'BRA30F',  'Brazo Ext. 30cm Acero', 'ACCESORIOS_MARCO', '0', 2),
('S42-AM-BRA40',  'S42_1H', 'Accesorio', 'BRA40F',  'Brazo Ext.40cm Fermax', 'ACCESORIOS_MARCO', '0', 3),
('S42-AM-BRA60',  'S42_1H', 'Accesorio', 'BRA60F',  'Brazo Ext.60cm Fermax', 'ACCESORIOS_MARCO', '0', 4),
('S42-AM-BRA95',  'S42_1H', 'Accesorio', 'BRA95F',  'Brazo Ext.95cm Fermax', 'ACCESORIOS_MARCO', '0', 5);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S42-H-4202a', 'S42_1H', 'Perfil', '4202', 'Hoja horizontal', 'HOJAS', '2', 'ancho-18', 45, 1),
('S42-H-4202b', 'S42_1H', 'Perfil', '4202', 'Hoja vertical', 'HOJAS', '2', 'alto-18', 45, 2),
('S42-H-4203a', 'S42_1H', 'Perfil', '4203', 'Hoja 4203 horiz', 'HOJAS', '2', 'ancho-90', 90, 3),
('S42-H-4203b', 'S42_1H', 'Perfil', '4203', 'Hoja 4203 vert', 'HOJAS', '2', 'alto-90', 45, 4);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S42-AH-MA',     'S42_1H', 'Accesorio', 'MA3831',  'Manija Der. Fermax', 'ACCESORIOS_HOJAS', '1', 1),
('S42-AH-BUDCB',  'S42_1H', 'Accesorio', 'BUDCB',   'Burlete DC Negro', 'ACCESORIOS_HOJAS', '((4*ancho)+(4*alto))/1000', 2),
('S42-AH-T42',    'S42_1H', 'Accesorio', 'T42',     'Tornillo 42/3831', 'ACCESORIOS_HOJAS', '6*hojas', 3),
('S42-AH-SI42',   'S42_1H', 'Accesorio', 'SI42',    'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(2*alto))/1000', 4),
('S42-AH-EF',     'S42_1H', 'Accesorio', 'E+F',     'Embalaje + Flete', 'ACCESORIOS_HOJAS', '15*(alto/1000)*(ancho/1000)', 5),
('S42-AH-TA14',   'S42_1H', 'Accesorio', 'TA14',    'Tarugos 1/4', 'ACCESORIOS_HOJAS', '8', 6),
('S42-AH-ACCM2',  'S42_1H', 'Accesorio', 'ACCM2',   'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 7);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S42-I-1', 'S42_1H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/2', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 3831 - 1 HOJA Proyectante (S3831_1H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S3831-M-173a', 'S3831_1H', 'Perfil', '173', 'Marco horizontal', 'MARCO', '2', 'ancho', 45, 1),
('S3831-M-173b', 'S3831_1H', 'Perfil', '173', 'Marco vertical', 'MARCO', '2', 'alto', 45, 2);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S3831-AM-BRA25',  'S3831_1H', 'Accesorio', 'BRA25F',  'Brazo Ext. 25cm Acero', 'ACCESORIOS_MARCO', '1', 1),
('S3831-AM-BRA30',  'S3831_1H', 'Accesorio', 'BRA30F',  'Brazo Ext. 30cm Acero', 'ACCESORIOS_MARCO', '0', 2),
('S3831-AM-BRA40',  'S3831_1H', 'Accesorio', 'BRA40F',  'Brazo Ext.40cm Fermax', 'ACCESORIOS_MARCO', '0', 3),
('S3831-AM-BRA60',  'S3831_1H', 'Accesorio', 'BRA60F',  'Brazo Ext.60cm Fermax', 'ACCESORIOS_MARCO', '0', 4),
('S3831-AM-BRA95',  'S3831_1H', 'Accesorio', 'BRA95F',  'Brazo Ext.95cm Fermax', 'ACCESORIOS_MARCO', '0', 5);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S3831-H-176a', 'S3831_1H', 'Perfil', '176', 'Hoja horizontal', 'HOJAS', '2', 'ancho-22', 45, 1),
('S3831-H-176b', 'S3831_1H', 'Perfil', '176', 'Hoja vertical', 'HOJAS', '2', 'alto-22', 45, 2),
('S3831-H-177a', 'S3831_1H', 'Perfil', '177', 'Hoja 177 horiz', 'HOJAS', '2', 'ancho-81', 90, 3),
('S3831-H-177b', 'S3831_1H', 'Perfil', '177', 'Hoja 177 vert', 'HOJAS', '2', 'alto-81', 45, 4);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S3831-AH-MA',     'S3831_1H', 'Accesorio', 'MA3831',  'Manija Der. Fermax', 'ACCESORIOS_HOJAS', '1', 1),
('S3831-AH-BUDCB',  'S3831_1H', 'Accesorio', 'BUDCB',   'Burlete DC Negro', 'ACCESORIOS_HOJAS', '((4*ancho)+(4*alto))/1000', 2),
('S3831-AH-T42',    'S3831_1H', 'Accesorio', 'T42',     'Tornillo 42/3831', 'ACCESORIOS_HOJAS', '5*hojas', 3),
('S3831-AH-SI42',   'S3831_1H', 'Accesorio', 'SI42',    'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(2*alto))/1000', 4),
('S3831-AH-EF',     'S3831_1H', 'Accesorio', 'E+F',     'Embalaje + Flete', 'ACCESORIOS_HOJAS', '0*(alto/1000)*(ancho/1000)', 5),
('S3831-AH-TA14',   'S3831_1H', 'Accesorio', 'TA14',    'Tarugos 1/4', 'ACCESORIOS_HOJAS', '8', 6),
('S3831-AH-ACCM2',  'S3831_1H', 'Accesorio', 'ACCM2',   'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 7);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S3831-I-1', 'S3831_1H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/2', 1);
