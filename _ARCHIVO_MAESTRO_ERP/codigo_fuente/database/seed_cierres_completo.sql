-- ============================================================================
-- CIERRES LATERALES (CI y CILL) - ALUMINIO
-- SKU: MATERIAL-PLANTILLA-ACABADO-MARCA (ej: AL-CI20-MAT-FER)
-- Fecha: 2026-02-09 | ON CONFLICT DO NOTHING
-- ============================================================================

-- PLANTILLAS (5)
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) VALUES
('CI20', 'Cierre lateral 14cm Serie 20', 'ACC', 'SYS_GEN', 140, 0.00),
('CI25', 'Cierre lateral 19cm Serie 25', 'ACC', 'SYS_GEN', 190, 0.00),
('CI8062', 'Cierre lateral Serie 80/62', 'ACC', 'SYS_GEN', NULL, 0.00),
('CILL20', 'Cierre lateral con llave 14cm Serie 20', 'ACC', 'SYS_GEN', 140, 0.00),
('CILL25', 'Cierre lateral con llave 19cm Serie 25', 'ACC', 'SYS_GEN', 190, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- VARIANTES SERIE CI20 - Fermax (12 variantes)
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
('AL-CI20-MAT-FER','CI20','FER','AL','MAT','CI20FA','Cierre lateral 14cm S20 - Fermax Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-NEG-FER','CI20','FER','AL','NEG','CI20FB','Cierre lateral 14cm S20 - Fermax Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-BRO-FER','CI20','FER','AL','BRO','CI20FBR','Cierre lateral 14cm S20 - Fermax Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-BLA-FER','CI20','FER','AL','BLA','CI20FP','Cierre lateral 14cm S20 - Fermax Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-MAT-GEN','CI20','GEN','AL','MAT','CI20GA','Cierre lateral 14cm S20 - Genérico Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-NEG-GEN','CI20','GEN','AL','NEG','CI20GB','Cierre lateral 14cm S20 - Genérico Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-BRO-GEN','CI20','GEN','AL','BRO','CI20GBR','Cierre lateral 14cm S20 - Genérico Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-BLA-GEN','CI20','GEN','AL','BLA','CI20GP','Cierre lateral 14cm S20 - Genérico Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-MAT-UDI','CI20','UDI','AL','MAT','CI20UA','Cierre lateral 14cm S20 - Udinese Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-NEG-UDI','CI20','UDI','AL','NEG','CI20UB','Cierre lateral 14cm S20 - Udinese Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-BRO-UDI','CI20','UDI','AL','BRO','CI20UBR','Cierre lateral 14cm S20 - Udinese Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI20-BLA-UDI','CI20','UDI','AL','BLA','CI20UP','Cierre lateral 14cm S20 - Udinese Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),

-- VARIANTES SERIE CI25 (12 variantes)
('AL-CI25-MAT-FER','CI25','FER','AL','MAT','CI25FA','Cierre lateral 19cm S25 - Fermax Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-NEG-FER','CI25','FER','AL','NEG','CI25FB','Cierre lateral 19cm S25 - Fermax Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-BRO-FER','CI25','FER','AL','BRO','CI25FBR','Cierre lateral 19cm S25 - Fermax Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-BLA-FER','CI25','FER','AL','BLA','CI25FP','Cierre lateral 19cm S25 - Fermax Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-MAT-GEN','CI25','GEN','AL','MAT','CI25GA','Cierre lateral 19cm S25 - Genérico Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-NEG-GEN','CI25','GEN','AL','NEG','CI25GB','Cierre lateral 19cm S25 - Genérico Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-BRO-GEN','CI25','GEN','AL','BRO','CI25GBR','Cierre lateral 19cm S25 - Genérico Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-BLA-GEN','CI25','GEN','AL','BLA','CI25GP','Cierre lateral 19cm S25 - Genérico Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-MAT-UDI','CI25','UDI','AL','MAT','CI25UA','Cierre lateral 19cm S25 - Udinese Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-NEG-UDI','CI25','UDI','AL','NEG','CI25UB','Cierre lateral 19cm S25 - Udinese Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-BRO-UDI','CI25','UDI','AL','BRO','CI25UBR','Cierre lateral 19cm S25 - Udinese Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI25-BLA-UDI','CI25','UDI','AL','BLA','CI25UP','Cierre lateral 19cm S25 - Udinese Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),

-- VARIANTES SERIE CI8062 (8 variantes: 4 Fermax, 4 HPD)
('AL-CI8062-MAT-FER','CI8062','FER','AL','MAT','CI8062FA','Cierre lateral S80/62 - Fermax Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-NEG-FER','CI8062','FER','AL','NEG','CI8062FB','Cierre lateral S80/62 - Fermax Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-BRO-FER','CI8062','FER','AL','BRO','CI8062FBR','Cierre lateral S80/62 - Fermax Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-BLA-FER','CI8062','FER','AL','BLA','CI8062FP','Cierre lateral S80/62 - Fermax Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-MAT-HPD','CI8062','HPD','AL','MAT','CI8062HA','Cierre lateral S80/62 - HPD Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-NEG-HPD','CI8062','HPD','AL','NEG','CI8062HB','Cierre lateral S80/62 - HPD Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-BRO-HPD','CI8062','HPD','AL','BRO','CI8062HBR','Cierre lateral S80/62 - HPD Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CI8062-BLA-HPD','CI8062','HPD','AL','BLA','CI8062HP','Cierre lateral S80/62 - HPD Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),

-- VARIANTES SERIE CILL20 - Con llave (12 variantes)
('AL-CILL20-MAT-FER','CILL20','FER','AL','MAT','CILL20FA','Cierre con llave 14cm S20 - Fermax Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-NEG-FER','CILL20','FER','AL','NEG','CILL20FB','Cierre con llave 14cm S20 - Fermax Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-BRO-FER','CILL20','FER','AL','BRO','CILL20FBR','Cierre con llave 14cm S20 - Fermax Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-BLA-FER','CILL20','FER','AL','BLA','CILL20FP','Cierre con llave 14cm S20 - Fermax Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-MAT-GEN','CILL20','GEN','AL','MAT','CILL20GA','Cierre con llave 14cm S20 - Genérico Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-NEG-GEN','CILL20','GEN','AL','NEG','CILL20GB','Cierre con llave 14cm S20 - Genérico Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-BRO-GEN','CILL20','GEN','AL','BRO','CILL20GBR','Cierre con llave 14cm S20 - Genérico Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-BLA-GEN','CILL20','GEN','AL','BLA','CILL20GP','Cierre con llave 14cm S20 - Genérico Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-MAT-UDI','CILL20','UDI','AL','MAT','CILL20UA','Cierre con llave 14cm S20 - Udinese Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-NEG-UDI','CILL20','UDI','AL','NEG','CILL20UB','Cierre con llave 14cm S20 - Udinese Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-BRO-UDI','CILL20','UDI','AL','BRO','CILL20UBR','Cierre con llave 14cm S20 - Udinese Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL20-BLA-UDI','CILL20','UDI','AL','BLA','CILL20UP','Cierre con llave 14cm S20 - Udinese Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),

-- VARIANTES SERIE CILL25 - Con llave (12 variantes)
('AL-CILL25-MAT-FER','CILL25','FER','AL','MAT','CILL25FA','Cierre con llave 19cm S25 - Fermax Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-NEG-FER','CILL25','FER','AL','NEG','CILL25FB','Cierre con llave 19cm S25 - Fermax Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-BRO-FER','CILL25','FER','AL','BRO','CILL25FBR','Cierre con llave 19cm S25 - Fermax Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-BLA-FER','CILL25','FER','AL','BLA','CILL25FP','Cierre con llave 19cm S25 - Fermax Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-MAT-GEN','CILL25','GEN','AL','MAT','CILL25GA','Cierre con llave 19cm S25 - Genérico Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-NEG-GEN','CILL25','GEN','AL','NEG','CILL25GB','Cierre con llave 19cm S25 - Genérico Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-BRO-GEN','CILL25','GEN','AL','BRO','CILL25GBR','Cierre con llave 19cm S25 - Genérico Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-BLA-GEN','CILL25','GEN','AL','BLA','CILL25GP','Cierre con llave 19cm S25 - Genérico Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-MAT-UDI','CILL25','UDI','AL','MAT','CILL25UA','Cierre con llave 19cm S25 - Udinese Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-NEG-UDI','CILL25','UDI','AL','NEG','CILL25UB','Cierre con llave 19cm S25 - Udinese Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-BRO-UDI','CILL25','UDI','AL','BRO','CILL25UBR','Cierre con llave 19cm S25 - Udinese Bronce','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CILL25-BLA-UDI','CILL25','UDI','AL','BLA','CILL25UP','Cierre con llave 19cm S25 - Udinese Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10)
ON CONFLICT (id_sku) DO NOTHING;

-- ============================================================================
-- RESUMEN: 5 Plantillas + 56 Variantes (todas Aluminio)
-- SKU: MATERIAL-PLANTILLA-ACABADO-MARCA (ej: AL-CI20-MAT-FER)
-- Marcas: FER (Fermax), GEN (Genérico), UDI (Udinese), HPD (HPD)
-- Acabados: MAT (Mate/A), NEG (Negro/B), BRO (Bronce/BR), BLA (Blanco/P)
-- ============================================================================
