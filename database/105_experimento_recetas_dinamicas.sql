-- Hito 7: Modelo Paramétrico Dinámico desde Recetas
-- Extensión de la tabla mst_recetas_modelos para alojar directivas de UI y Generación SVG

ALTER TABLE public.mst_recetas_modelos
ADD COLUMN IF NOT EXISTS tipo_dibujo VARCHAR(50),
ADD COLUMN IF NOT EXISTS config_hojas_default VARCHAR(50),
ADD COLUMN IF NOT EXISTS formula_cruces_vert VARCHAR(255),
ADD COLUMN IF NOT EXISTS formula_cruces_horiz VARCHAR(255);

COMMENT ON COLUMN public.mst_recetas_modelos.tipo_dibujo IS 'Instrucción al frontend de cómo renderizar: Corrediza, Proyectante, Batiente, Fijo, Fijo_Sin_Marco';
COMMENT ON COLUMN public.mst_recetas_modelos.config_hojas_default IS 'Configuración default (Ej. CC, FCCF, P) al arrastrar el modelo';
COMMENT ON COLUMN public.mst_recetas_modelos.formula_cruces_vert IS 'Fórmula matemática o valor estático para calcular parantes internos';
COMMENT ON COLUMN public.mst_recetas_modelos.formula_cruces_horiz IS 'Fórmula matemática o valor estático para calcular travesaños internos';

-- Opcional: Update inicial (Heurístico) para setear la data base que ya tenemos, así no hay componentes rotos:
UPDATE public.mst_recetas_modelos
SET tipo_dibujo = 'Corrediza', config_hojas_default = 'CC'
WHERE tipo_apertura ILIKE '%Corrediza%' AND tipo_dibujo IS NULL;

UPDATE public.mst_recetas_modelos
SET tipo_dibujo = 'Proyectante', config_hojas_default = 'P'
WHERE tipo_apertura ILIKE '%Proyectante%' AND tipo_dibujo IS NULL;

UPDATE public.mst_recetas_modelos
SET tipo_dibujo = 'Batiente', config_hojas_default = 'A'
WHERE tipo_apertura ILIKE '%Batiente%' AND tipo_dibujo IS NULL;

UPDATE public.mst_recetas_modelos
SET tipo_dibujo = 'Fijo', config_hojas_default = 'F'
WHERE tipo_apertura ILIKE '%Fijo%' AND tipo_dibujo IS NULL;
