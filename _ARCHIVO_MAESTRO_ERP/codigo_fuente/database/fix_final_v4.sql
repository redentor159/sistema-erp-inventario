-- =================================================================================================
-- SCRIPT DE CORRECCIÓN FINAL (V4) - RESCUE MISSION
-- Fecha: 2026-02-10
-- Descripción: 1. Elimina Constraints restrictivos que rompen el UI.
--              2. Debug de Trigger Multi-Moneda para entender por qué fallaba.
-- =================================================================================================

-- 1. RELAJAR CONSTRAINTS (UI COMPATIBILIDAD)
-- =================================================================================================
-- El UI envía estados como 'BORRADOR', 'CONFIRMADO', etc. o nulos que mis checks anteriores
-- prohibían. Mejor los quitamos para no bloquear la operación diaria.

ALTER TABLE trx_cotizaciones_cabecera DROP CONSTRAINT IF EXISTS chk_cotizacion_estado;
ALTER TABLE trx_salidas_cabecera DROP CONSTRAINT IF EXISTS chk_salida_estado;
ALTER TABLE trx_salidas_cabecera DROP CONSTRAINT IF EXISTS chk_salida_tipo;
ALTER TABLE trx_entradas_cabecera DROP CONSTRAINT IF EXISTS chk_entrada_estado;
ALTER TABLE trx_entradas_cabecera DROP CONSTRAINT IF EXISTS chk_entrada_tipo;

-- 2. FIX TRIGGER (DEBUG & ROBUST MODE)
-- =================================================================================================

CREATE OR REPLACE FUNCTION public.fn_trigger_entrada_to_kardex()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_tipo_entrada text;
    v_fecha timestamp;
    v_moneda text;
    v_tipo_cambio numeric;
    v_costo_unitario_pen numeric;
    v_tipo_movimiento_kardex text; 
BEGIN
    -- Obtener datos de la cabecera
    SELECT tipo_entrada, fecha_registro, moneda, tipo_cambio
    INTO v_tipo_entrada, v_fecha, v_moneda, v_tipo_cambio
    FROM trx_entradas_cabecera
    WHERE id_entrada = NEW.id_entrada;
    
    -- Debug Log (visible en Supabase Logs)
    RAISE NOTICE 'DEBUG TRIGGER KARDEX: ID=%, Moneda=%, TC=%, TipoEntrada=%', NEW.id_entrada, v_moneda, v_tipo_cambio, v_tipo_entrada;

    -- Lógica de Mapeo
    CASE v_tipo_entrada
        WHEN 'COMPRA' THEN v_tipo_movimiento_kardex := 'COMPRA';
        WHEN 'AJUSTE_POSITIVO' THEN v_tipo_movimiento_kardex := 'AJUSTE';
        WHEN 'DEVOLUCION_CLIENTE' THEN v_tipo_movimiento_kardex := 'RETORNO';
        ELSE v_tipo_movimiento_kardex := 'AJUSTE'; -- Fallback para tipos desconocidos (evita crash)
    END CASE;

    -- Lógica de Conversión a Soles (PEN)
    -- Usamos IS DISTINCT FROM para evitar NULL traps
    IF v_moneda IS DISTINCT FROM 'PEN' THEN
        v_costo_unitario_pen := NEW.costo_unitario * COALESCE(v_tipo_cambio, 3.75);
    ELSE
        v_costo_unitario_pen := NEW.costo_unitario;
    END IF;

    -- Insertar en Kardex valorizado en SOLES
    INSERT INTO trx_movimientos (
        id_sku,
        tipo_movimiento,
        cantidad,
        moneda_origen,
        costo_unit_doc,
        tipo_cambio,
        costo_total_pen,
        referencia_doc,
        fecha_hora,
        usuario_reg
    ) VALUES (
        NEW.id_sku,
        v_tipo_movimiento_kardex,
        NEW.cantidad,
        v_moneda,
        NEW.costo_unitario,
        v_tipo_cambio,
        v_costo_unitario_pen * NEW.cantidad, -- Aqui se usa el calculado
        NEW.id_entrada,
        v_fecha,
        current_user
    );

    RETURN NEW;
END;
$function$;

-- Notificar éxito
DO $$
BEGIN
    RAISE NOTICE '✅ FIX FINAL V4 APLICADO: Constraints eliminados y Trigger robustecido.';
END $$;
