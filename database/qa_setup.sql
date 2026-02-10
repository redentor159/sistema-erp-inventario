
-- =================================================================================================
-- SCRIPT DE PREPARACIÓN QA (FINAL - VERSIÓN 3)
-- Sin Bot Asesino | Sin campos fantasmas
-- =================================================================================================

-- 1. CONFIGURACIÓN GLOBAL
INSERT INTO public.mst_config_general (
    id_config, margen_ganancia_default, igv, markup_cotizaciones_default, 
    costo_mo_m2_default, tipo_cambio_referencial, texto_condiciones_base
) VALUES (
    'CONFIG_MAIN', 0.30, 0.18, 1.30, 
    50.00, 3.80, 'Validez 15 días.'
) ON CONFLICT (id_config) DO UPDATE SET
    margen_ganancia_default = 0.30,
    igv = 0.18;

-- 2. DEPENDENCIAS DE MAESTROS
-- Familia
INSERT INTO public.mst_familias (id_familia, nombre_familia, categoria_odoo)
VALUES ('QA-FAM-001', 'QA Testing Family', 'TEST') ON CONFLICT DO NOTHING;

-- Sistema
INSERT INTO public.mst_series_equivalencias (id_sistema, nombre_comercial)
VALUES ('QA-SYS-001', 'Sistema de Prueba') ON CONFLICT DO NOTHING;

-- Marca
INSERT INTO public.mst_marcas (id_marca, nombre_marca)
VALUES ('QA-BRAND-001', 'QA Brand') ON CONFLICT DO NOTHING;

-- Material
INSERT INTO public.mst_materiales (id_material, nombre_material)
VALUES ('QA-MAT-001', 'QA Material') ON CONFLICT DO NOTHING;

-- Acabado
INSERT INTO public.mst_acabados_colores (id_acabado, nombre_acabado)
VALUES ('QA-FINISH-001', 'QA Finish') ON CONFLICT DO NOTHING;


-- 3. PLANTILLA DE PRUEBA (Intermediario necesario para Familia)
INSERT INTO public.cat_plantillas (
    id_plantilla, nombre_generico, id_familia, id_sistema
) VALUES (
    'QA-TEMPL-001', 'Plantilla Genérica de Prueba', 'QA-FAM-001', 'QA-SYS-001'
) ON CONFLICT (id_plantilla) DO NOTHING;


-- 4. PRODUCTO DE PRUEBA
-- Corregido: SOLO columnas válidas. Sin stock_actual ni id_familia.
INSERT INTO public.cat_productos_variantes (
    id_sku, 
    nombre_completo, 
    unidad_medida, 
    costo_mercado_unit, 
    id_plantilla, 
    id_marca, 
    id_material, 
    id_acabado
) VALUES (
    'TEST-ALUMINIO-X', 
    'Producto de Prueba QA Extremo', 
    'BARRA',
    0, 
    'QA-TEMPL-001', 
    'QA-BRAND-001', 
    'QA-MAT-001', 
    'QA-FINISH-001'
) ON CONFLICT (id_sku) DO UPDATE SET 
    nombre_completo = 'Producto de Prueba QA Extremo';

-- 5. LIMPIEZA
-- Aseguramos que el stock sea 0 borrando cualquier movimiento previo
DELETE FROM public.trx_movimientos WHERE id_sku = 'TEST-ALUMINIO-X';

-- 6. PERMISOS
ALTER TABLE public.cat_plantillas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Plantillas" ON public.cat_plantillas;
CREATE POLICY "Allow All Plantillas" ON public.cat_plantillas FOR ALL USING (true);

ALTER TABLE public.cat_productos_variantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All SKUs" ON public.cat_productos_variantes;
CREATE POLICY "Allow All SKUs" ON public.cat_productos_variantes FOR ALL USING (true);
