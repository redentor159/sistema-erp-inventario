-- SCRIPT PARA REGENERAR DESPIECE Y COSTOS MASIVAMENTE
-- Autor: Antigravity
-- Fecha: 2026-02-12

DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Iniciando regeneración masiva de costos...';
    
    FOR r IN SELECT id_linea_cot FROM trx_cotizaciones_detalle LOOP
        -- Llamar a la función de generación para cada línea
        -- Esto recalculará costo de perfiles, vidrio, y fletes con la nueva lógica (USD->PEN)
        PERFORM fn_generar_despiece_ingenieria(r.id_linea_cot);
    END LOOP;
    
    RAISE NOTICE 'Regeneración completada exitosamente.';
END $$;
