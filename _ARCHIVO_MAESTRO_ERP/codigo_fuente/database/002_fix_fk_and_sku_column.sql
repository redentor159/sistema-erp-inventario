-- =================================================================================================
-- MIGRACIÓN 002: FK id_modelo + columna id_sku_catalogo
-- Fecha: 2026-02-13
-- Descripción:
--   1. Agrega FK id_modelo → mst_recetas_modelos(id_modelo)
--   2. Agrega columna id_sku_catalogo para guardar SKU completo de accesorios
--   3. Backfill id_sku_catalogo desde campos existentes
-- =================================================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FK: id_modelo → mst_recetas_modelos
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mst_recetas_ingenieria_id_modelo_fkey'
  ) THEN
    ALTER TABLE mst_recetas_ingenieria
      ADD CONSTRAINT mst_recetas_ingenieria_id_modelo_fkey
      FOREIGN KEY (id_modelo) REFERENCES mst_recetas_modelos(id_modelo);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Columna id_sku_catalogo (SKU completo para accesorios)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE mst_recetas_ingenieria
  ADD COLUMN IF NOT EXISTS id_sku_catalogo TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Backfill: reconstruir id_sku_catalogo desde campos existentes
--    Formato: id_material-id_plantilla-id_acabado-id_marca (si los 4 existen)
--    Solo para accesorios que tienen los campos poblados
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE mst_recetas_ingenieria
SET id_sku_catalogo = 
  CONCAT_WS('-',
    NULLIF(id_material_receta, ''),
    NULLIF(id_plantilla, ''),
    NULLIF(id_acabado_receta, ''),
    NULLIF(id_marca_receta, '')
  )
WHERE tipo IN ('Accesorio', 'Servicio')
  AND id_sku_catalogo IS NULL
  AND id_plantilla IS NOT NULL
  AND id_material_receta IS NOT NULL;
