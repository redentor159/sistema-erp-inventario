-- FIX KARDEX TRIGGERS
-- Context: The user reported that adjustments appear as 'COMPRA' or 'VENTA'.
-- Reason: 
-- 1. fn_trigger_entrada_to_kardex has 'COMPRA' hardcoded.
-- 2. fn_trigger_salida_to_kardex uses the header type directly, but we want to map 'AJUSTE_NEGATIVO' to 'AJUSTE' to comply with constraints and cleaner reporting.

-- 1. Update ENTRADA Trigger Function
CREATE OR REPLACE FUNCTION fn_trigger_entrada_to_kardex()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo_entrada TEXT;
    v_comentarios TEXT;
    v_tipo_movimiento TEXT;
BEGIN
    -- Fetch Header Info
    SELECT tipo_entrada, comentarios INTO v_tipo_entrada, v_comentarios
    FROM trx_entradas_cabecera
    WHERE id_entrada = NEW.id_entrada;

    -- Map Logic
    IF v_tipo_entrada = 'AJUSTE_POSITIVO' THEN
        v_tipo_movimiento := 'AJUSTE';
    ELSIF v_tipo_entrada = 'DEVOLUCION_CLIENTE' THEN
        v_tipo_movimiento := 'RETORNO';
    ELSE
        v_tipo_movimiento := 'COMPRA';
    END IF;

    -- Insert into Kardex
    INSERT INTO trx_movimientos (
        tipo_movimiento,
        id_sku,
        cantidad,
        costo_unit_doc,
        costo_total_pen,
        referencia_doc,
        comentarios,
        tipo_cambio,     
        id_almacen,      
        moneda_origen    
    )
    VALUES (
        v_tipo_movimiento,
        NEW.id_sku,
        NEW.cantidad, -- Positive
        NEW.costo_unitario,
        NEW.total_linea,
        NEW.id_entrada,
        COALESCE(v_comentarios, 'Auto-generated from Entrada'),
        1.00, -- Default
        'PRINCIPAL',
        'PEN'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Update SALIDA Trigger Function
CREATE OR REPLACE FUNCTION fn_trigger_salida_to_kardex()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo_salida TEXT;
    v_comentario TEXT;
    v_tipo_movimiento TEXT;
    v_costo_pmp NUMERIC;
BEGIN
    -- Get header info
    SELECT tipo_salida, comentario INTO v_tipo_salida, v_comentario
    FROM trx_salidas_cabecera
    WHERE id_salida = NEW.id_salida;

    -- Get Current PMP from View (Snapshot before this insert)
    -- We need this to value the exit correctly (Accounting Principle: Exit at Avg Cost)
    SELECT COALESCE(costo_promedio, 0) INTO v_costo_pmp
    FROM vw_stock_realtime
    WHERE id_sku = NEW.id_sku;

    -- Map Logic
    IF v_tipo_salida = 'AJUSTE_NEGATIVO' THEN
        v_tipo_movimiento := 'AJUSTE';
    ELSIF v_tipo_salida = 'DEVOLUCION_PROOVEDOR' THEN
        v_tipo_movimiento := 'AJUSTE'; 
    ELSIF v_tipo_salida = 'PRODUCCION' THEN
        v_tipo_movimiento := 'PRODUCCION';
    ELSE
        v_tipo_movimiento := 'VENTA';
    END IF;

    INSERT INTO trx_movimientos (
        tipo_movimiento,
        id_sku,
        cantidad,
        costo_unit_doc,
        costo_total_pen,
        referencia_doc,
        comentarios,
        tipo_cambio,
        id_almacen,
        moneda_origen
    )
    VALUES (
        v_tipo_movimiento,
        NEW.id_sku,
        NEW.cantidad * -1, -- Negative for outbound
        v_costo_pmp,       -- Exit at PMP
        (NEW.cantidad * -1) * v_costo_pmp, -- Total value at PMP
        NEW.id_salida,
        v_comentario,
        1.00,
        'PRINCIPAL',
        'PEN'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
