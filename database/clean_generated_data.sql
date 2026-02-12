-- =================================================================================================
-- SCRIPT: LIMPIEZA DE DATA GENERADA (ROLLBACK)
-- =================================================================================================
-- OBJETIVO: Eliminar únicamente los datos creados por el script de simulación.
-- SEGURIDAD: Filtra por la etiqueta '[DATA-GEN]' en observaciones o comentarios.

BEGIN;

-- 1. Eliminar Movimientos Generados
DELETE FROM trx_movimientos 
WHERE comentarios LIKE '[DATA-GEN]%';

-- 2. Eliminar Detalles de Cotizaciones Generadas
DELETE FROM trx_cotizaciones_detalle 
WHERE id_cotizacion IN (
    SELECT id_cotizacion 
    FROM trx_cotizaciones_cabecera 
    WHERE observaciones LIKE '[DATA-GEN]%'
);

-- 3. Eliminar Cabeceras de Cotizaciones Generadas
DELETE FROM trx_cotizaciones_cabecera 
WHERE observaciones LIKE '[DATA-GEN]%';

COMMIT;

-- Verificación
SELECT count(*) as cotizaciones_restantes 
FROM trx_cotizaciones_cabecera 
WHERE observaciones LIKE '[DATA-GEN]%';
