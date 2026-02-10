-- ============================================================================
-- CORRECCIÓN V2: CONTRASEGURO - CONSOLIDAR PLANTILLAS POR MARCA
-- Maneja duplicados existentes
-- Fecha: 2026-02-09
-- ============================================================================

-- DIAGNÓSTICO: Ver estado actual
SELECT 'Estado Actual de Contraseguros:' as diagnostico;
SELECT id_sku, id_plantilla, id_marca, id_acabado, nombre_completo
FROM cat_productos_variantes 
WHERE id_sku LIKE '%CTRAS%'
ORDER BY id_sku;

-- ============================================================================
-- ESTRATEGIA: Eliminar duplicados y recrear con estructura correcta
-- ============================================================================

-- PASO 1: Crear plantilla correcta si no existe
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) 
VALUES ('CTRAS', 'Contraseguro S20/25', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- PASO 2: Backup de datos existentes (por si acaso)
CREATE TEMP TABLE temp_ctras_backup AS
SELECT * FROM cat_productos_variantes 
WHERE id_plantilla IN ('CTRASF', 'CTRASH') OR id_sku LIKE 'AL-CTRAS-%';

SELECT COUNT(*) as registros_respaldados FROM temp_ctras_backup;

-- PASO 3: Eliminar TODAS las variantes relacionadas (antiguas y nuevas)
DELETE FROM cat_productos_variantes 
WHERE id_plantilla IN ('CTRASF', 'CTRASH') 
   OR id_sku LIKE 'AL-CTRAS-%';

-- PASO 4: Insertar variantes con estructura correcta
INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, cod_proveedor, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion, fecha_act_precio, es_templado, espesor_mm, stock_minimo) VALUES
-- Fermax (FER)
('AL-CTRAS-MAT-FER','CTRAS','FER','AL','MAT','CTRASFA','Contraseguro S20/25 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-NEG-FER','CTRAS','FER','AL','NEG','CTRASFB','Contraseguro S20/25 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-BLA-FER','CTRAS','FER','AL','BLA','CTRASFP','Contraseguro S20/25 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10),
-- HPD
('AL-CTRAS-MAT-HPD','CTRAS','HPD','AL','MAT','CTRASHA','Contraseguro S20/25 - Mate','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-NEG-HPD','CTRAS','HPD','AL','NEG','CTRASHB','Contraseguro S20/25 - Negro','UND',0,'PEN','2026-02-09',FALSE,0,10),
('AL-CTRAS-BLA-HPD','CTRAS','HPD','AL','BLA','CTRASHP','Contraseguro S20/25 - Blanco','UND',0,'PEN','2026-02-09',FALSE,0,10);

-- PASO 5: Eliminar plantillas incorrectas
DELETE FROM cat_plantillas WHERE id_plantilla IN ('CTRASF', 'CTRASH');

-- ============================================================================
-- VERIFICACIÓN POST-CORRECCIÓN
-- ============================================================================

SELECT 'Resultado Final:' as verificacion;

-- Verificar plantilla consolidada
SELECT 'Plantilla CTRAS:' as item, * FROM cat_plantillas WHERE id_plantilla = 'CTRAS';

-- Verificar variantes migradas (debe haber 6: 3 Fermax + 3 HPD)
SELECT 'Variantes CTRAS (6 esperadas):' as item;
SELECT id_sku, id_plantilla, id_marca, id_acabado, nombre_completo 
FROM cat_productos_variantes 
WHERE id_plantilla = 'CTRAS'
ORDER BY id_marca, id_acabado;

-- Verificar que no queden referencias a plantillas antiguas
SELECT 'Verificar plantillas antiguas eliminadas (0 esperado):' as item, COUNT(*) as count
FROM cat_plantillas 
WHERE id_plantilla IN ('CTRASF', 'CTRASH');

-- Verificar que no queden variantes huérfanas
SELECT 'Verificar variantes huérfanas (0 esperado):' as item, COUNT(*) as count
FROM cat_productos_variantes 
WHERE id_plantilla IN ('CTRASF', 'CTRASH');

-- ============================================================================
-- RESUMEN
-- ============================================================================
-- Acción: Eliminación y recreación completa
-- Plantilla antigua CTRASF → eliminada
-- Plantilla antigua CTRASH → eliminada
-- Plantilla nueva: CTRAS (1 plantilla)
-- Variantes nuevas: 6 (3 FER + 3 HPD)
-- ============================================================================
