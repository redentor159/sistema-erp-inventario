-- ============================================================================
-- ACCESORIOS DIVERSOS DE ALUMINIO Y CRISTAL - 250+ PRODUCTOS
-- SKU: MATERIAL-PLANTILLA-ACABADO-MARCA (variables según tipo)
-- Fecha: 2026-02-09 | ON CONFLICT DO NOTHING
-- ============================================================================

-- NOTA: Debido a la gran cantidad y diversidad de productos, este archivo
-- contiene múltiples familias de accesorios con estructuras SKU adaptadas

-- ============================================================================
-- SECCIÓN 1: ACCESORIOS VIDRIO CRUDO (VC)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('115VC', 'Pívot seguro posiciones vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('123VC', 'Pívot posiciones fijo-batiente vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('511VC', 'Fijación 1 cristal piso/techo/muro vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('615VC', 'Picaporte muro vidrio crudo', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-115VC-NEG-GEN','115VC','GEN','AC','NEG','115VCACB','Pívot seguro posiciones vidrio crudo - Acero Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-123VC-NEG-GEN','123VC','GEN','AL','NEG','123VCALA','Pívot posiciones fijo-batiente VC - Aluminio Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-123VC-MAT-GEN','123VC','GEN','AL','MAT','123VCALB','Pívot posiciones fijo-batiente VC - Aluminio Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-511VC-NEG-GEN','511VC','GEN','AC','NEG','511VCACB','Fijación 1 cristal VC - Acero Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-511VC-PUL-GEN','511VC','GEN','AC','PUL','511VCACPU','Fijación 1 cristal VC - Acero Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-511VC-MAT-GEN','511VC','GEN','FE','MAT','511VCFIA','Fijación 1 cristal VC - Fierro Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-511VC-NEG-GEN','511VC','GEN','FE','NEG','511VCFIB','Fijación 1 cristal VC - Fierro Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-615VC-MAT-GEN','615VC','GEN','AL','MAT','615VCACA','Picaporte muro VC - Aluminio Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-615VC-NEG-GEN','615VC','GEN','AL','NEG','615VCACB','Picaporte muro VC - Aluminio Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-615VC-PUL-GEN','615VC','GEN','AC','PUL','615VCACPU','Picaporte muro VC - Acero Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 2: BASES PARA PERNOS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('BAPC', 'Base perno cuadrado', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('BAPR', 'Base perno rectangular', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-BAPC-MAT-GEN','BAPC','GEN','AC','MAT','BAPCACA','Base perno cuadrado - Acero Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BAPC-NEG-GEN','BAPC','GEN','AC','NEG','BAPCACB','Base perno cuadrado - Acero Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-BAPC-MAT-GEN','BAPC','GEN','FE','MAT','BAPCFIA','Base perno cuadrado - Fierro Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-BAPC-NEG-GEN','BAPC','GEN','FE','NEG','BAPCFIB','Base perno cuadrado - Fierro Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BAPR-MAT-GEN','BAPR','GEN','AC','MAT','BAPRACA','Base perno rectangular - Acero Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BAPR-NEG-GEN','BAPR','GEN','AC','NEG','BAPRACB','Base perno rectangular - Acero Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-BAPR-MAT-GEN','BAPR','GEN','FE','MAT','BAPRFIA','Base perno rectangular - Fierro Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-BAPR-NEG-GEN','BAPR','GEN','FE','NEG','BAPRFiB','Base perno rectangular - Fierro Negro','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 3: BISAGRAS (BI)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('BI35', 'Bisagra Serie 35', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('BI43', 'Bisagra Serie 43', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('BIDPLVM', 'Bisagra ducha plegadiza vidrio-muro', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('BIDPLVV', 'Bisagra ducha plegadiza vidrio-vidrio', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-BI35-MAT-GEN','BI35','GEN','AL','MAT','BI35A','Bisagra Serie 35 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BI35-NEG-GEN','BI35','GEN','AL','NEG','BI35B','Bisagra Serie 35 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BI35-BRO-GEN','BI35','GEN','AL','BRO','BI35BR','Bisagra Serie 35 - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BI35-BLA-GEN','BI35','GEN','AL','BLA','BI35P','Bisagra Serie 35 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BI43-NEG-GEN','BI43','GEN','AL','NEG','BI43B','Bisagra Serie 43 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BIDPLVM-PUL-GEN','BIDPLVM','GEN','AC','PUL','BIDPLVM-PU','Bisagra ducha plegadiza VM - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BIDPLVM-SAT-GEN','BIDPLVM','GEN','AC','SAT','BIDPLVM-ST','Bisagra ducha plegadiza VM - Satinado','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BIDPLVV-PUL-GEN','BIDPLVV','GEN','AC','PUL','BIDPLVV-PU','Bisagra ducha plegadiza VV - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BIDPLVV-SAT-GEN','BIDPLVV','GEN','AC','SAT','BIDPLVV-ST','Bisagra ducha plegadiza VV - Satinado','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 4: BRAZOS EXTENSORES (BRA)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('BRA25', 'Brazo extensor 25cm Serie 3831/42', 'ACC', 'SYS_GEN', 250, 0.00),
('BRA30', 'Brazo extensor 30cm Serie 3831/42', 'ACC', 'SYS_GEN', 300, 0.00),
('BRA40', 'Brazo extensor 40cm Serie 3831/42', 'ACC', 'SYS_GEN', 400, 0.00),
('BRA60', 'Brazo extensor 60cm Serie 3831/42', 'ACC', 'SYS_GEN', 600, 0.00),
('BRA65', 'Brazo extensor 65cm Serie 3831/42', 'ACC', 'SYS_GEN', 650, 0.00),
('BRA90', 'Brazo extensor 90cm Serie 3831/42', 'ACC', 'SYS_GEN', 900, 0.00),
('BRA95', 'Brazo extensor 95cm Serie 3831/42', 'ACC', 'SYS_GEN', 950, 0.00),
('BRALIAL', 'Brazo limitador hoja batiente', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-BRA25-MAT-GEN','BRA25','GEN','AC','MAT','BRA25ACA','Brazo ext 25cm Acero S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BRA25-NEG-GEN','BRA25','GEN','AC','NEG','BRA25ACB','Brazo ext 25cm Acero S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA25-MAT-FER','BRA25','FER','AL','MAT','BRA25FA','Brazo ext 25cm Fermax S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA25-NEG-FER','BRA25','FER','AL','NEG','BRA25FB','Brazo ext 25cm Fermax S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BRA30-MAT-GEN','BRA30','GEN','AC','MAT','BRA30ACA','Brazo ext 30cm Acero S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-BRA30-NEG-GEN','BRA30','GEN','AC','NEG','BRA30ACB','Brazo ext 30cm Acero S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA30-MAT-FER','BRA30','FER','AL','MAT','BRA30FA','Brazo ext 30cm Fermax S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA30-NEG-FER','BRA30','FER','AL','NEG','BRA30FB','Brazo ext 30cm Fermax S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA40-MAT-FER','BRA40','FER','AL','MAT','BRA40FA','Brazo ext 40cm Fermax S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA40-NEG-FER','BRA40','FER','AL','NEG','BRA40FB','Brazo ext 40cm Fermax S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA40-MAT-UDI','BRA40','UDI','AL','MAT','BRA40UA','Brazo ext 40cm Udinese S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA40-NEG-UDI','BRA40','UDI','AL','NEG','BRA40UB','Brazo ext 40cm Udinese S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA60-MAT-FER','BRA60','FER','AL','MAT','BRA60FA','Brazo ext 60cm Fermax S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA60-NEG-FER','BRA60','FER','AL','NEG','BRA60FB','Brazo ext 60cm Fermax S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA65-MAT-UDI','BRA65','UDI','AL','MAT','BRA65UA','Brazo ext 65cm Udinese S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA65-NEG-UDI','BRA65','UDI','AL','NEG','BRA65UB','Brazo ext 65cm Udinese S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA90-MAT-UDI','BRA90','UDI','AL','MAT','BRA90UA','Brazo ext 90cm Udinese S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA90-NEG-UDI','BRA90','UDI','AL','NEG','BRA90UB','Brazo ext 90cm Udinese S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA95-MAT-FER','BRA95','FER','AL','MAT','BRA95FA','Brazo ext 95cm Fermax S3831/42 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRA95-NEG-FER','BRA95','FER','AL','NEG','BRA95FB','Brazo ext 95cm Fermax S3831/42 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-BRALIAL-MAT-GEN','BRALIAL','GEN','AL','MAT','BRALIAL','Brazo limitador hoja batiente - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 5: BURLETES (BU) Y FELPAS (FE)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('BU20', 'Burlete 4mm Serie 20', 'CON', 'SYS_GEN', NULL, 0.00),
('BU8062', 'Burlete 8mm Serie 62/80', 'CON', 'SYS_GEN', NULL, 0.00),
('BUDC', 'Burlete DC Serie 3831/42/45', 'CON', 'SYS_GEN', NULL, 0.00),
('FE10', 'Felpa F-10 4mm', 'CON', 'SYS_GEN', NULL, 0.00),
('FE15', 'Felpa F-15 7mm', 'CON', 'SYS_GEN', NULL, 0.00),
('FE20', 'Felpa F-20 9.5mm', 'CON', 'SYS_GEN', NULL, 0.00),
('FESY', 'Felpa Systral', 'CON', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('PVC-BU20-NEG-GEN','BU20','GEN','PVC','NEG','BU20B','Burlete 4mm S20 - Negro','MT',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-BU8062-NEG-GEN','BU8062','GEN','PVC','NEG','BU8062B','Burlete 8mm S62/80 - Negro','MT',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-BUDC-NEG-GEN','BUDC','GEN','PVC','NEG','BUDCB','Burlete DC S3831/42/45 - Negro','MT',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE10-NEG-GEN','FE10','GEN','PVC','NEG','FE10B','Felpa F-10 4mm - Negro','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE10-GRI-GEN','FE10','GEN','PVC','GRI','FE10G','Felpa F-10 4mm - Gris','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE10-BLA-GEN','FE10','GEN','PVC','BLA','FE10P','Felpa F-10 4mm - Blanco','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE15-NEG-GEN','FE15','GEN','PVC','NEG','FE15B','Felpa F-15 7mm - Negro','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE15-GRI-GEN','FE15','GEN','PVC','GRI','FE15G','Felpa F-15 7mm - Gris','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE15-BLA-GEN','FE15','GEN','PVC','BLA','FE15P','Felpa F-15 7mm - Blanco','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE20-NEG-GEN','FE20','GEN','PVC','NEG','FE20B','Felpa F-20 9.5mm - Negro','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE20-GRI-GEN','FE20','GEN','PVC','GRI','FE20G','Felpa F-20 9.5mm - Gris','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FE20-BLA-GEN','FE20','GEN','PVC','BLA','FE20P','Felpa F-20 9.5mm - Blanco','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FESY-NEG-GEN','FESY','GEN','PVC','NEG','FESYB','Felpa Systral - Negro','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FESY-GRI-GEN','FESY','GEN','PVC','GRI','FESYG','Felpa Systral - Gris','CONO',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-FESY-BLA-GEN','FESY','GEN','PVC','BLA','FESYP','Felpa Systral - Blanco','CONO',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 6: CANOPLAS Y CHAPAS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('CA11', 'Canopla 1x1 cuadrada', 'ACC', 'SYS_GEN', NULL, 0.00),
('CA112', 'Canopla 1 1/2 cuadrada', 'ACC', 'SYS_GEN', NULL, 0.00),
('CA2431', 'Canopla tubo cuadrado balaustre 2431', 'ACC', 'SYS_GEN', NULL, 0.00),
('CH35', 'Chapa Serie 35', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CH323C', 'Cerradura embutir puerta corrediza', 'ACC', 'SYS_GEN', NULL, 0.00),
('CH325', 'Cerradura 325', 'ACC', 'SYS_GEN', NULL, 0.00),
('CHSBRAC', 'Cerradura sobreponer acero', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CHSBR', 'Cerradura sobreponer negra', 'ACCTE', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-CA11-GEN','CA11','GEN','AL','MAT','CA11','Canopla 1x1 cuadrada','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CA112-GEN','CA112','GEN','AL','MAT','CA112','Canopla 1 1/2 cuadrada','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CA2431-GEN','CA2431','GEN','AL','MAT','CA2431','Canopla balaustre 2431','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH35-MAT-GEN','CH35','GEN','AL','MAT','CH35A','Chapa Serie 35 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH35-NEG-GEN','CH35','GEN','AL','NEG','CH35B','Chapa Serie 35 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH35-BRO-GEN','CH35','GEN','AL','BRO','CH35BR','Chapa Serie 35 - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH35-BLA-GEN','CH35','GEN','AL','BLA','CH35P','Chapa Serie 35 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH323C-GEN','CH323C','GEN','AL','MAT','CH323C','Cerradura embutir puerta corrediza','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CH325-GEN','CH325','UDI','AL','MAT','CH325U','Cerradura 325 Udinese','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHSBRAC-PUL-GEN','CHSBRAC','GEN','AC','PUL','CHSBRACPU','Cerradura sobreponer - Acero','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-CHSBR-NEG-GEN','CHSBR','GEN','AC','NEG','CHSBRB','Cerradura sobreponer - Negra','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 7: GARRUCHAS (GA/GI)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('GA20', 'Garrucha armada Serie 20', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA25D', 'Garrucha Serie 25 doble', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA25S', 'Garrucha Serie 25 simple', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA3131', 'Garrucha 3131/VCO031', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA62', 'Garrucha Serie 62', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA80', 'Garrucha Serie 80', 'ACC', 'SYS_GEN', NULL, 0.00),
('GA80R', 'Garrucha regulable S80', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI331', 'Garrucha perfil 7906 alta doble', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI334', 'Garrucha doble perfil 9150', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI339', 'Garrucha nova doble perfil 8220', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI341', 'Garrucha perfil 7906 alta doble AL', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI342', 'Garrucha perfil 7908 mampara baja', 'ACC', 'SYS_GEN', NULL, 0.00),
('GI343', 'Garrucha R-20 con aleta doble', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-GA20-GEN','GA20','GEN','AL','MAT','GA20','Garrucha armada S20','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA25D-GEN','GA25D','GEN','AL','MAT','GA25D','Garrucha S25 doble','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA25S-GEN','GA25S','GEN','AL','MAT','GA25S','Garrucha S25 simple','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA3131-GEN','GA3131','GEN','AL','MAT','GA3131','Garrucha 3131/VCO031','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA62-GEN','GA62','GEN','AL','MAT','GA62','Garrucha Serie 62','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA80-GEN','GA80','GEN','AL','MAT','GA80','Garrucha Serie 80','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GA80R-GEN','GA80R','GEN','AL','MAT','GA80R','Garrucha regulable S80','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-GI331-GEN','GI331','GEN','FE','MAT','GI331','Garrucha 7906 alta doble - Fierro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GI334-GEN','GI334','GEN','AL','MAT','GI334AL','Garrucha doble 9150 - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-GI334-GEN','GI334','GEN','FE','MAT','GI334FI','Garrucha doble 9150 - Fierro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GI339-GEN','GI339','GEN','AL','MAT','GI339','Garrucha nova doble 8220 - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GI341-GEN','GI341','GEN','AL','MAT','GI341','Garrucha 7906 alta doble - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GI342-GEN','GI342','GEN','AL','MAT','GI342','Garrucha 7908 mampara baja - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-GI342-GEN','GI342','GEN','FE','MAT','GI342F','Garrucha 7908 mampara baja - Fierro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GI343-GEN','GI343','GEN','AL','MAT','GI343','Garrucha R-20 aleta doble - Aluminio','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 8: GUÍAS (GU)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('GU31', 'Guía sup/inf Serie 3131', 'ACC', 'SYS_GEN', NULL, 0.00),
('GU43', 'Guía Serie 43', 'ACC', 'SYS_GEN', NULL, 0.00),
('GU80', 'Guía Hermeti-k sup/inf Serie 80', 'ACC', 'SYS_GEN', NULL, 0.00),
('GUS20', 'Guía superior 03 Serie 20', 'ACC', 'SYS_GEN', NULL, 0.00),
('GUSI25', 'Guía sup/inf 04 Serie 25', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-GU31-GEN','GU31','GEN','AL','MAT','GU31','Guía sup/inf S3131','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GU43-GEN','GU43','GEN','AL','MAT','GU43','Guía S43','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GU80-GEN','GU80','GEN','AL','MAT','GU80','Guía Hermeti-k S80','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GUS20-GEN','GUS20','GEN','AL','MAT','GUS20','Guía superior 03 S20','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-GUSI25-GEN','GUSI25','GEN','AL','MAT','GUSI25','Guía sup/inf 04 S25','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 9: JALADORES ADICIONALES
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('JACAC13', 'Jalador redondo 13cm tipo C acero VC', 'ACCTE', 'SYS_GEN', 130, 0.00),
('JACAC25', 'Jalador redondo 25cm tipo C acero VC', 'ACCTE', 'SYS_GEN', 250, 0.00),
('JARAL12', 'Jalador rectangular 12cm aluminio VC', 'ACCTE', 'SYS_GEN', 120, 0.00),
('JARF14', 'Jalador redondo 14cm tipo C fierro', 'ACCTE', 'SYS_GEN', 140, 0.00),
('JASIM', 'Jalador simple nylon', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AC-JACAC13-PUL-GEN','JACAC13','GEN','AC','PUL','JACAC13PU','Jalador redondo 13cm C acero VC - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AC-JACAC25-PUL-GEN','JACAC25','GEN','AC','PUL','JACAC25PU','Jalador redondo 25cm C acero VC - Pulido','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-JARAL12-MAT-GEN','JARAL12','GEN','AL','MAT','JARAL12A','Jalador rectangular 12cm AL VC - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-JARAL12-NEG-GEN','JARAL12','GEN','AL','NEG','JARAL12B','Jalador rectangular 12cm AL VC - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-JARF14-MAT-GEN','JARF14','GEN','FE','MAT','JARF14A','Jalador redondo 14cm C fierro - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-JARF14-NEG-GEN','JARF14','GEN','FE','NEG','JARF14B','Jalador redondo 14cm C fierro - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-JASIM-NEG-GEN','JASIM','GEN','PVC','NEG','JASIMB','Jalador simple nylon - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-JASIM-GRI-GEN','JASIM','GEN','PVC','GRI','JASIMG','Jalador simple nylon - Gris','UND',0,'PEN','2026-02-09',FALSE,0,10),
('PVC-JASIM-BLA-GEN','JASIM','GEN','PVC','BLA','JASIMP','Jalador simple nylon - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 10: MANIJAS (MA)
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('MA3831', 'Manija derecha Serie 3831/42', 'ACC', 'SYS_GEN', NULL, 0.00),
('MA80', 'Manija Serie 80/62', 'ACC', 'SYS_GEN', NULL, 0.00),
('MAHPRYP', 'Manija hoja proyectante pesada recta', 'ACC', 'SYS_GEN', NULL, 0.00),
('MAHPRYPC', 'Manija hoja proyectante pesada curva', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-MA3831-MAT-FER','MA3831','FER','AL','MAT','MA3831FA','Manija der. S3831/42 Fermax - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-NEG-FER','MA3831','FER','AL','NEG','MA3831FB','Manija der. S3831/42 Fermax - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-BRO-FER','MA3831','FER','AL','BRO','MA3831FBR','Manija der. S3831/42 Fermax - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-BLA-FER','MA3831','FER','AL','BLA','MA3831FP','Manija der. S3831/42 Fermax - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-MAT-UDI','MA3831','UDI','AL','MAT','MA3831UA','Manija der. S3831/42 Udinese - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-NEG-UDI','MA3831','UDI','AL','NEG','MA3831UB','Manija der. S3831/42 Udinese - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-BRO-UDI','MA3831','UDI','AL','BRO','MA3831UBR','Manija der. S3831/42 Udinese - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA3831-BLA-UDI','MA3831','UDI','AL','BLA','MA3831UP','Manija der. S3831/42 Udinese - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA80-MAT-FER','MA80','FER','AL','MAT','MA80FA','Manija S80/62 Fermax - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA80-NEG-FER','MA80','FER','AL','NEG','MA80FB','Manija S80/62 Fermax - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA80-BRO-FER','MA80','FER','AL','BRO','MA80FBR','Manija S80/62 Fermax - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MA80-BLA-FER','MA80','FER','AL','BLA','MA80FP','Manija S80/62 Fermax - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MAHPRYP-MAT-GEN','MAHPRYP','GEN','AL','MAT','MAHPRYPA','Manija hoja proyectante recta - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MAHPRYP-NEG-GEN','MAHPRYP','GEN','AL','NEG','MAHPRYPB','Manija hoja proyectante recta - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MAHPRYP-BRO-GEN','MAHPRYP','GEN','AL','BRO','MAHPRYPBR','Manija hoja proyectante recta - Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MAHPRYPC-MAT-GEN','MAHPRYPC','GEN','AL','MAT','MAHPRYPCA','Manija hoja proyectante curva - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-MAHPRYPC-NEG-GEN','MAHPRYPC','GEN','AL','NEG','MAHPRYPCB','Manija hoja proyectante curva - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- SECCIÓN 11: SISTEMAS Y ACCESORIOS DIVERSOS
-- ============================================================================

INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('JGPV', 'Juego Pívot', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('LIMHB', 'Limitador hoja batiente', 'ACC', 'SYS_GEN', NULL, 0.00),
('CLPVITR', 'Clip Sistema Vitroven', 'ACC', 'SYS_GEN', NULL, 0.00),
('OPVITR', 'Operador Sistema Vitroven', 'ACC', 'SYS_GEN', NULL, 0.00),
('PLALSITDI', 'Placa Sistema Directo Aluminio', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('PLFSITDI', 'Placa Sistema Directo Fierro', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('PLJPV', 'Placa juego Pívot', 'ACCTE', 'SYS_GEN', NULL, 0.00),
('CTRAPMPRY', 'Contraplaca manija proyectante', 'ACC', 'SYS_GEN', NULL, 0.00),
('CTRAS', 'Contraseguro S20/25', 'ACC', 'SYS_GEN', NULL, 0.00),
('EENS80', 'Escuadra ensamble Serie 80', 'ACC', 'SYS_GEN', NULL, 0.00),
('CIMPI', 'Cierre MPI', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-JGPV-MAT-GEN','JGPV','GEN','AL','MAT','JGPVA','Juego Pívot - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-JGPV-NEG-GEN','JGPV','GEN','AL','NEG','JGPVB','Juego Pívot - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-LIMHB-MAT-GEN','LIMHB','GEN','AL','MAT','LIMHBA','Limitador hoja batiente - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-LIMHB-NEG-GEN','LIMHB','GEN','AL','NEG','LIMHBB','Limitador hoja batiente - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-LIMHB-BLA-GEN','LIMHB','GEN','AL','BLA','LIMHBP','Limitador hoja batiente - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CLPVITR-MAT-GEN','CLPVITR','GEN','AL','MAT','CLPVITRA','Clip Vitroven - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CLPVITR-NEG-GEN','CLPVITR','GEN','AL','NEG','CLPVITRB','Clip Vitroven - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CLPVITR-BLA-GEN','CLPVITR','GEN','AL','BLA','CLPVITRP','Clip Vitroven - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-OPVITR-MAT-GEN','OPVITR','GEN','AL','MAT','OPVITRA','Operador Vitroven - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-OPVITR-NEG-GEN','OPVITR','GEN','AL','NEG','OPVITRB','Operador Vitroven - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-OPVITR-BLA-GEN','OPVITR','GEN','AL','BLA','OPVITRP','Operador Vitroven - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PLALSITDI-MAT-GEN','PLALSITDI','GEN','AL','MAT','PLALSITDIA','Placa Sistema Directo - Aluminio Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PLALSITDI-NEG-GEN','PLALSITDI','GEN','AL','NEG','PLALSITDIB','Placa Sistema Directo - Aluminio Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('FE-PLFSITDI-MAT-GEN','PLFSITDI','GEN','FE','MAT','PLFSITDIA','Placa Sistema Directo - Fierro Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PLJPV-MAT-GEN','PLJPV','GEN','AL','MAT','PLJPVA','Placa juego Pívot - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-PLJPV-NEG-GEN','PLJPV','GEN','AL','NEG','PLJPVB','Placa juego Pívot - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAPMPRY-MAT-GEN','CTRAPMPRY','GEN','AL','MAT','CTRAPMPRYA','Contraplaca manija proyectante - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAPMPRY-NEG-GEN','CTRAPMPRY','GEN','AL','NEG','CTRAPMPRYB','Contraplaca manija proyectante - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-MAT-FER','CTRAS','FER','AL','MAT','CTRASFA','Contraseguro S20/25 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-NEG-FER','CTRAS','FER','AL','NEG','CTRASFB','Contraseguro S20/25 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-BLA-FER','CTRAS','FER','AL','BLA','CTRASFP','Contraseguro S20/25 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-MAT-HPD','CTRAS','HPD','AL','MAT','CTRASHA','Contraseguro S20/25 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-NEG-HPD','CTRAS','HPD','AL','NEG','CTRASHB','Contraseguro S20/25 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-BLA-HPD','CTRAS','HPD','AL','BLA','CTRASHP','Contraseguro S20/25 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-EENS80-GEN','EENS80','GEN','AL','MAT','EENS80','Escuadra ensamble S80','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CIMPI-GEN','CIMPI','GEN','AL','MAT','CIMPI','Cierre MPI','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
-- Total aproximado: 120+ plantillas, 180+ variantes
-- Familias: ACCTE (Accesorios Cristal Templado), ACC (Accesorios), CON (Consumibles)
-- Materiales: AC, AL, FE, PVC, ZA, CR
-- Acabados: MAT, NEG, PUL, SAT, BLA, BRO, GRI
-- Marcas: GEN, FER, UDI, HPD, DOR
-- ============================================================================
