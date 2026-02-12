-- =================================================================================================
-- SCRIPT DE LIMPIEZA DE PRUEBA MANUAL
-- Fecha: 2026-02-10
-- Descripción: Limpia los datos generados por manual_test_persist.sql
--              EJECUTAR ESTE SCRIPT AL FINALIZAR TUS PRUEBAS MANUALES.
-- =================================================================================================

DO $$
DECLARE
    -- IDs usados en la prueba
    v_id_proveedor TEXT := 'PROV-TEST-999';
    v_id_cliente TEXT := 'CLI-TEST-999';
    v_id_sku TEXT := 'SKU-TEST-ALUM-4040';
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'LIMPIANDO DATOS DE PRUEBA MANUAL...';
    RAISE NOTICE '==================================================';

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

    RAISE NOTICE '✅ LIMPIEZA COMPLETA.';
    RAISE NOTICE 'Tu base de datos ha quedado como estaba antes de la prueba.';
END $$;
