-- =================================================================================================
-- SCRIPT DE CORRECCIÓN POST-TEST (CRITICAL FIXES) - FIXED V3
-- Fecha: 2026-02-10
-- Descripción: 1. Agrega columna comentario a trx_entradas_cabecera.
--              2. Corrige trigger para calcular costo en SOLES (usando Tipo de Cambio).
--              3. Corrige mapeo de Typos de Entrada a Tipos de Movimiento (Constraint Check).
-- =================================================================================================

-- 1. SCHEMA FIX: Agregar columna faltante
-- =================================================================================================
ALTER TABLE trx_entradas_cabecera
ADD COLUMN IF NOT EXISTS comentario TEXT;

-- 2. LOGIC FIX: Trigger de Entrada (Multi-Moneda + Mapeo de Tipos)
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
    v_tipo_movimiento_kardex text; -- Variable para mapear el tipo correcto
BEGIN
    -- Obtener datos de la cabecera
    SELECT tipo_entrada, fecha_registro, moneda, tipo_cambio
    INTO v_tipo_entrada, v_fecha, v_moneda, v_tipo_cambio
    FROM trx_entradas_cabecera
    WHERE id_entrada = NEW.id_entrada;

    -- Lógica de Mapeo: trx_entradas_cabecera -> trx_movimientos
    -- trx_movimientos CHECK (tipo_movimiento IN ('COMPRA', 'VENTA', 'PRODUCCION', 'AJUSTE', 'RETORNO'))
    CASE v_tipo_entrada
        WHEN 'COMPRA' THEN v_tipo_movimiento_kardex := 'COMPRA';
        WHEN 'AJUSTE_POSITIVO' THEN v_tipo_movimiento_kardex := 'AJUSTE';
        WHEN 'DEVOLUCION_CLIENTE' THEN v_tipo_movimiento_kardex := 'RETORNO';
        ELSE v_tipo_movimiento_kardex := 'AJUSTE'; -- Fallback seguro
    END CASE;

    -- Lógica de Conversión a Soles (PEN)
    IF v_moneda != 'PEN' THEN
        v_costo_unitario_pen := NEW.costo_unitario * COALESCE(v_tipo_cambio, 3.75);
    ELSE
        v_costo_unitario_pen := NEW.costo_unitario;
    END IF;

    -- Insertar en Kardex valorizado en SOLES
    INSERT INTO trx_movimientos (
        id_sku,
        tipo_movimiento,  -- Usamos la variable mapeada
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
        v_tipo_movimiento_kardex, -- AQUI EL CAMBIO
        NEW.cantidad,
        v_moneda,
        NEW.costo_unitario,
        v_tipo_cambio,
        v_costo_unitario_pen * NEW.cantidad,
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
    RAISE NOTICE '✅ FIX APLICADO: Columna comentario agregada y Trigger Multimoneda corregido (Con Mapeo de Tipos).';
END $$;
