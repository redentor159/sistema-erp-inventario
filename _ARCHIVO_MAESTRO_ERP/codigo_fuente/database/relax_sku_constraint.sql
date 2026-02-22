-- =================================================================================================
-- SCRIPT DE FLEXIBILIZACIÓN DE SKUS (OPCIONAL PERO RECOMENDADO)
-- Fecha: 2026-02-10
-- Descripción: Elimina la FK estricta de SKU Real para permitir generación de SKUs dinámicos.
-- =================================================================================================

-- 1. Eliminar FK trx_desglose_materiales_sku_real_fkey
-- Motivo: El sistema genera SKUs teóricos (ej. combinaciones nuevas de color/medida).
-- Si mantenemos esta FK estricta, el despiece fallará para cualquier SKU nuevo que aún no esté creado
-- en cat_productos_variantes.
-- Es mejor permitir el TEXT libre y auditar inconsistencias después (con la vista vw_audit_skus_faltantes).

ALTER TABLE trx_desglose_materiales
    DROP CONSTRAINT IF EXISTS trx_desglose_materiales_sku_real_fkey;

DO $$ BEGIN
    RAISE NOTICE 'Constraint de SKU Real eliminado. Ahora se pueden insertar SKUs dinámicos sin error.';
END $$;
