-- 102_experimento_hito5_despiece_motor.sql
-- Motor de despiece hibrido (Legacy 1x1 + Tipologias)

CREATE OR REPLACE FUNCTION public.fn_generar_despiece_ingenieria(p_id_linea_cot uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_linea RECORD;
    v_cotizacion RECORD;
    v_config RECORD;
    v_tipo_cambio NUMERIC;
    
    -- Variables globales de Costeo
    v_costo_total_item_bruto NUMERIC := 0; 
    
    -- Variables para Iteracion Normal (Legacy)
    v_area_total NUMERIC;
    
    -- Variables para Tipologias
    v_tipologia RECORD;
    v_item RECORD;
    v_cruce RECORD;
    
    -- Acumuladores Temporales por Item de Tipologia
    v_ancho_neto NUMERIC;
    v_alto_neto NUMERIC;
    v_area_neta NUMERIC;
    v_hojas_modelo NUMERIC;
    
    -- Variables de Receta compartidas
    v_receta RECORD;
    v_sku_calculado VARCHAR;
    v_cantidad_calculada NUMERIC;
    v_medida_corte NUMERIC;
    v_costo_unit_sku NUMERIC;
    v_costo_total_material NUMERIC;
    v_moneda_sku VARCHAR;
    v_nombre_final VARCHAR;
    v_nombre_real VARCHAR;
    v_json_val TEXT;

    -- Variables Vidrio
    v_costo_vidrio NUMERIC := 0;
    v_es_templado BOOLEAN := FALSE;
    v_costo_flete_m2 NUMERIC := 0;
    v_moneda_vidrio VARCHAR;
    v_factor_flete NUMERIC := 0;
    
    -- Control
    v_es_modelo_tipologia BOOLEAN := FALSE;

BEGIN
    -- A. Obtener datos de la linea
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    IF NOT FOUND THEN RETURN; END IF;

    SELECT * INTO v_cotizacion FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_linea.id_cotizacion;

    SELECT * INTO v_config FROM mst_config_general LIMIT 1;
    v_tipo_cambio := COALESCE(v_config.tipo_cambio_referencial, 3.75);

    -- Limpiar despiece anterior
    DELETE FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    -- Determinar Modo: ¿Es legacy (1x1) o es Grid de Tipologia?
    IF v_linea.tipologia_id IS NOT NULL THEN
        SELECT * INTO v_tipologia FROM tipologias WHERE id = v_linea.tipologia_id;
        IF FOUND THEN
            v_es_modelo_tipologia := TRUE;
        END IF;
    END IF;

    -- =========================================================================
    -- RAMA 1: NUEVO MODO TIPOLOGÍAS (GRID)
    -- =========================================================================
    IF v_es_modelo_tipologia THEN
        
        -- 1. Iterar todos los Items de la tipologia (Las Ventanas hijas)
        FOR v_item IN SELECT * FROM tipologias_items WHERE tipologia_id = v_tipologia.id LOOP
            
            -- Calcular Ancho/Alto NETO (Aproximación inicial: Mismas formulas que front-end)
            -- WARNING: Una calculín estricta requeriría emular NetDimensionsResolver completo aquí o 
            -- pasar las medidas ya pre-calculadas en la tabla `tipologias_items`.
            -- Para este Hito 5, asumiremos transposición directa por ahora si no hay API.
            -- IMPORTANTE: Aquí deberíamos leer v_item.ancho_neto si lo hubiéramos precalculado en JS.
            
            -- HACK TEMPORAL DE DEMOSTRACION (Asumiendo que JS guarda las medidas en la tabla de items, o calculamos algo simple)
            -- idealmente la tabla tipologias_items debe tener ancho_neto_mm y alto_neto_mm guardado x JS
            -- como no lo tiene aun, hacemos failback a dividir el ancho total por 1.
            
            v_ancho_neto := (v_tipologia.ancho_total_mm / v_item.grid_col_span); -- Simplified
            v_alto_neto := (v_tipologia.alto_total_mm / v_item.grid_row_span);   -- Simplified
            v_area_neta := (v_ancho_neto * v_alto_neto) / 1000000.0;
            
            SELECT COALESCE(num_hojas, 1) INTO v_hojas_modelo FROM mst_recetas_modelos WHERE id_modelo = v_item.producto_id;

            -- 1.1 Explotar Receta del Ítem Hijo
            FOR v_receta IN 
                SELECT * FROM mst_recetas_ingenieria 
                WHERE id_modelo = v_item.producto_id 
                AND (condicion IS NULL OR condicion = 'BASE' OR condicion = '' OR condicion = v_linea.tipo_cierre)
                ORDER BY orden_visual
            LOOP
                -- AQUI REUTLIZAMOS LA LOGICA EXISTENTE EXTRAIDA A UNA FN O INLINE
                -- (Por brevedad del script inlineamos las partes core)
                v_sku_calculado := NULL;
                v_nombre_final := v_receta.nombre_componente || ' (P' || v_item.grid_col_start || ')';
                v_cantidad_calculada := 0; v_medida_corte := 0;
                
                IF v_receta.formula_cantidad IS NOT NULL AND TRIM(v_receta.formula_cantidad) <> '' THEN
                    v_cantidad_calculada := fn_evaluar_formula(v_receta.formula_cantidad, v_ancho_neto, v_alto_neto, v_hojas_modelo);
                ELSE
                    v_cantidad_calculada := COALESCE(v_receta.cantidad_base, 0);
                    IF COALESCE(v_receta.factor_cantidad_ancho, 0) > 0 OR COALESCE(v_receta.factor_cantidad_alto, 0) > 0 THEN
                        v_cantidad_calculada := (COALESCE(v_receta.factor_cantidad_ancho, 0) * v_ancho_neto) + (COALESCE(v_receta.factor_cantidad_alto, 0) * v_alto_neto);
                    END IF;
                END IF;

                IF v_receta.tipo = 'Perfil' THEN
                    IF v_receta.formula_perfil IS NOT NULL AND TRIM(v_receta.formula_perfil) <> '' THEN
                        v_medida_corte := fn_evaluar_formula(v_receta.formula_perfil, v_ancho_neto, v_alto_neto, v_hojas_modelo);
                    ELSE
                        v_medida_corte := (COALESCE(v_receta.factor_corte_ancho, 0) * v_ancho_neto) + (COALESCE(v_receta.factor_corte_alto, 0) * v_alto_neto) + COALESCE(v_receta.constante_corte_mm, 0);
                    END IF;
                END IF;

                -- Opciones
                IF v_receta.grupo_opcion IS NOT NULL AND v_linea.opciones_seleccionadas IS NOT NULL THEN
                    v_json_val := v_linea.opciones_seleccionadas ->> v_receta.grupo_opcion;
                    IF v_json_val IS NOT NULL AND v_json_val != '' THEN v_sku_calculado := v_json_val; END IF;
                END IF;

                IF v_sku_calculado IS NULL THEN
                    IF v_receta.id_sku_catalogo IS NOT NULL AND v_receta.id_sku_catalogo <> '' THEN
                        v_sku_calculado := v_receta.id_sku_catalogo;
                    ELSE
                        BEGIN v_sku_calculado := fn_calcular_sku_real(v_receta.tipo, v_receta.id_plantilla, v_linea.color_perfiles, v_cotizacion.id_marca, v_receta.id_material_receta, v_receta.id_acabado_receta, v_receta.id_marca_receta); EXCEPTION WHEN OTHERS THEN v_sku_calculado := NULL; END;
                    END IF;
                END IF;

                v_costo_unit_sku := 0; v_moneda_sku := 'PEN';
                IF v_sku_calculado IS NOT NULL THEN
                    SELECT costo_mercado_unit, nombre_completo, moneda_reposicion INTO v_costo_unit_sku, v_nombre_real, v_moneda_sku FROM cat_productos_variantes WHERE id_sku = v_sku_calculado;
                    IF v_nombre_real IS NOT NULL THEN v_nombre_final := v_nombre_real || ' (P' || v_item.grid_col_start || ')'; END IF;
                END IF;

                IF v_cantidad_calculada > 0 THEN
                    IF v_moneda_sku = 'USD' THEN v_costo_unit_sku := v_costo_unit_sku * v_tipo_cambio; END IF;

                    IF v_receta.tipo = 'Perfil' THEN
                        v_costo_unit_sku := v_costo_unit_sku / 6.0;
                        v_costo_total_material := (v_cantidad_calculada) * (v_medida_corte / 1000.0) * COALESCE(v_costo_unit_sku, 0);
                    ELSE
                        v_costo_total_material := (v_cantidad_calculada) * COALESCE(v_costo_unit_sku, 0);
                    END IF;

                    INSERT INTO trx_desglose_materiales (
                        id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, sku_real, costo_total_item, precio_venta_item, medida_corte_mm, codigo_base, angulo_corte, detalle_acabado
                    ) VALUES (
                        p_id_linea_cot, v_receta.tipo, v_nombre_final, v_cantidad_calculada, COALESCE(v_sku_calculado, 'PENDIENTE'), COALESCE(v_costo_total_material, 0), COALESCE(v_costo_total_material, 0), v_medida_corte, v_receta.id_plantilla, v_receta.angulo, v_linea.color_perfiles
                    );
                END IF;
            END LOOP; -- Fin Iteracion Receta Item
            
            -- (Omitiendo Fletes y Vidrios de Tipologia por ahora para no saturar 
            -- o se calcularian sumando las areas totales al final)

        END LOOP; -- Fin Iteracion Tipologia Items

        -- 2. Iterar Coste de Cruces (Los Transoms y Mullions fisicos)
        FOR v_cruce IN SELECT * FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id LOOP
            -- Aqui inyectariamos el costo del perfil divisor (Tubular u otro).
            -- REQUIERE que tipologias_cruces tenga un `perfil_sku` como FK_
            NULL;
        END LOOP;

    -- =========================================================================
    -- RAMA 2: MODO LEGACY CLASICO (1x1)
    -- =========================================================================
    ELSE
        v_ancho_neto := COALESCE(v_linea.ancho_mm, 0);
        v_alto_neto := COALESCE(v_linea.alto_mm, 0);
        v_area_total := (v_ancho_neto * v_alto_neto / 1000000.0);
        SELECT COALESCE(num_hojas, 1) INTO v_hojas_modelo FROM mst_recetas_modelos WHERE id_modelo = v_linea.id_modelo;

        -- Evaluar Flete factor
        IF v_linea.opciones_seleccionadas ? 'factor_flete' THEN
            IF (v_linea.opciones_seleccionadas->>'factor_flete') = 'Otro' THEN v_factor_flete := NULLIF((v_linea.opciones_seleccionadas->>'factor_flete_otro'), '')::NUMERIC;
            ELSE v_factor_flete := NULLIF((v_linea.opciones_seleccionadas->>'factor_flete'), '')::NUMERIC; END IF;
        END IF;

        FOR v_receta IN SELECT * FROM mst_recetas_ingenieria WHERE id_modelo = v_linea.id_modelo AND (condicion IS NULL OR condicion = 'BASE' OR condicion = '' OR condicion = v_linea.tipo_cierre) ORDER BY orden_visual LOOP
            
            v_sku_calculado := NULL; v_nombre_final := v_receta.nombre_componente; v_cantidad_calculada := 0; v_medida_corte := 0;
            
            IF v_receta.formula_cantidad IS NOT NULL AND TRIM(v_receta.formula_cantidad) <> '' THEN
                v_cantidad_calculada := fn_evaluar_formula(v_receta.formula_cantidad, v_ancho_neto, v_alto_neto, v_hojas_modelo);
            ELSE
                v_cantidad_calculada := COALESCE(v_receta.cantidad_base, 0);
                IF COALESCE(v_receta.factor_cantidad_ancho, 0) > 0 OR COALESCE(v_receta.factor_cantidad_alto, 0) > 0 THEN
                    v_cantidad_calculada := (COALESCE(v_receta.factor_cantidad_ancho, 0) * v_ancho_neto) + (COALESCE(v_receta.factor_cantidad_alto, 0) * v_alto_neto);
                END IF;
            END IF;

            IF v_receta.tipo = 'Perfil' THEN
                IF v_receta.formula_perfil IS NOT NULL AND TRIM(v_receta.formula_perfil) <> '' THEN
                    v_medida_corte := fn_evaluar_formula(v_receta.formula_perfil, v_ancho_neto, v_alto_neto, v_hojas_modelo);
                ELSE
                    v_medida_corte := (COALESCE(v_receta.factor_corte_ancho, 0) * v_ancho_neto) + (COALESCE(v_receta.factor_corte_alto, 0) * v_alto_neto) + COALESCE(v_receta.constante_corte_mm, 0);
                END IF;
            END IF;

            IF v_receta.grupo_opcion IS NOT NULL AND v_linea.opciones_seleccionadas IS NOT NULL THEN
                v_json_val := v_linea.opciones_seleccionadas ->> v_receta.grupo_opcion;
                IF v_json_val IS NOT NULL AND v_json_val != '' THEN v_sku_calculado := v_json_val; END IF;
            END IF;

            IF v_sku_calculado IS NULL THEN
                IF v_receta.id_sku_catalogo IS NOT NULL AND v_receta.id_sku_catalogo <> '' THEN v_sku_calculado := v_receta.id_sku_catalogo;
                ELSE BEGIN v_sku_calculado := fn_calcular_sku_real(v_receta.tipo, v_receta.id_plantilla, v_linea.color_perfiles, v_cotizacion.id_marca, v_receta.id_material_receta, v_receta.id_acabado_receta, v_receta.id_marca_receta); EXCEPTION WHEN OTHERS THEN v_sku_calculado := NULL; END; END IF;
            END IF;

            v_costo_unit_sku := 0; v_moneda_sku := 'PEN';
            IF v_sku_calculado IS NOT NULL THEN
                SELECT costo_mercado_unit, nombre_completo, moneda_reposicion INTO v_costo_unit_sku, v_nombre_real, v_moneda_sku FROM cat_productos_variantes WHERE id_sku = v_sku_calculado;
                IF v_nombre_real IS NOT NULL THEN v_nombre_final := v_nombre_real; END IF;
            END IF;

            IF v_cantidad_calculada > 0 THEN
                IF v_moneda_sku = 'USD' THEN v_costo_unit_sku := v_costo_unit_sku * v_tipo_cambio; END IF;

                IF v_receta.tipo = 'Perfil' THEN
                    v_costo_unit_sku := v_costo_unit_sku / 6.0;
                    v_costo_total_material := (v_cantidad_calculada) * (v_medida_corte / 1000.0) * COALESCE(v_costo_unit_sku, 0);
                ELSE
                    v_costo_total_material := (v_cantidad_calculada) * COALESCE(v_costo_unit_sku, 0);
                END IF;

                INSERT INTO trx_desglose_materiales (
                    id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, sku_real, costo_total_item, precio_venta_item, medida_corte_mm, codigo_base, angulo_corte, detalle_acabado
                ) VALUES (
                    p_id_linea_cot, v_receta.tipo, v_nombre_final, v_cantidad_calculada, COALESCE(v_sku_calculado, 'PENDIENTE'), COALESCE(v_costo_total_material, 0), COALESCE(v_costo_total_material, 0), v_medida_corte, v_receta.id_plantilla, v_receta.angulo, v_linea.color_perfiles
                );
            END IF;
        END LOOP;
        
        -- C. INSERTAR VIDRIO (Restored + Updated Logic - UNITARY)
        IF v_linea.tipo_vidrio IS NOT NULL AND v_linea.tipo_vidrio <> '' THEN
            -- Buscar datos del vidrio
            SELECT costo_mercado_unit, es_templado, costo_flete_m2, moneda_reposicion
            INTO v_costo_vidrio, v_es_templado, v_costo_flete_m2, v_moneda_vidrio
            FROM cat_productos_variantes WHERE id_sku = v_linea.tipo_vidrio;
            
            IF v_costo_vidrio IS NULL THEN
                SELECT costo_mercado_unit, es_templado, costo_flete_m2, moneda_reposicion
                INTO v_costo_vidrio, v_es_templado, v_costo_flete_m2, v_moneda_vidrio
                FROM cat_productos_variantes WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN';
            END IF;

            IF v_costo_vidrio IS NOT NULL THEN
                IF v_moneda_vidrio = 'USD' THEN
                    v_costo_vidrio := v_costo_vidrio * v_tipo_cambio;
                    v_costo_flete_m2 := v_costo_flete_m2 * v_tipo_cambio; 
                END IF;

                -- Insertar Vidrio Principal (UNITARIO)
                INSERT INTO trx_desglose_materiales (
                    id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, sku_real, costo_total_item, precio_venta_item, medida_corte_mm
                ) VALUES (
                    p_id_linea_cot, 'Vidrio', COALESCE(v_linea.tipo_vidrio, 'Vidrio'), v_area_total, v_linea.tipo_vidrio, v_area_total * COALESCE(v_costo_vidrio, 0), v_area_total * COALESCE(v_costo_vidrio, 0), v_area_total 
                );
            END IF;
        END IF;

        -- FLETE CON FACTOR
        IF COALESCE(v_factor_flete, 0) > 0 THEN
                DECLARE
                    v_precio_unit_flete NUMERIC := 0.60;
                    v_cantidad_flete NUMERIC;
                    v_costo_flete NUMERIC;
                    v_sku_flete TEXT := 'GEN-E+F-GEN-GEN';
                BEGIN
                    SELECT costo_mercado_unit INTO v_precio_unit_flete FROM cat_productos_variantes WHERE id_sku = v_sku_flete;
                    IF v_precio_unit_flete IS NULL THEN v_precio_unit_flete := 0.60; END IF;
                    v_cantidad_flete := v_area_total * v_factor_flete;    v_costo_flete := v_cantidad_flete * v_precio_unit_flete;
                    INSERT INTO trx_desglose_materiales (
                        id_linea_cot, tipo_componente, nombre_componente, sku_real, cantidad_calculada, costo_total_item, precio_venta_item
                    ) VALUES (
                        p_id_linea_cot, 'Servicio', CASE WHEN v_es_templado THEN 'Costo Adicional: Embalaje y Flete del cristal' ELSE 'Costo Adicional: Embalaje y Flete' END, v_sku_flete, v_cantidad_flete, v_costo_flete, v_costo_flete
                    );
                END;
        END IF;

    END IF; -- Fin Legacy

    -- UPDATE FINAL
    SELECT COALESCE(SUM(costo_total_item), 0) INTO v_costo_total_item_bruto 
    FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    UPDATE trx_cotizaciones_detalle 
    SET 
        costo_base_ref = v_costo_total_item_bruto,
        subtotal_linea = (v_costo_total_item_bruto * (1 + COALESCE(v_cotizacion.markup_aplicado, 0.35))) * v_linea.cantidad
    WHERE id_linea_cot = p_id_linea_cot;

END;
$function$;
