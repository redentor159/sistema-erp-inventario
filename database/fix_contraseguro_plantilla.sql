-- ============================================================================
-- CORRECCIÓN: CONTRASEGURO - CONSOLIDAR PLANTILLAS POR MARCA
-- Problema: CTRASF y CTRASH incluyen marca en plantilla
-- Solución: Unificar en plantilla CTRAS con variantes por marca (FER/HPD)
-- Fecha: 2026-02-09
-- ============================================================================

-- PASO 1: Crear la plantilla correcta si no existe
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm, peso_teorico_kg) 
VALUES ('CTRAS', 'Contraseguro S20/25', 'ACC', 'SYS_GEN', NULL, 0.00)
ON CONFLICT (id_plantilla) DO NOTHING;

-- PASO 2: Actualizar variantes que apuntan a CTRASF para que apunten a CTRAS
UPDATE cat_productos_variantes 
SET id_plantilla = 'CTRAS',
    id_sku = REPLACE(id_sku, '-CTRASF-', '-CTRAS-'),
    nombre_completo = REPLACE(nombre_completo, 'Fermax S20/25', 'S20/25')
WHERE id_plantilla = 'CTRASF';

-- PASO 3: Actualizar variantes que apuntan a CTRASH para que apunten a CTRAS
UPDATE cat_productos_variantes 
SET id_plantilla = 'CTRAS',
    id_sku = REPLACE(id_sku, '-CTRASH-', '-CTRAS-'),
    nombre_completo = REPLACE(nombre_completo, 'HPD S20/25', 'S20/25')
WHERE id_plantilla = 'CTRASH';

-- PASO 4: Eliminar plantillas incorrectas (solo si no tienen dependencias)
DELETE FROM cat_plantillas WHERE id_plantilla IN ('CTRASF', 'CTRASH');

-- ============================================================================
-- VERIFICACIÓN POST-CORRECCIÓN
-- ============================================================================

-- Verificar plantilla consolidada
SELECT * FROM cat_plantillas WHERE id_plantilla = 'CTRAS';

-- Verificar variantes migradas (debe haber 6: 3 Fermax + 3 HPD)
SELECT id_sku, id_plantilla, id_marca, id_acabado, nombre_completo 
FROM cat_productos_variantes 
WHERE id_plantilla = 'CTRAS'
ORDER BY id_marca, id_acabado;

-- Verificar que no queden referencias a plantillas antiguas
SELECT COUNT(*) as variantes_huerfanas
FROM cat_productos_variantes 
WHERE id_plantilla IN ('CTRASF', 'CTRASH');

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Plantilla: CTRAS (1 plantilla)
-- Variantes:
--   AL-CTRAS-MAT-FER  (Contraseguro S20/25 - Mate, Marca Fermax)
--   AL-CTRAS-NEG-FER  (Contraseguro S20/25 - Negro, Marca Fermax)
--   AL-CTRAS-BLA-FER  (Contraseguro S20/25 - Blanco, Marca Fermax)
--   AL-CTRAS-MAT-HPD  (Contraseguro S20/25 - Mate, Marca HPD)
--   AL-CTRAS-NEG-HPD  (Contraseguro S20/25 - Negro, Marca HPD)
--   AL-CTRAS-BLA-HPD  (Contraseguro S20/25 - Blanco, Marca HPD)
-- ============================================================================
