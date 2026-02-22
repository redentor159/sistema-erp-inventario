-- =================================================================================================
-- SCRIPT DE PRUEBA MANUAL (PERSISTENTE)
-- Fecha: 2026-02-10
-- Descripción: Inserta los datos de prueba PERO NO LOS BORRA.
--              Te permite ir a las tablas y VERIFICAR MANUALMENTE los cálculos.
--              AL FINALIZAR TUS PRUEBAS, EJECUTA: manual_test_cleanup.sql
-- =================================================================================================

DO $$
DECLARE
    -- IDs para datos de prueba
    v_id_proveedor TEXT := 'PROV-TEST-999';
    v_id_cliente TEXT := 'CLI-TEST-999';
    v_id_sku TEXT := 'SKU-TEST-ALUM-4040';
    v_id_entrada UUID;
    v_id_salida UUID;
BEGIN
    -- 0. CLEANUP PREVIO (Por si quedaron residuos anteriores)
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

    -- 1. SETUP DE DATOS MAESTROS
    INSERT INTO mst_materiales (id_material, nombre_material) VALUES ('MAT-TEST', 'Material de Prueba');
    INSERT INTO mst_marcas (id_marca, nombre_marca) VALUES ('MARCA-TEST', 'Marca Test');
    INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado) VALUES ('ACAB-TEST', 'Acabado Test');
    INSERT INTO mst_proveedores (id_proveedor, razon_social, ruc, moneda_predeterminada) VALUES (v_id_proveedor, 'Proveedor Test SAC', '99999999999', 'PEN');
    INSERT INTO mst_clientes (id_cliente, nombre_completo, ruc, tipo_cliente) VALUES (v_id_cliente, 'Cliente Test SAC', '88888888888', 'EMPRESA');
    INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial) VALUES ('SIS-TEST', 'Sistema Test');
    INSERT INTO mst_familias (id_familia, nombre_familia) VALUES ('FAM-TEST', 'Familia Test');
    INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema) VALUES ('PLANT-TEST', 'Perfil Test', 'FAM-TEST', 'SIS-TEST');

    -- 2. CREACIÓN DE PRODUCTO
    INSERT INTO cat_productos_variantes (
        id_sku, id_plantilla, id_marca, id_material, id_acabado,
        nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion,
        stock_minimo, punto_pedido
    ) VALUES (
        v_id_sku, 'PLANT-TEST', 'MARCA-TEST', 'MAT-TEST', 'ACAB-TEST',
        'Perfil Aluminio 40x40 Test Extreme', 'UND', 50.00, 'PEN',
        10, 20
    );

    -- 3. COMPRA 1 (100 @ 50.00)
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku, 100, 50.00, 5000.00);

    -- 4. COMPRA 2 (50 @ 80.00)
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku, 50, 80.00, 4000.00);

    -- 5. VENTA (20 @ 150.00 de PVP) -> Debe salir a Costo PMP 60.00
    INSERT INTO trx_salidas_cabecera (tipo_salida, id_destinatario, estado, fecha)
    VALUES ('VENTA', v_id_cliente, 'CONFIRMADO', NOW()) RETURNING id_salida INTO v_id_salida;

    INSERT INTO trx_salidas_detalle (id_salida, id_sku, cantidad, precio_unitario, subtotal)
    VALUES (v_id_salida, v_id_sku, 20, 150.00, 3000.00);

    RAISE NOTICE '✅ DATOS CREADOS CORRECTAMENTE.';
    RAISE NOTICE 'AHORA VE A DBeaver Y EJECUTA ESTAS CONSULTAS PARA VERIFICAR:';
    RAISE NOTICE '1. SELECT * FROM vw_dashboard_stock_realtime WHERE id_sku = ''SKU-TEST-ALUM-4040'';';
    RAISE NOTICE '   -> Deberías ver Stock=130 y CostoPMP=60.00';
    RAISE NOTICE '2. SELECT * FROM vw_kardex_reporte WHERE id_sku = ''SKU-TEST-ALUM-4040'' ORDER BY fecha_hora;';
    RAISE NOTICE '   -> Deberías ver las 2 entradas y la salida valorizada a 1200.00';
END $$;
