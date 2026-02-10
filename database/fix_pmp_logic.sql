-- FIX: Ensure Sales do NOT distort Weighted Average Cost (PMP)
-- Problem: Sales were being logged in Kardex at "Sales Price".
-- Solution: Output movements must be logged at "Current PMP (Cost)" so that the remaining avg cost stays the same.

CREATE OR REPLACE FUNCTION fn_trigger_salida_to_kardex()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo_salida TEXT;
    v_comentario TEXT;
    v_costo_actual NUMERIC;
BEGIN
    -- 1. Get header info
    SELECT tipo_salida, comentario INTO v_tipo_salida, v_comentario
    FROM trx_salidas_cabecera
    WHERE id_salida = NEW.id_salida;

    -- 2. Get CURRENT Average Cost (PMP) for the SKU
    --    (We check the cached value in cat_productos_variantes)
    --    If NULL or 0, we fallback to a safe estimated cost (or 0), but usually it should have cost.
    SELECT COALESCE(costo_promedio, 0) INTO v_costo_actual
    FROM cat_productos_variantes
    WHERE id_sku = NEW.id_sku;
    
    -- Safety: If cost is 0, usage might distort PMP if we had stock with value. 
    -- But if cost is 0, then outgoing at 0 is correct physically.
    
    -- 3. Insert into Kardex using COST, not PRICE
    INSERT INTO trx_movimientos (
        tipo_movimiento,
        id_sku,
        cantidad,
        costo_unit_doc,          -- HERE IS THE CHANGE: Use Cost, not Sales Price
        costo_total_pen,         -- Total Value = Qty * Cost
        referencia_doc,
        comentarios,
        tipo_cambio,       
        id_almacen,        
        moneda_origen      
    )
    VALUES (
        v_tipo_salida,
        NEW.id_sku,
        NEW.cantidad * -1,       -- Negative for outbound
        v_costo_actual,          -- <--- FIXED: Now using PMP/Cost
        (NEW.cantidad * -1) * v_costo_actual, -- <--- FIXED: Total valued at Cost
        NEW.id_salida,
        v_comentario,
        1.00,
        'PRINCIPAL',
        'PEN'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
