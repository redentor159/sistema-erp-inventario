-- VERIFICATION SCRIPT: COTIZACION + DESPIECE (SERIE 80)
-- Run this in Supabase SQL Editor to verify the logic.

DO $$
DECLARE
    v_id_cot UUID;
    v_id_linea UUID;
    v_count INT;
BEGIN
    RAISE NOTICE '1. Creating Cotizacion Header...';
    INSERT INTO trx_cotizaciones_cabecera (nombre_proyecto, id_cliente, estado, id_marca, costo_mano_obra_m2)
    VALUES ('TEST S80 VERIFICATION', NULL, 'BORRADOR', 'GEN', 50.00)
    RETURNING id_cotizacion INTO v_id_cot;

    RAISE NOTICE '2. Adding Item (Serie 80 - 3 Hojas)...';
    -- Width: 3000mm, Height: 2400mm, Quantity: 1, Color: MAT (Mate/Natural)
    INSERT INTO trx_cotizaciones_detalle (
        id_cotizacion, id_modelo, cantidad, ancho_mm, alto_mm, tipo_vidrio, color_perfiles
    )
    VALUES (
        v_id_cot, 'S80_3H', 1, 3000, 2400, 'TEMPLADO 10mm', 'MAT'
    )
    RETURNING id_linea_cot INTO v_id_linea;

    RAISE NOTICE '3. Cleaning up Static E+F from Recetas (We use logic now)...';
    DELETE FROM mst_recetas_ingenieria WHERE nombre_componente LIKE '%Flete%';

    RAISE NOTICE '4. Triggering Despiece Logic (RPC)...';
    PERFORM fn_generar_despiece_ingenieria(v_id_linea);

    RAISE NOTICE '5. Verifying Results...';
    SELECT COUNT(*) INTO v_count FROM trx_desglose_materiales WHERE id_linea_cot = v_id_linea;
    
    RAISE NOTICE 'Despiece Generated: % items found.', v_count;

    IF v_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Despiece generated correctly.';
        
        -- Optional: Show some details (will show in Messages tab)
        -- SELECT tipo_componente, nombre_componente, cantidad_calculada, medida_corte_mm 
        -- FROM trx_desglose_materiales WHERE id_linea_cot = v_id_linea;
    ELSE
        RAISE EXCEPTION 'FAILURE: No despiece items were generated. Check Recetas or Logic.';
    END IF;

    -- Cleanup (Optional - comment out to keep data for inspection)
    -- DELETE FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_id_cot;
END $$;
