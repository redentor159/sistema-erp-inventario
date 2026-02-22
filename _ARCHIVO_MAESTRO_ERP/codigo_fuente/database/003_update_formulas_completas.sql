-- =================================================================================================
-- MIGRACIÓN 003: Actualizar fórmulas completas para todos los modelos
-- Fecha: 2026-02-13
-- IMPORTANTE: Ejecutar DESPUÉS de 002_fix_fk_and_sku_column.sql
-- =================================================================================================

-- Limpiar todas las recetas existentes para re-insertar con fórmulas correctas
DELETE FROM mst_recetas_ingenieria;

-- ═══════════════════════════════════════════════════════════════════
-- SOBRELUZ 25/20 (SOBRELUZ_25_20)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
-- MARCO
('SOBR-M-5230', 'SOBRELUZ_25_20', 'Perfil', '5230', 'Sobreluz marco', 'MARCO', '1', '(ancho*2)+(alto*2)', 90, 1),
-- HOJAS
('SOBR-H-7001', 'SOBRELUZ_25_20', 'Perfil', '7001', 'Sobreluz hoja 7001', 'HOJAS', '1', '(ancho*4)+(alto*4)', 90, 1),
('SOBR-H-7003', 'SOBRELUZ_25_20', 'Perfil', '7003', 'Sobreluz hoja 7003', 'HOJAS', '1', '((ancho*4)+(alto*4))*0.2', 90, 2),
('SOBR-H-7955', 'SOBRELUZ_25_20', 'Perfil', '7955', 'Sobreluz hoja 7955', 'HOJAS', '1', 'ancho', 90, 3),
('SOBR-H-3004', 'SOBRELUZ_25_20', 'Perfil', '3004', 'Sobreluz hoja 3004', 'HOJAS', '1', 'ancho+(alto*2)', 90, 4);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
-- ACCESORIOS EN HOJAS
('SOBR-AH-SISOBR1', 'SOBRELUZ_25_20', 'Accesorio', 'SISOBR', 'Silicona sobreluz', 'ACCESORIOS_HOJAS', '(crucesH*ancho)/1000', 1),
('SOBR-AH-SISOBR2', 'SOBRELUZ_25_20', 'Accesorio', 'SISOBR', 'Silicona sobreluz', 'ACCESORIOS_HOJAS', '(crucesV*alto)/1000', 2);

-- CRUCES (stored as profiles with special section)
INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('SOBR-C-5230', 'SOBRELUZ_25_20', 'Perfil', '5230', 'Cruz 5230', 'CRUCES', 'hojas', 'ancho', 1),
('SOBR-C-7001', 'SOBRELUZ_25_20', 'Perfil', '7001', 'Cruz 7001', 'CRUCES', 'hojas', '2*ancho', 2),
('SOBR-C-7003', 'SOBRELUZ_25_20', 'Perfil', '7003', 'Cruz 7003', 'CRUCES', 'hojas', '2*ancho*0.2', 3),
('SOBR-C-3004', 'SOBRELUZ_25_20', 'Perfil', '3004', 'Cruz 3004', 'CRUCES', 'hojas', 'ancho', 4),
('SOBR-C-7955', 'SOBRELUZ_25_20', 'Perfil', '7955', 'Cruz 7955', 'CRUCES', 'hojas', 'ancho', 5);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('SOBR-AC-SISOBR1', 'SOBRELUZ_25_20', 'Accesorio', 'SISOBR', 'Silicona sobreluz', 'ACCESORIOS_CRUCES', '(crucesH*ancho)/1000', 1),
('SOBR-AC-SISOBR2', 'SOBRELUZ_25_20', 'Accesorio', 'SISOBR', 'Silicona sobreluz', 'ACCESORIOS_CRUCES', '(crucesV*alto)/1000', 2);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 25 - 2 HOJAS (S25_2H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S25_2H-M-2501', 'S25_2H', 'Perfil', '2501', 'Riel superior', 'MARCO', '1', 'ancho-16', 90, 1),
('S25_2H-M-2502', 'S25_2H', 'Perfil', '2502', 'Riel inferior', 'MARCO', '1', 'ancho-16', 90, 2),
('S25_2H-M-2509', 'S25_2H', 'Perfil', '2509', 'Jamba', 'MARCO', '2', 'alto', 90, 3),
('S25_2H-H-2504', 'S25_2H', 'Perfil', '2504', 'Cabezal hoja', 'HOJAS', '2', '(ancho/2)+4', 90, 1),
('S25_2H-H-2505', 'S25_2H', 'Perfil', '2505', 'Zócalo hoja', 'HOJAS', '2', '(ancho/2)+4', 90, 2),
('S25_2H-H-2507', 'S25_2H', 'Perfil', '2507', 'Enganche hoja', 'HOJAS', '2', 'alto-34', 90, 3),
('S25_2H-H-2510', 'S25_2H', 'Perfil', '2510', 'Cierre hoja', 'HOJAS', '2', 'alto-34', 90, 4);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S25_2H-A-CI25F',  'S25_2H', 'Accesorio', 'CI25F',  'Cierre lateral', 'ACCESORIOS_HOJAS', 'hojas', 1),
('S25_2H-A-GA25D',  'S25_2H', 'Accesorio', 'GA25D',  'Garrucha doble serie 25', 'ACCESORIOS_HOJAS', '2*hojas', 2),
('S25_2H-A-GUSI25', 'S25_2H', 'Accesorio', 'GUSI25', 'Guia serie 25', 'ACCESORIOS_HOJAS', 'hojas*4', 3),
('S25_2H-A-T25',    'S25_2H', 'Accesorio', 'T25',    'Tornillos s25', 'ACCESORIOS_HOJAS', '8*hojas', 4),
('S25_2H-A-S25',    'S25_2H', 'Accesorio', 'S25',    'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 5),
('S25_2H-A-FESYB',  'S25_2H', 'Accesorio', 'FESYB',  'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(6*alto))/1000', 6),
('S25_2H-A-EF',     'S25_2H', 'Accesorio', 'E+F',    'Embalaje + Flete', 'ACCESORIOS_HOJAS', '25*(alto/1000)*(ancho/1000)', 7),
('S25_2H-A-TA14',   'S25_2H', 'Accesorio', 'TA14',   'Tarugos', 'ACCESORIOS_HOJAS', '12', 8),
('S25_2H-A-ACCM2',  'S25_2H', 'Accesorio', 'ACCM2',  'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 9);

-- INTERIOR S25_2H
INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S25_2H-I-1', 'S25_2H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/2', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 25 - 4 HOJAS FCCF (S25_4H_FCCF)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S25_4H-M-2501', 'S25_4H_FCCF', 'Perfil', '2501', 'Riel superior', 'MARCO', '1', 'ancho-16', 90, 1),
('S25_4H-M-2502', 'S25_4H_FCCF', 'Perfil', '2502', 'Riel inferior', 'MARCO', '1', 'ancho-16', 90, 2),
('S25_4H-M-2509', 'S25_4H_FCCF', 'Perfil', '2509', 'Jamba', 'MARCO', '2', 'alto', 90, 3),
('S25_4H-H-2504', 'S25_4H_FCCF', 'Perfil', '2504', 'Cabezal hoja', 'HOJAS', '4', '(ancho/4)+9', 90, 1),
('S25_4H-H-2505', 'S25_4H_FCCF', 'Perfil', '2505', 'Zócalo hoja', 'HOJAS', '4', '(ancho/4)+9', 90, 2),
('S25_4H-H-2507', 'S25_4H_FCCF', 'Perfil', '2507', 'Enganche hoja', 'HOJAS', '4', 'alto-34', 90, 3),
('S25_4H-H-2510', 'S25_4H_FCCF', 'Perfil', '2510', 'Cierre hoja', 'HOJAS', '4', 'alto-34', 90, 4),
('S25_4H-H-2521', 'S25_4H_FCCF', 'Perfil', '2521', 'Encuentro central', 'HOJAS', '1', 'alto-34', 90, 5);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S25_4H-A-CI25F',  'S25_4H_FCCF', 'Accesorio', 'CI25F',  'Cierre lateral', 'ACCESORIOS_HOJAS', '0', 1),
('S25_4H-A-CHPLR',  'S25_4H_FCCF', 'Accesorio', 'CHPLR',  'Cierre Pico de loro', 'ACCESORIOS_HOJAS', '1', 2),
('S25_4H-A-GA25D',  'S25_4H_FCCF', 'Accesorio', 'GA25D',  'Garrucha doble serie 25', 'ACCESORIOS_HOJAS', '4', 3),
('S25_4H-A-GUSI25', 'S25_4H_FCCF', 'Accesorio', 'GUSI25', 'Guia serie 25', 'ACCESORIOS_HOJAS', '12', 4),
('S25_4H-A-T25',    'S25_4H_FCCF', 'Accesorio', 'T25',    'Tornillos s25', 'ACCESORIOS_HOJAS', '8*hojas', 5),
('S25_4H-A-S25',    'S25_4H_FCCF', 'Accesorio', 'S25',    'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 6),
('S25_4H-A-FESYB',  'S25_4H_FCCF', 'Accesorio', 'FESYB',  'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(6*alto))/1000', 7),
('S25_4H-A-EF',     'S25_4H_FCCF', 'Accesorio', 'E+F',    'Embalaje + Flete', 'ACCESORIOS_HOJAS', '0*(alto/1000)*(ancho/1000)', 8),
('S25_4H-A-TA14',   'S25_4H_FCCF', 'Accesorio', 'TA14',   'Tarugos', 'ACCESORIOS_HOJAS', '12', 9),
('S25_4H-A-ACCM2',  'S25_4H_FCCF', 'Accesorio', 'ACCM2',  'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 10),
('S25_4H-A-JASIM',  'S25_4H_FCCF', 'Accesorio', 'JASIM',  'Jalador simple de nylon', 'ACCESORIOS_HOJAS', '4', 11);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S25_4H-I-1', 'S25_4H_FCCF', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/hojas', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 20 - 2 HOJAS (S20_2H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S20_2H-M-2001', 'S20_2H', 'Perfil', '2001', 'Riel superior', 'MARCO', '1', 'ancho-12', 90, 1),
('S20_2H-M-2002', 'S20_2H', 'Perfil', '2002', 'Riel inferior', 'MARCO', '1', 'ancho-12', 90, 2),
('S20_2H-M-2009', 'S20_2H', 'Perfil', '2009', 'Jamba', 'MARCO', '2', 'alto', 90, 3),
('S20_2H-H-2004', 'S20_2H', 'Perfil', '2004', 'Cabezal hoja', 'HOJAS', '2', '(ancho/2)-4', 90, 1),
('S20_2H-H-2005', 'S20_2H', 'Perfil', '2005', 'Zócalo hoja', 'HOJAS', '2', '(ancho/2)-4', 90, 2),
('S20_2H-H-2011', 'S20_2H', 'Perfil', '2011', 'Enganche hoja', 'HOJAS', '2', 'alto-28', 90, 3),
('S20_2H-H-2010', 'S20_2H', 'Perfil', '2010', 'Cierre hoja', 'HOJAS', '2', 'alto-28', 90, 4);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S20_2H-A-CI25F',  'S20_2H', 'Accesorio', 'CI25F',  'Cierre lateral', 'ACCESORIOS_HOJAS', 'hojas', 1),
('S20_2H-A-GA20',   'S20_2H', 'Accesorio', 'GA20',   'Garrucha Serie 20', 'ACCESORIOS_HOJAS', '2*hojas', 2),
('S20_2H-A-GUS20',  'S20_2H', 'Accesorio', 'GUS20',  'Guia serie 20', 'ACCESORIOS_HOJAS', 'hojas*4', 3),
('S20_2H-A-T25',    'S20_2H', 'Accesorio', 'T25',    'Tornillos s25', 'ACCESORIOS_HOJAS', '8*hojas', 4),
('S20_2H-A-S25',    'S20_2H', 'Accesorio', 'S25',    'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 5),
('S20_2H-A-FESYB',  'S20_2H', 'Accesorio', 'FESYB',  'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(6*alto))/1000', 6),
('S20_2H-A-EF',     'S20_2H', 'Accesorio', 'E+F',    'Embalaje + Flete', 'ACCESORIOS_HOJAS', '25*(alto/1000)*(ancho/1000)', 7),
('S20_2H-A-TA14',   'S20_2H', 'Accesorio', 'TA14',   'Tarugos', 'ACCESORIOS_HOJAS', '12', 8),
('S20_2H-A-ACCM2',  'S20_2H', 'Accesorio', 'ACCM2',  'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 9);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S20_2H-I-1', 'S20_2H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/2', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 20 - 4 HOJAS FCCF (S20_4H_FCCF)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S20_4H-M-2001', 'S20_4H_FCCF', 'Perfil', '2001', 'Riel superior', 'MARCO', '1', 'ancho-12', 90, 1),
('S20_4H-M-2002', 'S20_4H_FCCF', 'Perfil', '2002', 'Riel inferior', 'MARCO', '1', 'ancho-12', 90, 2),
('S20_4H-M-2009', 'S20_4H_FCCF', 'Perfil', '2009', 'Jamba', 'MARCO', '2', 'alto', 90, 3),
('S20_4H-H-2004', 'S20_4H_FCCF', 'Perfil', '2004', 'Cabezal hoja', 'HOJAS', '4', '(ancho/4)-4', 90, 1),
('S20_4H-H-2005', 'S20_4H_FCCF', 'Perfil', '2005', 'Zócalo hoja', 'HOJAS', '4', '(ancho/4)-4', 90, 2),
('S20_4H-H-2011', 'S20_4H_FCCF', 'Perfil', '2011', 'Enganche hoja', 'HOJAS', '4', 'alto-28', 90, 3),
('S20_4H-H-2010', 'S20_4H_FCCF', 'Perfil', '2010', 'Cierre hoja', 'HOJAS', '4', 'alto-28', 90, 4),
('S20_4H-H-2021', 'S20_4H_FCCF', 'Perfil', '2021', 'Encuentro central', 'HOJAS', '1', 'alto-28', 90, 5);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S20_4H-A-CHPLR',  'S20_4H_FCCF', 'Accesorio', 'CHPLR',  'Cierre Pico de loro', 'ACCESORIOS_HOJAS', '0', 1),
('S20_4H-A-CI25F',  'S20_4H_FCCF', 'Accesorio', 'CI25F',  'Cierre lateral', 'ACCESORIOS_HOJAS', '2', 2),
('S20_4H-A-GA20',   'S20_4H_FCCF', 'Accesorio', 'GA20',   'Garrucha Serie 20', 'ACCESORIOS_HOJAS', '4', 3),
('S20_4H-A-GUS20',  'S20_4H_FCCF', 'Accesorio', 'GUS20',  'Guia serie 20', 'ACCESORIOS_HOJAS', '12', 4),
('S20_4H-A-T25',    'S20_4H_FCCF', 'Accesorio', 'T25',    'Tornillos s25', 'ACCESORIOS_HOJAS', '8*hojas', 5),
('S20_4H-A-S25',    'S20_4H_FCCF', 'Accesorio', 'S25',    'Silicona', 'ACCESORIOS_HOJAS', '((2*ancho)+(8*alto))/1000', 6),
('S20_4H-A-FESYB',  'S20_4H_FCCF', 'Accesorio', 'FESYB',  'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(10*alto))/1000', 7),
('S20_4H-A-EF',     'S20_4H_FCCF', 'Accesorio', 'E+F',    'Embalaje + Flete', 'ACCESORIOS_HOJAS', '0*(alto/1000)*(ancho/1000)', 8),
('S20_4H-A-TA14',   'S20_4H_FCCF', 'Accesorio', 'TA14',   'Tarugos', 'ACCESORIOS_HOJAS', '12', 9),
('S20_4H-A-ACCM2',  'S20_4H_FCCF', 'Accesorio', 'ACCM2',  'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 10),
('S20_4H-A-JASIM',  'S20_4H_FCCF', 'Accesorio', 'JASIM',  'Jalador simple de nylon', 'ACCESORIOS_HOJAS', '0', 11);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S20_4H-I-1', 'S20_4H_FCCF', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/hojas', 1);
