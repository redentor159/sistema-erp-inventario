-- =================================================================================================
-- FIX: PERMITIR SKUs DINÁMICOS EN DESGLOSE DE MATERIALES
-- Fecha: 2026-02-07
-- 
-- Problema: El sistema genera SKUs dinámicos basados en color+marca de cotización,
-- pero estos no existen en cat_productos_variantes, causando error de FK.
-- 
-- Solución: Quitar el constraint FK en sku_real. El campo sigue siendo útil para
-- identificar el producto, pero no requiere que exista previamente.
-- =================================================================================================

-- 1. Quitar el Foreign Key constraint en sku_real
ALTER TABLE trx_desglose_materiales 
DROP CONSTRAINT IF EXISTS trx_desglose_materiales_sku_real_fkey;

-- 2. Hacer sku_real nullable (ya debería serlo, pero aseguramos)
ALTER TABLE trx_desglose_materiales 
ALTER COLUMN sku_real DROP NOT NULL;

-- 3. Agregar índice para búsquedas (opcional, mejora performance)
CREATE INDEX IF NOT EXISTS idx_desglose_sku_real ON trx_desglose_materiales(sku_real);

-- 4. Comentario explicativo
COMMENT ON COLUMN trx_desglose_materiales.sku_real IS 
'SKU calculado dinámicamente. Puede no existir en cat_productos_variantes ya que 
se genera en tiempo real basado en: plantilla + color_perfiles + marca_cotización.
Los costos se buscan por aproximación o se usan valores por defecto.';

-- 5. Actualizar la función fn_generar_despiece para manejar SKUs no encontrados mejor
-- (Ya maneja NULL con v_costo_unit_sku := 0, pero podemos agregar un fallback)
