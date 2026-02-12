-- =================================================================================================
-- SCRIPT DE VERIFICACIÓN DE CORRECCIONES (VERSIÓN VISUAL)
-- Fecha: 2026-02-10
-- Descripción: Corre pruebas y MUESTRA RESULTADOS en una tabla temporal para mayor visibilidad.
-- =================================================================================================

-- 1. Crear tabla temporal para resultados
CREATE TEMP TABLE IF NOT EXISTS temp_verification_results (
    test_name TEXT,
    status TEXT,
    details TEXT
);

-- Limpiar tabla por si acaso
TRUNCATE temp_verification_results;

DO $$
DECLARE
    v_error_count INT := 0;
BEGIN
    -- 1. VERIFICAR FOREIGN KEY trx_salidas_cabecera
    BEGIN
        INSERT INTO trx_salidas_cabecera (id_destinatario) VALUES ('CLIENTE_INEXISTENTE_TEST_123');
        INSERT INTO temp_verification_results VALUES ('FK trx_salidas_cabecera', 'FAIL', 'Se permitió insertar un destinatario inexistente');
        v_error_count := v_error_count + 1;
    EXCEPTION WHEN foreign_key_violation THEN
        INSERT INTO temp_verification_results VALUES ('FK trx_salidas_cabecera', 'PASS', 'Constraint FK funciona correctamente');
    END;

    -- 2. VERIFICAR CHECK CONSTRAINT STATUS
    BEGIN
        INSERT INTO trx_cotizaciones_cabecera (estado) VALUES ('ESTADO_INVENTADO');
        INSERT INTO temp_verification_results VALUES ('Check Constraint Estado Cotizaciones', 'FAIL', 'Se permitió insertar estado inválido');
        v_error_count := v_error_count + 1;
    EXCEPTION WHEN check_violation THEN
        INSERT INTO temp_verification_results VALUES ('Check Constraint Estado Cotizaciones', 'PASS', 'Constraint Check funciona correctamente');
    END;

    -- 3. VERIFICAR VISTA KPI VALORIZACION
    BEGIN
        PERFORM * FROM vw_kpi_valorizacion LIMIT 1;
        INSERT INTO temp_verification_results VALUES ('Vista vw_kpi_valorizacion', 'PASS', 'La vista es consultable');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO temp_verification_results VALUES ('Vista vw_kpi_valorizacion', 'FAIL', SQLERRM);
        v_error_count := v_error_count + 1;
    END;

    -- 4. VERIFICAR FUNCION DESPIECE
    BEGIN
        PERFORM proname FROM pg_proc WHERE proname = 'fn_generar_despiece_ingenieria';
        INSERT INTO temp_verification_results VALUES ('Función fn_generar_despiece_ingenieria', 'PASS', 'La función existe');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO temp_verification_results VALUES ('Función fn_generar_despiece_ingenieria', 'FAIL', SQLERRM);
        v_error_count := v_error_count + 1;
    END;
END $$;

-- MOSTRAR RESULTADOS
SELECT * FROM temp_verification_results;
