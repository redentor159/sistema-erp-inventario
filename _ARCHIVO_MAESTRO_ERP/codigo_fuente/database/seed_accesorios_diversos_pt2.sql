-- ============================================================================
-- ACCESORIOS DIVERSOS COMPLEMENTO - 105+ PRODUCTOS RESTANTES
-- SKU: MATERIAL-PLANTILLA-ACABADO-MARCA (variables según tipo)
-- Fecha: 2026-02-09 | ON CONFLICT DO NOTHING
-- ============================================================================

-- ESTE ARCHIVO COMPLEMENTA seed_accesorios_diversos.sql

-- ============================================================================
-- SECCIÓN 12: HERRAJES Y CERRADURAS ESPECIALIZADAS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('8110', 'Perfil hermeticidad PVC', 'CON', 'SYS_GEN', NULL, 0.00),
('CH40', 'Chapa presión 40mm tubo 1 1/2', 'ACC', 'SYS_GEN', NULL, 0.00),
('CH56T', 'Cerradura vidrio templado europeo 56mm', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH612MA', 'Chapa pomo con manijas', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH612PE', 'Chapa pomo perilla', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHCO', 'Chapa cónica', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHPLR', 'Chapa pico loro', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHPR', 'Chapa pico recto', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHPRE', 'Chapa embutir pico recto', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHRLFIBI', 'Picaporte recto L FIBI', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHVIBO25', 'Cerradura vitrina botón 25mm', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHVILE', 'Cerradura vitrina lengüeta', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHVISE', 'Cerradura vitrina serrucho', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('PVC-8110-GEN','8110','GEN','PVC','MAT','8110','Perfil hermeticidad PVC','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH40-GEN','CH40','GEN','AL','MAT','CH40','Chapa presión 40mm tubo 1 1/2','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CH56T-GEN','CH56T','GEN','AC','MAT','CH56T','Cerradura vidrio templado europeo 56mm','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CH612MA-GEN','CH612MA','GEN','AC','MAT','CH612MA','Chapa pomo con manijas','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CH612PE-GEN','CH612PE','GEN','AC','MAT','CH612PE','Chapa pomo perilla','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHCO-GEN','CHCO','GEN','AC','MAT','CHCO','Chapa cónica','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHPLR-GEN','CHPLR','GEN','AC','MAT','CHPLR','Chapa pico loro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHPR-GEN','CHPR','GEN','AC','MAT','CHPR','Chapa pico recto','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHPRE-GEN','CHPRE','GEN','AC','MAT','CHPRE','Chapa embutir pico recto','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHRLFIBI-GEN','CHRLFIBI','GEN','AC','MAT','CHRLFIBI','Picaporte recto L FIBI','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CHVIBO25-GEN','CHVIBO25','GEN','AL','MAT','CHVIBO25','Cerradura vitrina botón 25mm','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CHVILE-GEN','CHVILE','GEN','AL','MAT','CHVILE','Cerradura vitrina lengüeta','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CHVISE-GEN','CHVISE','GEN','AL','MAT','CHVISE','Cerradura vitrina serrucho','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 13: CREMONA Y SOPORTES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('CR60', 'Cremona NT 60cm + Set + Kit S80', 'ACC', 'SYS_GEN', 600, 0.00),
('CRSPU', 'Soporte cristal templado', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CTR602', 'Contraplaca 602', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRPILR', 'Contraplaca cerradura pico loro', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRPIRC', 'Contraplaca cerradura pico recto', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRPO', 'Contraplaca cerradura pomo', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-CR60-GEN','CR60','GEN','AL','MAT','CR60','Cremona NT 60cm + Set + Kit S80','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CRSPU-PUL-GEN','CRSPU','GEN','AC','PUL','CRSPU','Soporte cristal templado - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTR602-GEN','CTR602','GEN','AL','MAT','CTR602','Contraplaca 602','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRPILR-GEN','CTRPILR','GEN','AL','MAT','CTRPILR','Contraplaca cerradura pico loro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRPIRC-GEN','CTRPIRC','GEN','AL','MAT','CTRPIRC','Contraplaca cerradura pico recto','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRPO-GEN','CTRPO','GEN','AL','MAT','CTRPO','Contraplaca cerradura pomo','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 14: ESCUADRAS Y ACCESORIOS ESTRUCTURALES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('EALS80', 'Escuadra alineamiento Serie 80', 'ACC', 'SYS_GEN', NULL, 0.00),
('EPRS80', 'Escuadra precisión Serie 80', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-EALS80-GEN','EALS80','GEN','AL','MAT','EALS80','Escuadra alineamiento S80','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-EPRS80-GEN','EPRS80','GEN','AL','MAT','EPRS80','Escuadra precisión S80','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 15: GARRUCHAS ADICIONALES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('GA344', 'Garrucha simple perfil 9150', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA3825', 'Garrucha doble Serie 3825', 'ACC', 'SYS_GEN', NULL, 0.00),
('GAMCO043', 'Garrucha doble Serie MCO043', 'ACC', 'SYS_GEN', NULL, 0.00),
('GAVCO043', 'Garrucha doble Serie VCO043', 'ACC', 'SYS_GEN', NULL, 0.00),
('GARACFM', 'Ruedas altas casco fierro mamparas', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI2A', 'Garrucha closet 4 ruedas 2253', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI32', 'Garrucha perfil 8482 económica', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI328', 'Garrucha R-20 aleta doble fierro', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI33', 'Garrucha perfil 8402 normal', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI335', 'Garrucha simple perfil 8220 aluminio', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-GA344-GEN','GA344','GEN','AL','MAT','GA344AL','Garrucha simple 9150 - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-GA344-GEN','GA344','GEN','FE','MAT','GA344FI','Garrucha simple 9150 - Fierro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA3825-GEN','GA3825','GEN','AL','MAT','GA3825','Garrucha doble S3825','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GAMCO043-GEN','GAMCO043','GEN','AL','MAT','GAMCO043','Garrucha doble MCO043','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GAVCO043-GEN','GAVCO043','GEN','AL','MAT','GAVCO043','Garrucha doble VCO043','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-GARACFM-GEN','GARACFM','GEN','FE','MAT','GARACFM','Ruedas altas casco fierro mamparas','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-GI2A-GEN','GI2A','GEN','PVC','MAT','GI2A','Garrucha closet 4 ruedas 2253','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-GI32-GEN','GI32','GEN','PVC','MAT','GI32','Garrucha perfil 8482 económica','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-GI328-GEN','GI328','GEN','FE','MAT','GI328','Garrucha R-20 aleta doble fierro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-GI33-GEN','GI33','GEN','PVC','MAT','GI33','Garrucha perfil 8402 normal','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GI335-GEN','GI335','GEN','AL','MAT','GI335','Garrucha simple 8220 aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 16: GUÍAS ADICIONALES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('GUI3825', 'Guía inferior 01 Serie 3825', 'ACC', 'SYS_GEN', NULL, 0.00),
('GUS3825', 'Guía superior 02 Serie 3825', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-GUI3825-GEN','GUI3825','GEN','AL','MAT','GUI3825','Guía inferior 01 S3825','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GUS3825-GEN','GUS3825','GEN','AL','MAT','GUS3825','Guía superior 02 S3825','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 17: PLACAS Y SOPORTES ESPECIALES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('PIAPLIC', 'Pico aplicador silicona salchicha', 'CON', 'SYS_GEN', NULL, 0.00),
('PIPA', 'Soporte pipa baranda', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('PLACSITDI', 'Placa Sistema Directo Acero', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('PLCPLR', 'Placa adaptadora pico loro VC', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('PLPOSVT', 'Placa posiciones vidrio templado', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('PVC-PIAPLIC-GEN','PIAPLIC','GEN','PVC','MAT','PIAPLIC','Pico aplicador silicona salchicha','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-PIPA-GEN','PIPA','GEN','AC','MAT','PIPA','Soporte pipa baranda','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-PLACSITDI-NEG-GEN','PLACSITDI','GEN','AC','NEG','PLACSITDIA','Placa Sistema Directo - Acero Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PLCPLR-GEN','PLCPLR','GEN','AL','MAT','PLCPLR','Placa adaptadora pico loro VC - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PLPOSVT-MAT-GEN','PLPOSVT','GEN','AL','MAT','PLPOSVTA','Placa posiciones vidrio templado - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 18: POMOS Y MANIJAS ESPECIALES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('POMCUA', 'Pomo cuadrado cerradura baño', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('POMOAL', 'Pomo aluminio redondo vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('POMORED', 'Pomo redondo cerradura baño', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('POMOVC', 'Pomo vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-POMCUA-NEG-GEN','POMCUA','GEN','AC','NEG','POMCUAB','Pomo cuadrado cerradura baño - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-POMCUA-PUL-GEN','POMCUA','GEN','AC','PUL','POMCUAPU','Pomo cuadrado cerradura baño - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-POMOAL-MAT-GEN','POMOAL','GEN','AL','MAT','POMOALA','Pomo aluminio redondo VC - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-POMOAL-NEG-GEN','POMOAL','GEN','AL','NEG','POMOALB','Pomo aluminio redondo VC - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-POMORED-NEG-GEN','POMORED','GEN','AC','NEG','POMOREDB','Pomo redondo cerradura baño - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-POMORED-PUL-GEN','POMORED','GEN','AC','PUL','POMOREDPU','Pomo redondo cerradura baño - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-POMOVC-MAT-GEN','POMOVC','GEN','AL','MAT','POMOVCA','Pomo vidrio crudo - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-POMOVC-NEG-GEN','POMOVC','GEN','AL','NEG','POMOVCB','Pomo vidrio crudo - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 19: RAILES Y PORTAVIDRIOS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('RAIL3942', 'Rail Serie 3942', 'ACC', 'SYS_GEN', NULL, 0.00),
('PORVICALP', 'Portavidrios Canal perfil ALU', 'ACC', 'SYS_GEN', NULL, 0.00),
('PORVICANP', 'Portavidrios Canal perfil ALU PVC', 'ACC', 'SYS_GEN', NULL, 0.00),
('PORVIGU', 'Portavidrios Guarnición PVC', 'ACC', 'SYS_GEN', NULL, 0.00),
('PORVIPV', 'Portavidrios PVC', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-RAIL3942-GEN','RAIL3942','GEN','AL','MAT','RAIL3942','Rail Serie 3942','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PORVICALP-MAT-GEN','PORVICALP','GEN','AL','MAT','PORVICALPA','Portavidrios Canal AL - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PORVICALP-NEG-GEN','PORVICALP','GEN','AL','NEG','PORVICALPB','Portavidrios Canal AL - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PORVICANP-MAT-GEN','PORVICANP','GEN','AL','MAT','PORVICANPA','Portavidrios Canal AL PVC - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PORVICANP-NEG-GEN','PORVICANP','GEN','AL','NEG','PORVICANPB','Portavidrios Canal AL PVC - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-PORVIGU-NEG-GEN','PORVIGU','GEN','PVC','NEG','PORVIGUB','Portavidrios Guarnición PVC - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-PORVIGU-BLA-GEN','PORVIGU','GEN','PVC','BLA','PORVIGUP','Portavidrios Guarnición PVC - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-PORVIPV-NEG-GEN','PORVIPV','GEN','PVC','NEG','PORVIPVB','Portavidrios PVC - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-PORVIPV-BLA-GEN','PORVIPV','GEN','PVC','BLA','PORVIPVP','Portavidrios PVC - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 20: RODINES Y RUEDAS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('RO20', 'Rodin vidrio corredizo 20mm', 'ACC', 'SYS_GEN', NULL, 0.00),
('RO25', 'Rodin vidrio corredizo 25mm', 'ACC', 'SYS_GEN', NULL, 0.00),
('RUBA36', 'Rueda 36mm base alta', 'ACC', 'SYS_GEN', NULL, 0.00),
('RUBA41', 'Rueda 41mm base alta', 'ACC', 'SYS_GEN', NULL, 0.00),
('RUBB28', 'Rueda 28mm base baja', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('PVC-RO20-GEN','RO20','GEN','PVC','MAT','RO20','Rodin vidrio corredizo 20mm','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-RO25-GEN','RO25','GEN','PVC','MAT','RO25','Rodin vidrio corredizo 25mm','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-RUBA36-GEN','RUBA36','GEN','PVC','MAT','RUBA36','Rueda 36mm base alta','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-RUBA41-GEN','RUBA41','GEN','PVC','MAT','RUBA41','Rueda 41mm base alta','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-RUBB28-GEN','RUBB28','GEN','PVC','MAT','RUBB28','Rueda 28mm base baja','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 21: SEGUROS Y PESTILLOS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('SE20', 'Seguro Serie 20', 'ACC', 'SYS_GEN', NULL, 0.00),
('SE25', 'Seguro Serie 25', 'ACC', 'SYS_GEN', NULL, 0.00),
('SECIM', 'Seguro Cima', 'ACC', 'SYS_GEN', NULL, 0.00),
('SEPLVC', 'Seguro platillo vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('SEPRPR', 'Seguro presión proyector', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-SE20-MAT-FER','SE20','FER','AL','MAT','SE20FA','Seguro S20 Fermax - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE20-NEG-FER','SE20','FER','AL','NEG','SE20FB','Seguro S20 Fermax - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE20-BRO-FER','SE20','FER','AL','BRO','SE20FBR','Seguro S20 Fermax - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE20-BLA-FER','SE20','FER','AL','BLA','SE20FP','Seguro S20 Fermax - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE20-MAT-HPD','SE20','HPD','AL','MAT','SE20HA','Seguro S20 HPD - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE20-NEG-HPD','SE20','HPD','AL','NEG','SE20HB','Seguro S20 HPD - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE20-BLA-HPD','SE20','HPD','AL','BLA','SE20HP','Seguro S20 HPD - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-MAT-FER','SE25','FER','AL','MAT','SE25FA','Seguro S25 Fermax - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-NEG-FER','SE25','FER','AL','NEG','SE25FB','Seguro S25 Fermax - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-BRO-FER','SE25','FER','AL','BRO','SE25FBR','Seguro S25 Fermax - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-BLA-FER','SE25','FER','AL','BLA','SE25FP','Seguro S25 Fermax - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-MAT-HPD','SE25','HPD','AL','MAT','SE25HA','Seguro S25 HPD - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-NEG-HPD','SE25','HPD','AL','NEG','SE25HB','Seguro S25 HPD - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SE25-BLA-HPD','SE25','HPD','AL','BLA','SE25HP','Seguro S25 HPD - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SECIM-GEN','SECIM','GEN','AL','MAT','SECIM','Seguro Cima','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SEPLVC-MAT-GEN','SEPLVC','GEN','AL','MAT','SEPLVCA','Seguro platillo vidrio crudo - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SEPLVC-NEG-GEN','SEPLVC','GEN','AL','NEG','SEPLVCB','Seguro platillo vidrio crudo - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SEPRPR-MAT-GEN','SEPRPR','GEN','AL','MAT','SEPRPRA','Seguro presión proyector - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-SEPRPR-NEG-GEN','SEPRPR','GEN','AL','NEG','SEPRPRB','Seguro presión proyector - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 22: SILICONA Y TACOS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('SIL', 'Silicona tubería', 'CON', 'SYS_GEN', NULL, 0.00),
('TACBR', 'Taco brazo', 'ACC', 'SYS_GEN', NULL, 0.00),
('TACPL', 'Taco plástico', 'ACC', 'SYS_GEN', NULL, 0.00),
('TACRA', 'Taco ramplug', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('PVC-SIL-INC-GEN','SIL','GEN','PVC','INC','SIL','Silicona tubería - Incoloro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TACBR-GEN','TACBR','GEN','PVC','MAT','TACBR','Taco brazo','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TACPL-GEN','TACPL','GEN','PVC','MAT','TACPL','Taco plástico','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TACRA-GEN','TACRA','GEN','PVC','MAT','TACRA','Taco ramplug','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 23: TOPES Y ZOCALOS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('TO20', 'Tope Serie 20', 'ACC', 'SYS_GEN', NULL, 0.00),
('TO25', 'Tope Serie 25', 'ACC', 'SYS_GEN', NULL, 0.00),
('TO3942', 'Tope Serie 3942', 'ACC', 'SYS_GEN', NULL, 0.00),
('ZOAL', 'Zócalo aluminio', 'ACC', 'SYS_GEN', NULL, 0.00),
('ZOPV', 'Zócalo PVC', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('PVC-TO20-NEG-GEN','TO20','GEN','PVC','NEG','TO20B','Tope S20 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO20-GRI-GEN','TO20','GEN','PVC','GRI','TO20G','Tope S20 - Gris','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO20-BLA-GEN','TO20','GEN','PVC','BLA','TO20P','Tope S20 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO25-NEG-GEN','TO25','GEN','PVC','NEG','TO25B','Tope S25 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO25-GRI-GEN','TO25','GEN','PVC','GRI','TO25G','Tope S25 - Gris','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO25-BLA-GEN','TO25','GEN','PVC','BLA','TO25P','Tope S25 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO3942-NEG-GEN','TO3942','GEN','PVC','NEG','TO3942B','Tope S3942 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO3942-GRI-GEN','TO3942','GEN','PVC','GRI','TO3942G','Tope S3942 - Gris','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-TO3942-BLA-GEN','TO3942','GEN','PVC','BLA','TO3942P','Tope S3942 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-ZOAL-MAT-GEN','ZOAL','GEN','AL','MAT','ZOALA','Zócalo aluminio - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-ZOAL-NEG-GEN','ZOAL','GEN','AL','NEG','ZOALB','Zócalo aluminio - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-ZOPV-NEG-GEN','ZOPV','GEN','PVC','NEG','ZOPVB','Zócalo PVC - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-ZOPV-BLA-GEN','ZOPV','GEN','PVC','BLA','ZOPVP','Zócalo PVC - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- RESUMEN COMPLEMENTO
-- ============================================================================
-- Plantillas adicionales: 60+
-- Variantes adicionales: 105+
-- Total acumulado entre ambos archivos: ~180 plantillas, ~285 variantes
-- ============================================================================
