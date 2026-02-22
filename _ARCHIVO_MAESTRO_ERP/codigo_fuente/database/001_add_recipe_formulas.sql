-- =================================================================================================
-- MIGRACIÓN: Agregar soporte de fórmulas texto a recetas de ingeniería
-- Fecha: 2026-02-13
-- Descripción: Agrega columnas formula_cantidad, formula_perfil, seccion, orden_visual
--              y precio_unitario_manual a mst_recetas_ingenieria.
--              Crea tabla mst_recetas_modelos para metadata de modelos.
-- NOTA: No se eliminan columnas antiguas (factor_*). Ambos sistemas coexisten.
-- =================================================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. AGREGAR COLUMNAS DE FÓRMULA A mst_recetas_ingenieria
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE mst_recetas_ingenieria
  ADD COLUMN IF NOT EXISTS formula_cantidad TEXT,
  ADD COLUMN IF NOT EXISTS formula_perfil TEXT,
  ADD COLUMN IF NOT EXISTS seccion TEXT DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS orden_visual INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_unitario_manual NUMERIC;

-- Constraint para secciones válidas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mst_recetas_ingenieria_seccion_check'
  ) THEN
    ALTER TABLE mst_recetas_ingenieria
      ADD CONSTRAINT mst_recetas_ingenieria_seccion_check
      CHECK (seccion IN (
        'MARCO', 'HOJAS', 'ACCESORIOS_MARCO', 'ACCESORIOS_HOJAS',
        'INTERIOR', 'CRUCES', 'ACCESORIOS_CRUCES', 'GENERAL'
      ));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CREAR TABLA mst_recetas_modelos (metadata de modelos)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mst_recetas_modelos (
  id_modelo TEXT NOT NULL PRIMARY KEY,
  id_sistema TEXT,
  nombre_comercial TEXT NOT NULL,
  num_hojas INTEGER DEFAULT 2,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT mst_recetas_modelos_id_sistema_fkey
    FOREIGN KEY (id_sistema) REFERENCES mst_series_equivalencias(id_sistema)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SEED DE MODELOS EXISTENTES (extraídos de recetas actuales)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO mst_recetas_modelos (id_modelo, id_sistema, nombre_comercial, num_hojas, descripcion) VALUES
  ('S20_2H',          'SYS_20',   'Serie 20 - 2 Hojas',            2, 'Ventana corrediza 2 hojas Serie 20'),
  ('S20_4H_FCCF',     'SYS_20',   'Serie 20 - 4 Hojas FCCF',      4, 'Ventana corrediza 4 hojas FCCF Serie 20'),
  ('S25_2H',          'SYS_25',   'Serie 25 - 2 Hojas',            2, 'Ventana corrediza 2 hojas Serie 25'),
  ('S25_4H_FCCF',     'SYS_25',   'Serie 25 - 4 Hojas FCCF',      4, 'Ventana corrediza 4 hojas FCCF Serie 25'),
  ('S3825_2H',        'SYS_3825', 'Serie 3825 - 2 Hojas',          2, 'Ventana corrediza 2 hojas Serie 3825'),
  ('S3131_2H',        'SYS_29',   'Serie 3131 - 2 Hojas',          2, 'Ventana corrediza 2 hojas Serie 3131'),
  ('S42_1H',          'SYS_42',   'Serie 42 - 1 Hoja Proyectante', 1, 'Ventana proyectante 1 hoja Serie 42'),
  ('S3831_1H',        'SYS_3831', 'Serie 3831 - 1 Hoja Proyectante', 1, 'Ventana proyectante 1 hoja Serie 3831'),
  ('S80_2H',          'SYS_80',   'Serie 80 - 2 Hojas',            2, 'Ventana corrediza 2 hojas Serie 80'),
  ('S80_3H',          'SYS_80',   'Serie 80 - 3 Hojas',            3, 'Ventana corrediza 3 hojas Serie 80'),
  ('S80_4H_FCCF',     'SYS_80',   'Serie 80 - 4 Hojas FCCF',      4, 'Ventana corrediza 4 hojas FCCF Serie 80'),
  ('S62_2H',          'SYS_62',   'Serie 62 - 2 Hojas',            2, 'Ventana corrediza 2 hojas Serie 62'),
  ('S62_3H',          'SYS_62',   'Serie 62 - 3 Hojas',            3, 'Ventana corrediza 3 hojas Serie 62'),
  ('S62_4H_FCCF',     'SYS_62',   'Serie 62 - 4 Hojas FCCF',      4, 'Ventana corrediza 4 hojas FCCF Serie 62'),
  ('SOBRELUZ_25_20',  'SYS_GEN',  'Sobreluz 25/20',                0, 'Sobreluz genérico')
ON CONFLICT (id_modelo) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ACTUALIZAR SECCIONES DEFAULT PARA RECETAS EXISTENTES
-- ─────────────────────────────────────────────────────────────────────────────

-- Perfiles → sección MARCO por defecto (se puede ajustar manualmente luego)
UPDATE mst_recetas_ingenieria
SET seccion = 'MARCO'
WHERE tipo = 'Perfil' AND (seccion IS NULL OR seccion = 'GENERAL');

-- Accesorios → sección ACCESORIOS_MARCO por defecto
UPDATE mst_recetas_ingenieria
SET seccion = 'ACCESORIOS_MARCO'
WHERE tipo = 'Accesorio' AND (seccion IS NULL OR seccion = 'GENERAL');

-- Servicios → sección GENERAL
UPDATE mst_recetas_ingenieria
SET seccion = 'GENERAL'
WHERE tipo = 'Servicio' AND seccion IS NULL;

-- Vidrio → sección HOJAS
UPDATE mst_recetas_ingenieria
SET seccion = 'HOJAS'
WHERE tipo = 'Vidrio' AND (seccion IS NULL OR seccion = 'GENERAL');

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. BACKFILL: Convertir factores antiguos a fórmulas texto
--    Esto es informativo - las fórmulas se pueden ajustar en el editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Para perfiles: formula_perfil = "factor_corte_ancho*ancho + factor_corte_alto*alto + constante_corte_mm"
UPDATE mst_recetas_ingenieria
SET formula_perfil = 
  CASE 
    WHEN COALESCE(factor_corte_ancho, 0) != 0 AND COALESCE(factor_corte_alto, 0) != 0 THEN
      TRIM(BOTH FROM
        CASE WHEN factor_corte_ancho = 1 THEN 'ancho' 
             WHEN factor_corte_ancho = -1 THEN '-ancho'
             WHEN factor_corte_ancho != 0 THEN factor_corte_ancho::text || '*ancho'
             ELSE '' END
        || CASE WHEN factor_corte_alto > 0 THEN '+' ELSE '' END
        || CASE WHEN factor_corte_alto = 1 THEN 'alto' 
              WHEN factor_corte_alto = -1 THEN '-alto'
              WHEN factor_corte_alto != 0 THEN factor_corte_alto::text || '*alto'
              ELSE '' END
        || CASE WHEN COALESCE(constante_corte_mm, 0) > 0 THEN '+' || constante_corte_mm::text
              WHEN COALESCE(constante_corte_mm, 0) < 0 THEN constante_corte_mm::text
              ELSE '' END
      )
    WHEN COALESCE(factor_corte_ancho, 0) != 0 THEN
      CASE WHEN factor_corte_ancho = 1 THEN 'ancho' 
           WHEN factor_corte_ancho = -1 THEN '-ancho'
           ELSE factor_corte_ancho::text || '*ancho' END
      || CASE WHEN COALESCE(constante_corte_mm, 0) > 0 THEN '+' || constante_corte_mm::text
            WHEN COALESCE(constante_corte_mm, 0) < 0 THEN constante_corte_mm::text
            ELSE '' END
    WHEN COALESCE(factor_corte_alto, 0) != 0 THEN
      CASE WHEN factor_corte_alto = 1 THEN 'alto' 
           WHEN factor_corte_alto = -1 THEN '-alto'
           ELSE factor_corte_alto::text || '*alto' END
      || CASE WHEN COALESCE(constante_corte_mm, 0) > 0 THEN '+' || constante_corte_mm::text
            WHEN COALESCE(constante_corte_mm, 0) < 0 THEN constante_corte_mm::text
            ELSE '' END
    ELSE NULL
  END,
  formula_cantidad = cantidad_base::text
WHERE tipo = 'Perfil' AND formula_perfil IS NULL;

-- Para accesorios: formula_cantidad es la expresión de cantidad
UPDATE mst_recetas_ingenieria
SET formula_cantidad = 
  CASE
    WHEN COALESCE(cantidad_base, 0) != 0 AND COALESCE(factor_cantidad_ancho, 0) = 0 AND COALESCE(factor_cantidad_alto, 0) = 0 THEN
      cantidad_base::text
    WHEN COALESCE(cantidad_base, 0) = 0 AND (COALESCE(factor_cantidad_ancho, 0) != 0 OR COALESCE(factor_cantidad_alto, 0) != 0) THEN
      TRIM(BOTH FROM
        CASE WHEN factor_cantidad_ancho != 0 THEN factor_cantidad_ancho::text || '*ancho' ELSE '' END
        || CASE WHEN factor_cantidad_alto > 0 AND factor_cantidad_ancho != 0 THEN '+' ELSE '' END
        || CASE WHEN factor_cantidad_alto != 0 THEN factor_cantidad_alto::text || '*alto' ELSE '' END
      )
    WHEN COALESCE(cantidad_base, 0) != 0 AND (COALESCE(factor_cantidad_ancho, 0) != 0 OR COALESCE(factor_cantidad_alto, 0) != 0) THEN
      cantidad_base::text
      || CASE WHEN factor_cantidad_ancho > 0 THEN '+' ELSE '' END
      || CASE WHEN factor_cantidad_ancho != 0 THEN factor_cantidad_ancho::text || '*ancho' ELSE '' END
      || CASE WHEN factor_cantidad_alto > 0 THEN '+' ELSE '' END
      || CASE WHEN factor_cantidad_alto != 0 THEN factor_cantidad_alto::text || '*alto' ELSE '' END
    WHEN COALESCE(factor_cantidad_area, 0) != 0 THEN
      factor_cantidad_area::text || '*ancho*alto'
    ELSE cantidad_base::text
  END
WHERE tipo IN ('Accesorio', 'Servicio') AND formula_cantidad IS NULL;

COMMIT;
