-- ============================================================================
-- Paso 1: Agregar columnas de metadata visual a mst_recetas_modelos
-- para que el frontend sepa CÓMO dibujar cada modelo (tipo_dibujo)
-- y qué configuración de hojas usar por defecto (config_hojas_default).
-- ============================================================================

ALTER TABLE public.mst_recetas_modelos 
ADD COLUMN IF NOT EXISTS tipo_dibujo VARCHAR(50),
ADD COLUMN IF NOT EXISTS config_hojas_default VARCHAR(20);

COMMENT ON COLUMN public.mst_recetas_modelos.tipo_dibujo 
IS 'Instrucción al frontend de cómo renderizar: Corrediza, Proyectante, Batiente, Fijo';

COMMENT ON COLUMN public.mst_recetas_modelos.config_hojas_default 
IS 'Configuración de hojas por defecto. Ej: CC (2 corredizas), FCCF (Fijo+2Corr+Fijo), F (Fijo), P (Proyectante), A (Abatible)';

-- ============================================================================
-- Backfill basado en nombre_comercial e id_modelo (ya que no existe tipo_apertura)
-- IMPORTANTE: Ajusta estas sentencias según tus modelos reales.
-- Ejemplo heurístico: si el nombre contiene cierta palabra clave.
-- ============================================================================

-- Modelos Corredizos (id_modelo suele contener "CC", "S42", "S25", etc.)
UPDATE mst_recetas_modelos 
SET tipo_dibujo = 'Corrediza', config_hojas_default = 'CC'
WHERE (LOWER(nombre_comercial) LIKE '%corrediza%'
   OR LOWER(id_modelo) LIKE '%cc%')
  AND tipo_dibujo IS NULL;

-- Modelos Proyectantes (id_modelo suele contener "PY", "S42P", etc.)  
UPDATE mst_recetas_modelos 
SET tipo_dibujo = 'Proyectante', config_hojas_default = 'P'
WHERE (LOWER(nombre_comercial) LIKE '%proyectante%'
   OR LOWER(id_modelo) LIKE '%py%')
  AND tipo_dibujo IS NULL;

-- Modelos Batientes (id_modelo suele contener "BA", "S3831", etc.)
UPDATE mst_recetas_modelos 
SET tipo_dibujo = 'Batiente', config_hojas_default = 'A'
WHERE (LOWER(nombre_comercial) LIKE '%batiente%'
   OR LOWER(nombre_comercial) LIKE '%abatible%')
  AND tipo_dibujo IS NULL;

-- Todo lo que no matcheó → Fijo por defecto
UPDATE mst_recetas_modelos 
SET tipo_dibujo = 'Fijo', config_hojas_default = 'F'
WHERE tipo_dibujo IS NULL;

-- Refrescar la caché de schema de PostgREST para Supabase
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICACIÓN: Ejecuta esto después para revisar el resultado:
-- SELECT id_modelo, nombre_comercial, tipo_dibujo, config_hojas_default 
-- FROM mst_recetas_modelos ORDER BY id_modelo;
-- 
-- Si algún modelo quedó mal clasificado, puedes corregirlo manualmente:
-- UPDATE mst_recetas_modelos SET tipo_dibujo = 'Corrediza', config_hojas_default = 'FCCF'
-- WHERE id_modelo = 'TU_MODELO_AQUI';
-- ============================================================================
