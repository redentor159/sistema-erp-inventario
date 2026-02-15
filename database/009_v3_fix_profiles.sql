CREATE OR REPLACE FUNCTION fn_generar_despiece_ingenieria(p_id_linea_cot UUID)
RETURNS VOID AS $$
DECLARE
    v_linea RECORD;
    v_cotizacion RECORD;
    v_receta RECORD;
    v_sku_calculado VARCHAR;
    v_cantidad_calculada NUMERIC;
    v_costo_unit_sku NUMERIC;
    v_costo_total_item NUMERIC;
    v_ancho NUMERIC;
    v_alto NUMERIC;
    v_nombre_final VARCHAR;
    v_nombre_real VARCHAR;
    v_json_val TEXT;
BEGIN
    -- 1. Obtener datos de la linea
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    
    IF v_linea IS NULL THEN
        RAISE NOTICE 'Linea no encontrada: %', p_id_linea_cot;
        RETURN;
    END IF;

    -- Limpiar despiece anterior (excepto manuales)
    DELETE FROM trx_desglose_materiales 
    WHERE id_linea_cot = p_id_linea_cot 
    AND (tipo_componente != 'Servicio' OR tipo_componente IS NULL);

    v_ancho := COALESCE(v_linea.ancho_mm, 1000);
    v_alto := COALESCE(v_linea.alto_mm, 1000);

    -- 2. Iterar Recetas
    -- FIX: Include NULL/Empty conditions as BASE items (Profiles might have NULL)
    FOR v_receta IN 
        SELECT * FROM mst_recetas_ingenieria 
        WHERE id_modelo = v_linea.id_modelo 
        AND (
            condicion = 'BASE' 
            OR condicion IS NULL 
            OR condicion = '' 
            OR condicion = v_linea.tipo_cierre
        )
        ORDER BY orden_visual
    LOOP
        v_sku_calculado := NULL;
        v_nombre_final := v_receta.nombre_componente;
        v_json_val := NULL;

        -- 3a. CHECK OPCIONES (Override)
        IF v_receta.grupo_opcion IS NOT NULL AND v_linea.opciones_seleccionadas IS NOT NULL THEN
             v_json_val := v_linea.opciones_seleccionadas ->> v_receta.grupo_opcion;
             
             IF v_json_val IS NOT NULL AND v_json_val != '' THEN
                 v_sku_calculado := v_json_val;
                 
                 -- Lookup Real Name & Cost together
                 SELECT nombre_completo, costo_mercado_unit 
                 INTO v_nombre_real, v_costo_unit_sku
                 FROM cat_productos_variantes 
                 WHERE id_sku = v_sku_calculado;

                 IF v_nombre_real IS NOT NULL THEN
                    v_nombre_final := v_nombre_real;
                 END IF;
             END IF;
        END IF;

        -- 3b. Default Calculation fallback
        IF v_sku_calculado IS NULL OR v_sku_calculado = '' THEN
             IF v_receta.id_sku_catalogo IS NOT NULL OR v_receta.formula_cantidad IS NOT NULL THEN
                -- Wrap in BEGIN/EXCEPTION block to prevent crash if formula fails
                BEGIN
                    v_sku_calculado := fn_calcular_sku_real(
                        v_receta.id_material_receta,
                        v_receta.id_acabado_receta,
                        v_linea.color_perfiles,
                        v_linea.tipo_vidrio,
                        v_linea.id_sistema, 
                        v_receta.id_sku_catalogo
                    );
                EXCEPTION WHEN OTHERS THEN
                    -- Log error but continue
                    RAISE NOTICE 'Error calculating SKU for recette %: %', v_receta.id_receta, SQLERRM;
                    v_sku_calculado := NULL;
                END;
             END IF;
        END IF;

        -- 4. Calculate Quantity
        BEGIN
            v_cantidad_calculada := fn_evaluar_formula(v_receta.formula_cantidad, v_ancho, v_alto, v_linea.cantidad);
        EXCEPTION WHEN OTHERS THEN
            v_cantidad_calculada := 0;
            RAISE NOTICE 'Error calculating formula for recette %: %', v_receta.id_receta, SQLERRM;
        END;

        -- 5. Get Cost (Double check if not fetched above)
        IF v_sku_calculado IS NOT NULL AND v_sku_calculado != '' THEN
            SELECT costo_mercado_unit INTO v_costo_unit_sku 
            FROM cat_productos_variantes 
            WHERE id_sku = v_sku_calculado;
            
            IF v_costo_unit_sku IS NULL THEN v_costo_unit_sku := 0; END IF;
        ELSE
            v_costo_unit_sku := 0;
        END IF;

        -- 6. Insert
        IF v_cantidad_calculada > 0 AND v_sku_calculado IS NOT NULL AND v_sku_calculado != '' THEN
            v_costo_total_item := v_cantidad_calculada * v_costo_unit_sku;
            
            INSERT INTO trx_desglose_materiales (
                id_linea_cot,
                tipo_componente,
                nombre_componente,
                cantidad_calculada,
                sku_real,
                costo_total_item
            ) VALUES (
                p_id_linea_cot,
                v_receta.tipo,
                v_nombre_final, 
                v_cantidad_calculada,
                v_sku_calculado,
                v_costo_total_item
            );
        END IF;

    END LOOP;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Critical Error in fn_generar_despiece_ingenieria: %', SQLERRM;
    RAISE; 
END;
$$ LANGUAGE plpgsql;
