-- =================================================================================================
-- SCRIPT DE SIMULACIÓN (COMPATIBLE CON SUPABASE/TABLE VIEW)
-- Fecha: 2026-02-10
-- Descripción: Muestra resultados en TABLA y limpia los datos manualmente al final.
-- =================================================================================================

-- 1. Crear tabla temporal para resultados visuales
CREATE TEMP TABLE IF NOT EXISTS temp_sim_results (
    step_id INT,
    step_name TEXT,
    status TEXT,
    details TEXT
);
TRUNCATE temp_sim_results;

DO $$
DECLARE
    -- IDs para datos de prueba (Prefijo TEST para fácil limpieza)
    v_id_proveedor TEXT := 'PROV-TEST-999';
    v_id_cliente TEXT := 'CLI-TEST-999';
    v_id_sku TEXT := 'SKU-TEST-ALUM-4040';
    v_id_entrada UUID;
    v_id_salida UUID;
    v_stock_actual NUMERIC;
    v_pmp_actual NUMERIC;
    v_check_exists INT;
BEGIN
    -- 0. CLEANUP PREVIO (Seguridad por si corrió antes y falló)
    DELETE FROM trx_movimientos WHERE id_sku = v_id_sku;
    DELETE FROM trx_entradas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM trx_salidas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM trx_entradas_cabecera WHERE id_proveedor = v_id_proveedor;
    DELETE FROM trx_salidas_cabecera WHERE id_destinatario = v_id_cliente;
    DELETE FROM cat_productos_variantes WHERE id_sku = v_id_sku;
    DELETE FROM cat_plantillas WHERE id_plantilla = 'PLANT-TEST';
    DELETE FROM mst_familias WHERE id_familia = 'FAM-TEST';
    DELETE FROM mst_series_equivalencias WHERE id_sistema = 'SIS-TEST';
    DELETE FROM mst_clientes WHERE id_cliente = v_id_cliente;
    DELETE FROM mst_proveedores WHERE id_proveedor = v_id_proveedor;
    DELETE FROM mst_materiales WHERE id_material = 'MAT-TEST';
    DELETE FROM mst_marcas WHERE id_marca = 'MARCA-TEST';
    DELETE FROM mst_acabados_colores WHERE id_acabado = 'ACAB-TEST';

    INSERT INTO temp_sim_results VALUES (0, 'Limpieza Previa', 'OK', 'Datos anteriores eliminados');

    -- 1. SETUP DE DATOS MAESTROS
    -- =================================================================================================
    INSERT INTO mst_materiales (id_material, nombre_material) VALUES ('MAT-TEST', 'Material de Prueba');
    INSERT INTO mst_marcas (id_marca, nombre_marca) VALUES ('MARCA-TEST', 'Marca Test');
    INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado) VALUES ('ACAB-TEST', 'Acabado Test');
    INSERT INTO mst_proveedores (id_proveedor, razon_social, ruc, moneda_predeterminada) VALUES (v_id_proveedor, 'Proveedor Test SAC', '99999999999', 'PEN');
    INSERT INTO mst_clientes (id_cliente, nombre_completo, ruc, tipo_cliente) VALUES (v_id_cliente, 'Cliente Test SAC', '88888888888', 'EMPRESA');
    INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial) VALUES ('SIS-TEST', 'Sistema Test');
    INSERT INTO mst_familias (id_familia, nombre_familia) VALUES ('FAM-TEST', 'Familia Test');
    INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema) VALUES ('PLANT-TEST', 'Perfil Test', 'FAM-TEST', 'SIS-TEST');

    INSERT INTO temp_sim_results VALUES (1, 'Setup Maestros', 'OK', 'Proveedores, Clientes y Catálogos creados');

    -- 2. CREACIÓN DE PRODUCTO
    -- =================================================================================================
    INSERT INTO cat_productos_variantes (
        id_sku, id_plantilla, id_marca, id_material, id_acabado,
        nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion,
        stock_minimo, punto_pedido
    ) VALUES (
        v_id_sku, 'PLANT-TEST', 'MARCA-TEST', 'MAT-TEST', 'ACAB-TEST',
        'Perfil Aluminio 40x40 Test Extreme', 'UND', 50.00, 'PEN',
        10, 20
    );
    INSERT INTO temp_sim_results VALUES (2, 'Creación SKU', 'OK', 'Producto creado con Costo Base 50.00');

    -- 3. ESCENARIO DE COMPRAS
    -- =================================================================================================
    -- 3.1 Compra Inicial
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku, 100, 50.00, 5000.00);

    SELECT costo_pmp, stock_actual INTO v_pmp_actual, v_stock_actual FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku;
    
    IF v_stock_actual = 100 AND v_pmp_actual = 50.00 THEN
        INSERT INTO temp_sim_results VALUES (3, 'Compra 1 (Inicial)', 'PASS', 'Stock=100, PMP=50.00');
    ELSE
        INSERT INTO temp_sim_results VALUES (3, 'Compra 1 (Inicial)', 'FAIL', format('Stock=%s, PMP=%s', v_stock_actual, v_pmp_actual));
    END IF;

    -- 3.2 Compra Inflación
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku, 50, 80.00, 4000.00);

    SELECT costo_pmp, stock_actual INTO v_pmp_actual, v_stock_actual FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku;

    IF v_stock_actual = 150 AND v_pmp_actual = 60.00 THEN
        INSERT INTO temp_sim_results VALUES (4, 'Compra 2 (Inflación)', 'PASS', 'Stock=150, PMP=60.00 (Promedio Ponderado Correcto)');
    ELSE
        INSERT INTO temp_sim_results VALUES (4, 'Compra 2 (Inflación)', 'FAIL', format('Stock=%s, PMP=%s', v_stock_actual, v_pmp_actual));
    END IF;

    -- 4. ESCENARIO DE VENTAS
    -- =================================================================================================
    INSERT INTO trx_salidas_cabecera (tipo_salida, id_destinatario, estado, fecha)
    VALUES ('VENTA', v_id_cliente, 'CONFIRMADO', NOW()) RETURNING id_salida INTO v_id_salida;

    INSERT INTO trx_salidas_detalle (id_salida, id_sku, cantidad, precio_unitario, subtotal)
    VALUES (v_id_salida, v_id_sku, 20, 150.00, 3000.00);

    SELECT stock_actual INTO v_stock_actual FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku;

    IF v_stock_actual = 130 THEN
        INSERT INTO temp_sim_results VALUES (5, 'Venta (Stock)', 'PASS', 'Stock descontado a 130');
    ELSE
        INSERT INTO temp_sim_results VALUES (5, 'Venta (Stock)', 'FAIL', format('Stock=%s', v_stock_actual));
    END IF;

    SELECT abs(costo_total_pen) INTO v_pmp_actual FROM trx_movimientos WHERE referencia_doc = v_id_salida AND tipo_movimiento = 'VENTA';
    
    IF v_pmp_actual = 1200.00 THEN
        INSERT INTO temp_sim_results VALUES (6, 'Valorización Venta (Kardex)', 'PASS', 'Costo Salida = 1200.00 (Usó PMP 60.00 correctamente)');
    ELSE
        INSERT INTO temp_sim_results VALUES (6, 'Valorización Venta (Kardex)', 'FAIL', format('Costo Salida=%s', v_pmp_actual));
    END IF;

    -- 5. PRUEBAS DE INTEGRIDAD
    -- =================================================================================================
    BEGIN
        INSERT INTO trx_salidas_cabecera (tipo_salida, id_destinatario) VALUES ('VENTA', 'CLIENTE-FANTASMA');
        INSERT INTO temp_sim_results VALUES (7, 'Integridad Cliente FK', 'FAIL', 'Permitió cliente fantasma');
    EXCEPTION WHEN foreign_key_violation THEN
        INSERT INTO temp_sim_results VALUES (7, 'Integridad Cliente FK', 'PASS', 'Bloqueó cliente fantasma');
    END;

    BEGIN
        INSERT INTO trx_entradas_cabecera (tipo_entrada, estado) VALUES ('COMPRA', 'BAD_STATE');
        INSERT INTO temp_sim_results VALUES (8, 'Integridad Estado', 'FAIL', 'Permitió estado inválido');
    EXCEPTION WHEN check_violation THEN
        INSERT INTO temp_sim_results VALUES (8, 'Integridad Estado', 'PASS', 'Bloqueó estado inválido');
    END;

    -- 6. LIMPIEZA FINAL (Simulación de Rollback manual)
    -- =================================================================================================
    DELETE FROM trx_movimientos WHERE id_sku = v_id_sku;
    DELETE FROM trx_entradas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM trx_salidas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM trx_entradas_cabecera WHERE id_proveedor = v_id_proveedor;
    DELETE FROM trx_salidas_cabecera WHERE id_destinatario = v_id_cliente;
    DELETE FROM cat_productos_variantes WHERE id_sku = v_id_sku;
    DELETE FROM cat_plantillas WHERE id_plantilla = 'PLANT-TEST';
    DELETE FROM mst_familias WHERE id_familia = 'FAM-TEST';
    DELETE FROM mst_series_equivalencias WHERE id_sistema = 'SIS-TEST';
    DELETE FROM mst_clientes WHERE id_cliente = v_id_cliente;
    DELETE FROM mst_proveedores WHERE id_proveedor = v_id_proveedor;
    DELETE FROM mst_materiales WHERE id_material = 'MAT-TEST';
    DELETE FROM mst_marcas WHERE id_marca = 'MARCA-TEST';
    DELETE FROM mst_acabados_colores WHERE id_acabado = 'ACAB-TEST';

    INSERT INTO temp_sim_results VALUES (99, 'Limpieza Final', 'OK', 'Todos los datos de prueba fueron eliminados');

END $$;

-- MOSTRAR RESULTADOS
SELECT * FROM temp_sim_results ORDER BY step_id;
DROP TABLE temp_sim_results;
