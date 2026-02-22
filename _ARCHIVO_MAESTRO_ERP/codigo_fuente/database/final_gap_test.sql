-- =================================================================================================
-- SCRIPT DE COBERTURA FINAL (GAPS & KPI CHECK) - FIXED
-- Fecha: 2026-02-10
-- Descripción: Cubre Producción (Mermas), Devoluciones y Validación Global de KPIs.
--              Incluye creación de Dependencias Maestras.
-- =================================================================================================

CREATE TEMP TABLE IF NOT EXISTS temp_gap_results (
    step_id INT,
    step_name TEXT,
    status TEXT,
    details TEXT
);
TRUNCATE temp_gap_results;

DO $$
DECLARE
    -- IDs
    v_id_proveedor TEXT := 'PROV-GAP-01';
    v_id_cliente TEXT := 'CLI-GAP-01';
    v_id_sku TEXT := 'SKU-GAP-TEST';
    
    v_id_entrada UUID;
    v_id_salida UUID;
    v_stock NUMERIC;
    v_pmp NUMERIC;
    
    v_kpi_total_view NUMERIC;
    v_kpi_total_calc NUMERIC;
BEGIN
    -- 0. CLEANUP PREVIO
    DELETE FROM trx_movimientos WHERE id_sku = v_id_sku;
    DELETE FROM trx_entradas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM trx_salidas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM cat_productos_variantes WHERE id_sku = v_id_sku;
    
    DELETE FROM cat_plantillas WHERE id_plantilla = 'PLANT-TEST';
    DELETE FROM mst_familias WHERE id_familia = 'FAM-TEST';
    DELETE FROM mst_series_equivalencias WHERE id_sistema = 'SIS-TEST';
    DELETE FROM mst_materiales WHERE id_material = 'MAT-TEST';
    DELETE FROM mst_marcas WHERE id_marca = 'MARCA-TEST';
    DELETE FROM mst_acabados_colores WHERE id_acabado = 'ACAB-TEST';

    DELETE FROM mst_proveedores WHERE id_proveedor = v_id_proveedor;
    DELETE FROM mst_clientes WHERE id_cliente = v_id_cliente;

    -- Setup Dependencias
    INSERT INTO mst_materiales (id_material, nombre_material) VALUES ('MAT-TEST', 'Material de Prueba') ON CONFLICT DO NOTHING;
    INSERT INTO mst_marcas (id_marca, nombre_marca) VALUES ('MARCA-TEST', 'Marca Test') ON CONFLICT DO NOTHING;
    INSERT INTO mst_acabados_colores (id_acabado, nombre_acabado) VALUES ('ACAB-TEST', 'Acabado Test') ON CONFLICT DO NOTHING;
    INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial) VALUES ('SIS-TEST', 'Sistema Test') ON CONFLICT DO NOTHING;
    INSERT INTO mst_familias (id_familia, nombre_familia) VALUES ('FAM-TEST', 'Familia Test') ON CONFLICT DO NOTHING;
    INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema) 
    VALUES ('PLANT-TEST', 'Perfil Test', 'FAM-TEST', 'SIS-TEST') ON CONFLICT DO NOTHING;

    INSERT INTO mst_proveedores (id_proveedor, razon_social, ruc, moneda_predeterminada) VALUES (v_id_proveedor, 'Prov Gap LLC', '33333333333', 'PEN') ON CONFLICT DO NOTHING;
    INSERT INTO mst_clientes (id_cliente, nombre_completo, ruc, tipo_cliente) VALUES (v_id_cliente, 'Cliente Gap', '44444444444', 'EMPRESA') ON CONFLICT DO NOTHING;
    
    INSERT INTO cat_productos_variantes (id_sku, id_plantilla, id_marca, id_material, id_acabado, nombre_completo, unidad_medida, stock_minimo)
    VALUES (v_id_sku, 'PLANT-TEST', 'MARCA-TEST', 'MAT-TEST', 'ACAB-TEST', 'Item Gap Test', 'UND', 10);
    
    -- Stock Inicial: 100 @ 10.00
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro)
    VALUES ('COMPRA', v_id_proveedor, 'PEN', 'RECIBIDO', NOW()) RETURNING id_entrada INTO v_id_entrada;
    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku, 100, 10.00, 1000.00);

    INSERT INTO temp_gap_results VALUES (0, 'Setup', 'OK', 'Stock Inicial 100 @ 10.00');

    -- =================================================================================================
    -- ESCENARIO 2.2: SALIDA POR PRODUCCIÓN (MERMAS/CONSUMO INTERNO)
    -- =================================================================================================
    
    INSERT INTO trx_salidas_cabecera (tipo_salida, id_destinatario, estado, fecha, comentario)
    VALUES ('PRODUCCION', v_id_cliente, 'CONFIRMADO', NOW(), 'Consumo Interno Taller') RETURNING id_salida INTO v_id_salida;

    INSERT INTO trx_salidas_detalle (id_salida, id_sku, cantidad, precio_unitario, subtotal)
    VALUES (v_id_salida, v_id_sku, 10, 0, 0); 

    -- Verificar que salió al costo PMP (10.00)
    SELECT abs(costo_total_pen) INTO v_pmp FROM trx_movimientos WHERE referencia_doc = v_id_salida;
    SELECT stock_actual INTO v_stock FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku;

    IF v_stock = 90 AND v_pmp = 100.00 THEN 
        INSERT INTO temp_gap_results VALUES (1, 'Salida Producción', 'PASS', 'Stock bajó a 90, Costo Asignado = 100.00 (Correcto)');
    ELSE
        INSERT INTO temp_gap_results VALUES (1, 'Salida Producción', 'FAIL', format('Stock=%s, Costo=%s', v_stock, v_pmp));
    END IF;

    -- =================================================================================================
    -- ESCENARIO 5.4: DEVOLUCIÓN (EXTORNO)
    -- =================================================================================================
    
    INSERT INTO trx_entradas_cabecera (tipo_entrada, id_proveedor, moneda, estado, fecha_registro, comentario)
    VALUES ('DEVOLUCION_CLIENTE', NULL, 'PEN', 'RECIBIDO', NOW(), 'Devolucion Cliente') RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO trx_entradas_detalle (id_entrada, id_sku, cantidad, costo_unitario, total_linea)
    VALUES (v_id_entrada, v_id_sku, 5, 10.00, 50.00);

    SELECT stock_actual INTO v_stock FROM vw_dashboard_stock_realtime WHERE id_sku = v_id_sku;

    IF v_stock = 95 THEN
        INSERT INTO temp_gap_results VALUES (2, 'Devolución Cliente', 'PASS', 'Stock subió a 95 (Correcto)');
    ELSE
        INSERT INTO temp_gap_results VALUES (2, 'Devolución Cliente', 'FAIL', format('Stock=%s', v_stock));
    END IF;

    -- =================================================================================================
    -- ESCENARIO 4.1: VALIDACIÓN GLOBAL DE KPI (SUMA VS VISTA)
    -- =================================================================================================
    
    SELECT SUM(stock_actual * costo_pmp) INTO v_kpi_total_calc FROM vw_dashboard_stock_realtime;
    SELECT valor_inventario_pen INTO v_kpi_total_view FROM vw_kpi_valorizacion;

    IF ABS(COALESCE(v_kpi_total_calc,0) - COALESCE(v_kpi_total_view,0)) < 0.05 THEN
        INSERT INTO temp_gap_results VALUES (3, 'KPI Global Valorización', 'PASS', format('Vista (%s) == Cálculo Manual (%s)', v_kpi_total_view, v_kpi_total_calc));
    ELSE
        INSERT INTO temp_gap_results VALUES (3, 'KPI Global Valorización', 'FAIL', format('Diferencia detectada: Vista=%s, Manual=%s', v_kpi_total_view, v_kpi_total_calc));
    END IF;

    -- =================================================================================================
    -- LIMPIEZA FINAL
    -- =================================================================================================
    DELETE FROM trx_movimientos WHERE id_sku = v_id_sku;
    DELETE FROM trx_entradas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM trx_salidas_detalle WHERE id_sku = v_id_sku;
    DELETE FROM cat_productos_variantes WHERE id_sku = v_id_sku;
    
    DELETE FROM cat_plantillas WHERE id_plantilla = 'PLANT-TEST';
    DELETE FROM mst_familias WHERE id_familia = 'FAM-TEST';
    DELETE FROM mst_series_equivalencias WHERE id_sistema = 'SIS-TEST';
    DELETE FROM mst_materiales WHERE id_material = 'MAT-TEST';
    DELETE FROM mst_marcas WHERE id_marca = 'MARCA-TEST';
    DELETE FROM mst_acabados_colores WHERE id_acabado = 'ACAB-TEST';

    DELETE FROM mst_proveedores WHERE id_proveedor = v_id_proveedor;
    DELETE FROM mst_clientes WHERE id_cliente = v_id_cliente;

    INSERT INTO temp_gap_results VALUES (99, 'Limpieza Final', 'OK', 'Datos eliminados');
END $$;

SELECT * FROM temp_gap_results ORDER BY step_id;
DROP TABLE temp_gap_results;
