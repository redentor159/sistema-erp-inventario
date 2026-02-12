-- =================================================================================================
-- SCRIPT DE CORRECCIÓN DE INTEGRIDAD DE SCHEMA (VERSIÓN 2 - CON LIMPIEZA DE ESTADOS)
-- Fecha: 2026-02-10
-- Descripción: Corrige FKs faltantes, agrega Constraints validando y limpiando datos previos.
-- =================================================================================================

-- 1. CORRECCION: FK en trx_salidas_cabecera.id_destinatario
-- =================================================================================================

-- 1.1 Limpieza de Datos: Asegurar que todos los destinatarios existan en mst_clientes.
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM trx_salidas_cabecera s 
    LEFT JOIN mst_clientes c ON s.id_destinatario = c.id_cliente 
    WHERE c.id_cliente IS NULL AND s.id_destinatario IS NOT NULL;
    
    IF v_count > 0 THEN
        RAISE NOTICE 'Encontrados % registros huerfanos en Salidas. Corrigiendo...', v_count;
        
        -- Insertar cliente placeholder si no existe
        INSERT INTO mst_clientes (id_cliente, nombre_completo, ruc, tipo_cliente)
        VALUES ('CLIENTE_HISTORICO', 'Cliente Histórico (Migración)', '00000000000', 'PERSONA')
        ON CONFLICT (id_cliente) DO NOTHING;
        
        -- Actualizar registros huérfanos
        UPDATE trx_salidas_cabecera
        SET id_destinatario = 'CLIENTE_HISTORICO'
        WHERE id_destinatario NOT IN (SELECT id_cliente FROM mst_clientes);
    END IF;
END $$;

-- 1.2 Aplicar Foreign Key
ALTER TABLE trx_salidas_cabecera
    DROP CONSTRAINT IF EXISTS trx_salidas_cabecera_id_destinatario_fkey;

ALTER TABLE trx_salidas_cabecera
    ADD CONSTRAINT trx_salidas_cabecera_id_destinatario_fkey
    FOREIGN KEY (id_destinatario)
    REFERENCES mst_clientes(id_cliente);


-- 2. CORRECCION: Constraints de Validación (CHECK) CON NORMALIZACIÓN
-- =================================================================================================

-- 2.1 Cotizaciones Estado
-- Limpieza previa: Normalizar estados desconocidos a 'BORRADOR'
UPDATE trx_cotizaciones_cabecera
SET estado = 'BORRADOR'
WHERE estado NOT IN ('BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'FINALIZADO', 'ENTREGADO')
   OR estado IS NULL;

ALTER TABLE trx_cotizaciones_cabecera
    DROP CONSTRAINT IF EXISTS chk_cotizacion_estado;
    
ALTER TABLE trx_cotizaciones_cabecera
    ADD CONSTRAINT chk_cotizacion_estado 
    CHECK (estado IN ('BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'FINALIZADO', 'ENTREGADO'));

-- 2.2 Entradas Tipo y Estado
-- Limpieza previa
UPDATE trx_entradas_cabecera
SET tipo_entrada = 'COMPRA'
WHERE tipo_entrada NOT IN ('COMPRA', 'AJUSTE_POSITIVO', 'DEVOLUCION_CLIENTE')
   OR tipo_entrada IS NULL;

UPDATE trx_entradas_cabecera
SET estado = 'PENDIENTE'
WHERE estado NOT IN ('PENDIENTE', 'RECIBIDO', 'CANCELADO')
   OR estado IS NULL;

ALTER TABLE trx_entradas_cabecera
    DROP CONSTRAINT IF EXISTS chk_entrada_tipo;
ALTER TABLE trx_entradas_cabecera
    ADD CONSTRAINT chk_entrada_tipo 
    CHECK (tipo_entrada IN ('COMPRA', 'AJUSTE_POSITIVO', 'DEVOLUCION_CLIENTE'));

ALTER TABLE trx_entradas_cabecera
    DROP CONSTRAINT IF EXISTS chk_entrada_estado;
ALTER TABLE trx_entradas_cabecera
    ADD CONSTRAINT chk_entrada_estado
    CHECK (estado IN ('PENDIENTE', 'RECIBIDO', 'CANCELADO'));

-- 2.3 Salidas Tipo y Estado
-- Limpieza previa
UPDATE trx_salidas_cabecera
SET tipo_salida = 'VENTA'
WHERE tipo_salida NOT IN ('VENTA', 'PRODUCCION', 'AJUSTE_NEGATIVO', 'DEVOLUCION_PROOVEDOR', 'MERMA')
   OR tipo_salida IS NULL;

UPDATE trx_salidas_cabecera
SET estado = 'CONFIRMADO'
WHERE estado NOT IN ('BORRADOR', 'CONFIRMADO', 'ANULADO')
   OR estado IS NULL;

ALTER TABLE trx_salidas_cabecera
    DROP CONSTRAINT IF EXISTS chk_salida_tipo;
ALTER TABLE trx_salidas_cabecera
    ADD CONSTRAINT chk_salida_tipo
    CHECK (tipo_salida IN ('VENTA', 'PRODUCCION', 'AJUSTE_NEGATIVO', 'DEVOLUCION_PROOVEDOR', 'MERMA'));

ALTER TABLE trx_salidas_cabecera
    DROP CONSTRAINT IF EXISTS chk_salida_estado;
ALTER TABLE trx_salidas_cabecera
    ADD CONSTRAINT chk_salida_estado
    CHECK (estado IN ('BORRADOR', 'CONFIRMADO', 'ANULADO'));


-- 3. CORRECCION: Vista vw_kpi_valorizacion (Tipo de Cambio Dinámico)
-- =================================================================================================

CREATE OR REPLACE VIEW public.vw_kpi_valorizacion
AS 
SELECT 
    count(*) AS total_skus,
    sum(valor_total_pen) AS valor_inventario_pen,
    -- Usar tipo de cambio configurado en vez de valor fijo
    sum(valor_total_pen) / (SELECT COALESCE(tipo_cambio_referencial, 3.75) FROM mst_config_general LIMIT 1) AS valor_inventario_usd,
    sum(CASE WHEN estado_abastecimiento = 'CRITICO' THEN 1 ELSE 0 END) AS skus_criticos,
    sum(CASE WHEN estado_abastecimiento = 'ALERTA' THEN 1 ELSE 0 END) AS skus_alerta
FROM vw_dashboard_stock_realtime;

GRANT SELECT ON public.vw_kpi_valorizacion TO authenticated;
GRANT SELECT ON public.vw_kpi_valorizacion TO service_role;
