-- =================================================================================================
-- MIGRACIÓN 003c: Fórmulas Part 3 - Series 80 (2H, 3H, 4H FCCF)
-- Ejecutar DESPUÉS de 003b
-- =================================================================================================

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 80 - 2 HOJAS (S80_2H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S80_2H-M-501a', 'S80_2H', 'Perfil', '80501', 'Marco horizontal', 'MARCO', '2', 'ancho', 45, 1),
('S80_2H-M-501b', 'S80_2H', 'Perfil', '80501', 'Marco vertical', 'MARCO', '2', 'alto', 45, 2),
('S80_2H-H-503a', 'S80_2H', 'Perfil', '80503', 'Hoja horizontal', 'HOJAS', '4', '(ancho/2)+11', 45, 1),
('S80_2H-H-503b', 'S80_2H', 'Perfil', '80503', 'Hoja vertical', 'HOJAS', '4', 'alto-56', 45, 2),
('S80_2H-H-505',  'S80_2H', 'Perfil', '80505', 'Cierre hoja', 'HOJAS', '2', 'alto-56', 90, 3);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S80_2H-A-MA80',   'S80_2H', 'Accesorio', 'MA80',    'Cierre Manija con Cremona Ne', 'ACCESORIOS_HOJAS', '0', 1),
('S80_2H-A-CR60',   'S80_2H', 'Accesorio', 'CR60',    'Cierre con Cremona y llave', 'ACCESORIOS_HOJAS', '1', 2),
('S80_2H-A-CI8062', 'S80_2H', 'Accesorio', 'CI8062',  'Cierre lateral serie 80', 'ACCESORIOS_HOJAS', '1', 3),
('S80_2H-A-CHPLR',  'S80_2H', 'Accesorio', 'CHPLR',   'Cierre Pico de loro', 'ACCESORIOS_HOJAS', '0', 4),
('S80_2H-A-JASIM',  'S80_2H', 'Accesorio', 'JASIM',   'Jalador simple de nylon', 'ACCESORIOS_HOJAS', '0', 5),
('S80_2H-A-GA80',   'S80_2H', 'Accesorio', 'GA80',    'Garrucha serie 80', 'ACCESORIOS_HOJAS', '2*hojas', 6),
('S80_2H-A-EPRS',   'S80_2H', 'Accesorio', 'EPRS80',  'Escuadra de precision', 'ACCESORIOS_HOJAS', '2*hojas', 7),
('S80_2H-A-EALS',   'S80_2H', 'Accesorio', 'EALS80',  'Escuadra de alineamiento', 'ACCESORIOS_HOJAS', '8*hojas', 8),
('S80_2H-A-EENS',   'S80_2H', 'Accesorio', 'EENS80',  'Escuadra de ensamble italiana', 'ACCESORIOS_HOJAS', '4*hojas', 9),
('S80_2H-A-GU80',   'S80_2H', 'Accesorio', 'GU80',    'Guia serie 80', 'ACCESORIOS_HOJAS', '4*hojas', 10),
('S80_2H-A-EF',     'S80_2H', 'Accesorio', 'E+F',     'Embalaje + Flete', 'ACCESORIOS_HOJAS', '25*(alto/1000)*(ancho/1000)', 11),
('S80_2H-A-T80',    'S80_2H', 'Accesorio', 'T80',     'Tornillo 80', 'ACCESORIOS_HOJAS', '16', 12),
('S80_2H-A-SI80',   'S80_2H', 'Accesorio', 'SI80',    'Silicona 80 /62', 'ACCESORIOS_HOJAS', '((2*ancho)+(4*alto))/1000', 13),
('S80_2H-A-FESYB',  'S80_2H', 'Accesorio', 'FESYB',   'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(8*alto))/1000', 14),
('S80_2H-A-TA14',   'S80_2H', 'Accesorio', 'TA14',    'Tarugos', 'ACCESORIOS_HOJAS', '12', 15),
('S80_2H-A-ACCM2',  'S80_2H', 'Accesorio', 'ACCM2',   'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 16);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S80_2H-I-1', 'S80_2H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/hojas', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 80 - 3 HOJAS (S80_3H)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S80_3H-M-502a', 'S80_3H', 'Perfil', '80502', 'Marco horizontal', 'MARCO', '2', 'ancho', 45, 1),
('S80_3H-M-502b', 'S80_3H', 'Perfil', '80502', 'Marco vertical', 'MARCO', '2', 'alto', 45, 2),
('S80_3H-H-503a', 'S80_3H', 'Perfil', '80503', 'Hoja horizontal', 'HOJAS', '6', '(ancho/3)+36', 45, 1),
('S80_3H-H-503b', 'S80_3H', 'Perfil', '80503', 'Hoja vertical', 'HOJAS', '6', 'alto-54', 45, 2),
('S80_3H-H-505',  'S80_3H', 'Perfil', '80505', 'Cierre hoja', 'HOJAS', '2', 'alto-54', 90, 3);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S80_3H-A-MA80',   'S80_3H', 'Accesorio', 'MA80',    'Cierre Manija con Cremona Ne', 'ACCESORIOS_HOJAS', '0', 1),
('S80_3H-A-CR60',   'S80_3H', 'Accesorio', 'CR60',    'Cierre con Cremona y llave', 'ACCESORIOS_HOJAS', '1', 2),
('S80_3H-A-CI8062', 'S80_3H', 'Accesorio', 'CI8062',  'Cierre lateral serie 80', 'ACCESORIOS_HOJAS', '0', 3),
('S80_3H-A-CHPLR',  'S80_3H', 'Accesorio', 'CHPLR',   'Cierre Pico de loro', 'ACCESORIOS_HOJAS', '0', 4),
('S80_3H-A-JASIM',  'S80_3H', 'Accesorio', 'JASIM',   'Jalador simple de nylon', 'ACCESORIOS_HOJAS', '2', 5),
('S80_3H-A-GA80',   'S80_3H', 'Accesorio', 'GA80',    'Garrucha serie 80', 'ACCESORIOS_HOJAS', '2*hojas', 6),
('S80_3H-A-EPRS',   'S80_3H', 'Accesorio', 'EPRS80',  'Escuadra de precision', 'ACCESORIOS_HOJAS', '2*hojas', 7),
('S80_3H-A-EALS',   'S80_3H', 'Accesorio', 'EALS80',  'Escuadra de alineamiento', 'ACCESORIOS_HOJAS', '8*hojas', 8),
('S80_3H-A-EENS',   'S80_3H', 'Accesorio', 'EENS80',  'Escuadra de ensamble italiana', 'ACCESORIOS_HOJAS', '4*hojas', 9),
('S80_3H-A-GU80',   'S80_3H', 'Accesorio', 'GU80',    'Guia serie 80', 'ACCESORIOS_HOJAS', '4*hojas', 10),
('S80_3H-A-EF',     'S80_3H', 'Accesorio', 'E+F',     'Embalaje + Flete', 'ACCESORIOS_HOJAS', '25*(alto/1000)*(ancho/1000)', 11),
('S80_3H-A-T80',    'S80_3H', 'Accesorio', 'T80',     'Tornillo 80', 'ACCESORIOS_HOJAS', '16', 12),
('S80_3H-A-SI80',   'S80_3H', 'Accesorio', 'SI80',    'Silicona 80 /62', 'ACCESORIOS_HOJAS', '((2*ancho)+(6*alto))/1000', 13),
('S80_3H-A-FESYB',  'S80_3H', 'Accesorio', 'FESYB',   'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(12*alto))/1000', 14),
('S80_3H-A-TA14',   'S80_3H', 'Accesorio', 'TA14',    'Tarugos', 'ACCESORIOS_HOJAS', '12', 15),
('S80_3H-A-ACCM2',  'S80_3H', 'Accesorio', 'ACCM2',   'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 16);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S80_3H-I-1', 'S80_3H', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/hojas', 1);

-- ═══════════════════════════════════════════════════════════════════
-- SERIE 80 - 4 HOJAS FCCF (S80_4H_FCCF)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_plantilla, nombre_componente, seccion, formula_cantidad, formula_perfil, angulo, orden_visual) VALUES
('S80_4H-M-501a', 'S80_4H_FCCF', 'Perfil', '80501', 'Marco horizontal', 'MARCO', '2', 'ancho', 45, 1),
('S80_4H-M-501b', 'S80_4H_FCCF', 'Perfil', '80501', 'Marco vertical', 'MARCO', '2', 'alto', 45, 2),
('S80_4H-H-503a', 'S80_4H_FCCF', 'Perfil', '80503', 'Hoja horizontal', 'HOJAS', '8', '(ancho/4)', 45, 1),
('S80_4H-H-503b', 'S80_4H_FCCF', 'Perfil', '80503', 'Hoja vertical', 'HOJAS', '8', 'alto', 45, 2),
('S80_4H-H-505',  'S80_4H_FCCF', 'Perfil', '80505', 'Cierre hoja', 'HOJAS', '4', 'alto', 90, 3),
('S80_4H-H-506',  'S80_4H_FCCF', 'Perfil', '80506', 'Encuentro central', 'HOJAS', '1', 'alto', 90, 4);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, id_sku_catalogo, nombre_componente, seccion, formula_cantidad, orden_visual) VALUES
('S80_4H-A-MA80',   'S80_4H_FCCF', 'Accesorio', 'MA80',    'Cierre Manija con Cremona Ne', 'ACCESORIOS_HOJAS', '0', 1),
('S80_4H-A-CR60',   'S80_4H_FCCF', 'Accesorio', 'CR60',    'Cierre con Cremona y llave', 'ACCESORIOS_HOJAS', '1', 2),
('S80_4H-A-CI8062', 'S80_4H_FCCF', 'Accesorio', 'CI8062',  'Cierre lateral serie 80', 'ACCESORIOS_HOJAS', '0', 3),
('S80_4H-A-CHPLR',  'S80_4H_FCCF', 'Accesorio', 'CHPLR',   'Cierre Pico de loro', 'ACCESORIOS_HOJAS', '0', 4),
('S80_4H-A-JASIM',  'S80_4H_FCCF', 'Accesorio', 'JASIM',   'Jalador simple de nylon', 'ACCESORIOS_HOJAS', '3', 5),
('S80_4H-A-GA80',   'S80_4H_FCCF', 'Accesorio', 'GA80',    'Garrucha serie 80', 'ACCESORIOS_HOJAS', '4', 6),
('S80_4H-A-EPRS',   'S80_4H_FCCF', 'Accesorio', 'EPRS80',  'Escuadra de precision', 'ACCESORIOS_HOJAS', '2*hojas', 7),
('S80_4H-A-EALS',   'S80_4H_FCCF', 'Accesorio', 'EALS80',  'Escuadra de alineamiento', 'ACCESORIOS_HOJAS', '8*hojas', 8),
('S80_4H-A-EENS',   'S80_4H_FCCF', 'Accesorio', 'EENS80',  'Escuadra de ensamble italiana', 'ACCESORIOS_HOJAS', '4*hojas', 9),
('S80_4H-A-GU80',   'S80_4H_FCCF', 'Accesorio', 'GU80',    'Guia serie 80', 'ACCESORIOS_HOJAS', '8', 10),
('S80_4H-A-EF',     'S80_4H_FCCF', 'Accesorio', 'E+F',     'Embalaje + Flete', 'ACCESORIOS_HOJAS', '25*(alto/1000)*(ancho/1000)', 11),
('S80_4H-A-T80',    'S80_4H_FCCF', 'Accesorio', 'T80',     'Tornillo 80', 'ACCESORIOS_HOJAS', '16', 12),
('S80_4H-A-SI80',   'S80_4H_FCCF', 'Accesorio', 'SI80',    'Silicona 80 /62', 'ACCESORIOS_HOJAS', '((2*ancho)+(8*alto))/1000', 13),
('S80_4H-A-FESYB',  'S80_4H_FCCF', 'Accesorio', 'FESYB',   'Felpa systral', 'ACCESORIOS_HOJAS', '((4*ancho)+(14*alto))/1000', 14),
('S80_4H-A-TA14',   'S80_4H_FCCF', 'Accesorio', 'TA14',    'Tarugos', 'ACCESORIOS_HOJAS', '12', 15),
('S80_4H-A-ACCM2',  'S80_4H_FCCF', 'Accesorio', 'ACCM2',   'Acc. Por m2', 'ACCESORIOS_HOJAS', '(alto*ancho)/1000000', 16);

INSERT INTO mst_recetas_ingenieria (id_receta, id_modelo, tipo, nombre_componente, seccion, formula_cantidad, formula_perfil, orden_visual) VALUES
('S80_4H-I-1', 'S80_4H_FCCF', 'Vidrio', 'Interior', 'INTERIOR', 'hojas', 'ancho/hojas', 1);
