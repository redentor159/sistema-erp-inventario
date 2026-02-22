-- =================================================================================================
-- SCRIPT DE PRUEBAS "EXTREMAS" (CONFIRMACIÓN DE ESTABILIDAD) - FIXED
-- Fecha: 2026-02-10
-- Descripción: Prueba Multi-Moneda, Costos Cero y Stock Negativo.
--              Incluye creación de Dependencias Maestras.
-- =================================================================================================

-- 1. Tabla de Resultados (misma estructura)
CREATE TEMP TABLE IF NOT EXISTS temp_chaos_results (
    step_id INT,
    step_name TEXT,
    status TEXT,
    details TEXT
);
TRUNCATE temp_chaos_results;

DO $$
DECLARE
    -- IDs
    v_id_proveedor TEXT := 'PROV-CHAOS-01';
    v_id_cliente TEXT := 'CLI-CHAOS-01';
    
    -- SKUs para cada Escenario
    v_id_sku_usd TEXT := 'SKU-CHAOS-USD';
    v_id_sku_bonus TEXT := 'SKU-CHAOS-BONUS';
    v_id_sku_neg TEXT := 'SKU-CHAOS-NEG';

    v_id_entrada UUID;
    v_id_salida UUID;
    v_stock NUMERIC;
    v_pmp NUMERIC;
BEGIN
    -- 0. CLEANUP PREVIO
    DELETE FROM trx_movimientos WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    DELETE FROM trx_entradas_detalle WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    DELETE FROM trx_salidas_detalle WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    DELETE FROM cat_productos_variantes WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    
    DELETE FROM cat_plantillas WHERE id_plantilla = 'PLANT-TEST';
    DELETE FROM mst_familias WHERE id_familia = 'FAM-TEST';
    DELETE FROM mst_series_equivalencias WHERE id_sistema = 'SIS-TEST';
    DELETE FROM mst_materiales WHERE id_material = 'MAT-TEST';
    DELETE FROM mst_marcas WHERE id_marca = 'MARCA-TEST';
    DELETE FROM mst_acabados_colores WHERE id_acabado = 'ACAB-TEST';

    DELETE FROM mst_proveedores WHERE id_proveedor = v_id_proveedor;
    DELETE FROM mst_clientes WHERE id_cliente = v_id_cliente;

    -- Setup Maestros Básicos (Dependencies)
    INSERT INTO mst_materiales (id_material, nombre_material) VALUES ('MAT-TEST', 'Material de Prueba') ON CONFLICT DO NOTHING;
    INSERT INTO mst_marcas (id_marca, nombre_marca) VALUES ('MARCA-TEST', 'Marca Test') ON CONFLICT DO NOTHING;
    INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado) VALUES ('ACAB-TEST', 'Acabado Test') ON CONFLICT DO NOTHING;
    INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial) VALUES ('SIS-TEST', 'Sistema Test') ON CONFLICT DO NOTHING;
    INSERT INTO mst_familias (id_familia, nombre_familia) VALUES ('FAM-TEST', 'Familia Test') ON CONFLICT DO NOTHING;
    INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema) 
    VALUES ('PLANT-TEST', 'Perfil Test', 'FAM-TEST', 'SIS-TEST') ON CONFLICT DO NOTHING;

    INSERT INTO mst_proveedores (id_proveedor, razon_social, ruc, moneda_predeterminada) VALUES (v_id_proveedor, 'Prov Chaos LLC', '11111111111', 'USD') ON CONFLICT DO NOTHING;
    INSERT INTO mst_clientes (id_cliente, nombre_completo, ruc, tipo_cliente) VALUES (v_id_cliente, 'Cliente Chaos', '22222222222', 'EMPRESA') ON CONFLICT DO NOTHING;
    
    INSERT INTO temp_chaos_results VALUES (0, 'Setup', 'OK', 'Ambiente limpio preparado y dependencias creadas');

    -- =================================================================================================
    -- ESCENARIO 1: EL "GRINGO" (COMPRA EN DOLARES -> PMP EN SOLES)
    -- =================================================================================================
    -- Crear SKU configurado en USD
    INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, nombre_completo, unidad_medida, stock_minimo)
    VALUES (v_id_sku_usd, 'PLANT-TEST', 'MARCA-TEST', 'MAT-TEST', 'ACAB-TEST', 'Item Importado USD', 'UND', 10);

    -- Comprar 10 unidades a $10.00 con T.C. 3.80
    -- Total en USD = 100.00. Total en PEN DEBERIA SER 380.00. PMP DEBERIA SER S/ 38.00.
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, tipo_cambio, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'USD', 3.80, 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku_usd, 10, 10.00, 100.00); 

    -- Validar
    SELECT costo_pmp, stock_actual INTO v_pmp, v_stock FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku_usd;

    IF v_pmp >= 37.9 AND v_pmp <= 38.1 THEN
        INSERT INTO temp_chaos_results VALUES (1, 'Multi-Moneda USD->PEN', 'PASS', format('PMP Calculado: S/ %s (Correcto, usó TC 3.80)', v_pmp));
    ELSIF v_pmp = 10.00 THEN
        INSERT INTO temp_chaos_results VALUES (1, 'Multi-Moneda USD->PEN', 'FAIL', '⚠️ CRITICO: El sistema ignoró el Tipo de Cambio. PMP=10.00 (Debería ser 38.00)');
    ELSE
        INSERT INTO temp_chaos_results VALUES (1, 'Multi-Moneda USD->PEN', 'WARN', format('PMP Inesperado: S/ %s', v_pmp));
    END IF;

    -- =================================================================================================
    -- ESCENARIO 2: BONUS (COSTO CERO)
    -- =================================================================================================
    INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, nombre_completo, unidad_medida, stock_minimo)
    VALUES (v_id_sku_bonus, 'PLANT-TEST', 'MARCA-TEST', 'MAT-TEST', 'ACAB-TEST', 'Item con Bonificación', 'UND', 10);

    -- Compra Normal: 10 und @ S/ 100.00
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;
    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku_bonus, 10, 100.00, 1000.00);

    -- Bonificación: 10 und @ S/ 0.00
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('AJUSTE_POSITIVO', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;
    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku_bonus, 10, 0.00, 0.00);

    -- Esperado: Total Stock 20. Total Valor 1000. PMP = 50.00.
    SELECT costo_pmp, stock_actual INTO v_pmp, v_stock FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku_bonus;

    IF v_stock = 20 AND v_pmp = 50.00 THEN
        INSERT INTO temp_chaos_results VALUES (2, 'Costo Cero (Promedio)', 'PASS', 'PMP bajó correctamente a la mitad (S/ 50.00)');
    ELSE
        INSERT INTO temp_chaos_results VALUES (2, 'Costo Cero (Promedio)', 'FAIL', format('Stock=%s, PMP=%s', v_stock, v_pmp));
    END IF;

    -- =================================================================================================
    -- ESCENARIO 3: STOCK NEGATIVO (VENDER LO QUE NO TIENES)
    -- =================================================================================================
    INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, nombre_completo, unidad_medida, stock_minimo)
    VALUES (v_id_sku_neg, 'PLANT-TEST', 'MARCA-TEST', 'MAT-TEST', 'ACAB-TEST', 'Item Negativo', 'UND', 10);

    -- Vender 5 sin tener stock
    INSERT INTO trx_salidas_cabecera (tipo_salida, id_destinatario, estado, fecha)
    VALUES ('VENTA', v_id_cliente, 'CONFIRMADO', NOW()) RETURNING id_salida INTO v_id_salida;
    INSERT INTO trx_salidas_detalle (id_salida, id_sku, cantidad, precio_unitario, subtotal)
    VALUES (v_id_salida, v_id_sku_neg, 5, 200.00, 1000.00);

    SELECT stock_actual INTO v_stock FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku_neg;
    
    IF v_stock = -5 THEN
        INSERT INTO temp_chaos_results VALUES (3, 'Stock Negativo', 'PASS', 'Sistema permitió Venta sin Stock (-5). Comportamiento Flexible.');
    ELSE
        INSERT INTO temp_chaos_results VALUES (3, 'Stock Negativo', 'FAIL', format('Stock inesperado: %s (¿Quizás bloqueó la venta?)', v_stock));
    END IF;

    -- =================================================================================================
    -- LIMPIEZA FINAL
    -- =================================================================================================
    DELETE FROM trx_movimientos WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    DELETE FROM trx_entradas_detalle WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    DELETE FROM trx_salidas_detalle WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    DELETE FROM cat_productos_variantes WHERE id_sku IN (v_id_sku_usd, v_id_sku_bonus, v_id_sku_neg);
    
    DELETE FROM cat_plantillas WHERE id_plantilla = 'PLANT-TEST';
    DELETE FROM mst_familias WHERE id_familia = 'FAM-TEST';
    DELETE FROM mst_series_equivalencias WHERE id_sistema = 'SIS-TEST';
    DELETE FROM mst_materiales WHERE id_material = 'MAT-TEST';
    DELETE FROM mst_marcas WHERE id_marca = 'MARCA-TEST';
    DELETE FROM mst_acabados_colores WHERE id_acabado = 'ACAB-TEST';

    DELETE FROM trx_entradas_cabecera WHERE id_proveedor = v_id_proveedor; -- Seguridad Extra
    DELETE FROM trx_salidas_cabecera WHERE id_destinatario = v_id_cliente; -- Seguridad Extra
    DELETE FROM mst_proveedores WHERE id_proveedor = v_id_proveedor;
    DELETE FROM mst_clientes WHERE id_cliente = v_id_cliente;

    INSERT INTO temp_chaos_results VALUES (99, 'Limpieza Chaos', 'OK', 'Datos eliminados');
END $$;

SELECT * FROM temp_chaos_results ORDER BY step_id;
DROP TABLE temp_chaos_results;
