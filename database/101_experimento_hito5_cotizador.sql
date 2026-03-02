-- =================================================================================================
-- HITO 5: INTEGRACIÓN DE TIPOLOGÍAS CON MÓDULO DE COTIZACIÓN
-- Este script prepara la base de datos para fusionar el Motor Paramétrico con el legacy de Cotizaciones.
-- =================================================================================================

-- 1. Clasificación Funcional de Modelos (Corrediza, Proyectante, Fijo, Batiente)
--    Agregamos 'tipo_apertura' a la tabla maestra de modelos para que el Grid SVG y el Engine 
--    sepan geométricamente cómo dibujarlo y cómo calcular sus cruces.

ALTER TABLE public.mst_recetas_modelos 
ADD COLUMN IF NOT EXISTS tipo_apertura VARCHAR(50);

COMMENT ON COLUMN public.mst_recetas_modelos.tipo_apertura IS 'Clasificación arquitectónica: Corrediza, Proyectante, Fijo, Fijo_Sin_Marco, Batiente, Oscilobatiente, etc.';

-- 1.1 Update de Semillas (Backfill) para modelos existentes:
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Corrediza' WHERE id_modelo IN ('S20_2H', 'S20_4H_FCCF', 'S25_2H', 'S25_4H_FCCF', 'S3825_2H', 'S3131_2H', 'S80_2H', 'S80_3H', 'S80_4H_FCCF', 'S62_2H', 'S62_3H', 'S62_4H_FCCF');
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Proyectante' WHERE id_modelo IN ('S42_1H', 'S3831_1H');
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Fijo_Sin_Marco' WHERE id_modelo IN ('SOBRELUZ_25_20');

-- Opcionalmente, un update genérico por si se agregaron más:
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Corrediza' WHERE nombre_comercial ILIKE '%corrediza%' AND tipo_apertura IS NULL;
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Proyectante' WHERE nombre_comercial ILIKE '%proyectante%' AND tipo_apertura IS NULL;
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Fijo' WHERE (nombre_comercial ILIKE '%fijo%' OR nombre_comercial ILIKE '%sobreluz%') AND tipo_apertura IS NULL;
UPDATE public.mst_recetas_modelos SET tipo_apertura = 'Batiente' WHERE nombre_comercial ILIKE '%puerta%' AND tipo_apertura IS NULL;

-- 2. Integración: Vincular el Detalle de Cotización con la Tipología Maestra
--    El usuario crea un 'Detalle' (línea) en la cotización, pero en lugar de ser una ventana 1x1,
--    puede estar apuntando a un UUID de Tipoogía (que contiene n ventanas y cruces).

ALTER TABLE public.trx_cotizaciones_detalle
ADD COLUMN IF NOT EXISTS tipologia_id UUID REFERENCES public.tipologias(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.trx_cotizaciones_detalle.tipologia_id IS 'Vinculación Opcional: Si no es nulo, esta línea de cotización es una Tipología paramétrica compleja y sus medidas vienen de sus ítems internos.';
