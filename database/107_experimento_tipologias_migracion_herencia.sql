-- =================================================================================================
-- HITO 6: FASE 1 - HERENCIA DE MEDIDAS EXACTA Y MIGRACIÓN DE LEGACY DATA
-- =================================================================================================

-- 1. Script de Migración de Data Legacy (El Envelope Dummy 1x1)
-- Transformar todos los items sueltos de Cotización (1x1) en Tipologías maestras
-- que los envuelvan en un grid del 100% (Span 1x1) sin cruces.

DO $$
DECLARE
    v_linea RECORD;
    v_new_tipologia_id UUID;
BEGIN
    FOR v_linea IN 
        SELECT d.*, c.id_cliente 
        FROM public.trx_cotizaciones_detalle d
        JOIN public.trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion
        WHERE d.tipologia_id IS NULL AND d.id_modelo != 'SERVICIO' AND d.id_modelo != 'TIPOLOGIA'
    LOOP
        -- 1.1 Crear la Tipologia Envoltorio
        INSERT INTO public.tipologias (
            pedido_id, descripcion, ancho_total_mm, alto_total_mm, cantidad
        ) VALUES (
            v_linea.id_cotizacion, 
            'Migración Legacy: ' || COALESCE(v_linea.etiqueta_item, v_linea.id_modelo), 
            COALESCE(v_linea.ancho_mm, 1000), 
            COALESCE(v_linea.alto_mm, 1000), 
            COALESCE(v_linea.cantidad, 1)
        ) RETURNING id INTO v_new_tipologia_id;

        -- 1.2 Insertar el Item Original dentro de la Tipología (En la celda 1,1 abarcando todo)
        INSERT INTO public.tipologias_items (
            tipologia_id, producto_id, grid_col_start, grid_row_start, grid_col_span, grid_row_span,
            color_perfiles, tipo_vidrio, configuracion_hojas, tipo_apertura, opciones_seleccionadas
        ) VALUES (
            v_new_tipologia_id, 
            v_linea.id_modelo, 
            1, 1, 1, 1,
            v_linea.color_perfiles, 
            v_linea.tipo_vidrio, 
            NULL, -- Configuracion Hojas (Se inferiría de opciones, o nulo si no hay)
            NULL, -- Tipo apertura (Lo sacará dinámicamente el Front de la receta maestra)
            v_linea.opciones_seleccionadas
        );

        -- 1.3 Actualizar la línea de cotización vinculando el ID de tipología y seteando id_modelo a 'TIPOLOGIA'
        -- para que el motor entienda que es un contenedor.
        UPDATE public.trx_cotizaciones_detalle 
        SET 
            tipologia_id = v_new_tipologia_id,
            id_modelo = 'TIPOLOGIA',
            etiqueta_item = '(Tipología) ' || COALESCE(etiqueta_item, id_modelo)
        WHERE id_linea_cot = v_linea.id_linea_cot;

    END LOOP;
END $$;


-- 2. Reescribir el Motor de Despiece para soportar Herencia Matemática Exacta (Descuento de Transoms/Mullions)
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
    
    -- Variables para Tipologias
    v_tipologia RECORD;
    v_item RECORD;
    v_cruce RECORD;
    
    -- Acumuladores de Matemática Espacial
    v_ancho_neto NUMERIC;
    v_alto_neto NUMERIC;
    v_area_neta NUMERIC;
    v_hojas_modelo NUMERIC;
    
    -- Limites de la Celda (Bounding Box Virtual vs Físico)
    v_x_start NUMERIC;
    v_x_end NUMERIC;
    v_y_start NUMERIC;
    v_y_end NUMERIC;
    v_espesor_izq NUMERIC;
    v_espesor_der NUMERIC;
    v_espesor_sup NUMERIC;
    v_espesor_inf NUMERIC;
    
    v_cols_total INTEGER;
    v_rows_total INTEGER;

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

    -- Verificar si es Tipología (Con o sin modelo='TIPOLOGIA')
    IF v_linea.tipologia_id IS NOT NULL THEN
        SELECT * INTO v_tipologia FROM tipologias WHERE id = v_linea.tipologia_id;
        IF FOUND THEN
            v_es_modelo_tipologia := TRUE;
            -- Determinar las dimensiones lógicas de la cuadrícula
            -- Contando cruces X + 1 = total columnas, etc.
            SELECT COUNT(*) + 1 INTO v_cols_total FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id AND tipo_eje = 'X';
            SELECT COUNT(*) + 1 INTO v_rows_total FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id AND tipo_eje = 'Y';
        END IF;
    END IF;

    -- =========================================================================
    -- RAMA MODO TÍPOLOGÍAS Y MIGRADO (Todos los items ahora son Tipologias)
    -- =========================================================================
    IF v_es_modelo_tipologia THEN
        
        -- 1. Iterar todos los Ítems Hijos (Ventanas / Paños)
        FOR v_item IN SELECT * FROM tipologias_items WHERE tipologia_id = v_tipologia.id LOOP
            
            -- ===============================================================
            -- MOTOR DE HERENCIA DE MEDIDAS (Exact Math con Grosores)
            -- ===============================================================
            v_x_start := 0; v_x_end := v_tipologia.ancho_total_mm;
            v_y_start := 0; v_y_end := v_tipologia.alto_total_mm;
            v_espesor_izq := 0; v_espesor_der := 0;
            v_espesor_sup := 0; v_espesor_inf := 0;

            -- Limite Izquierdo (X_0)
            IF v_item.grid_col_start > 1 THEN
                SELECT distancia_desde_origen_mm, espesor_perfil_mm INTO v_x_start, v_espesor_izq
                FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id AND tipo_eje = 'X'
                ORDER BY distancia_desde_origen_mm ASC OFFSET (v_item.grid_col_start - 2) LIMIT 1;
            END IF;

            -- Limite Derecho (X_1)
            IF (v_item.grid_col_start + v_item.grid_col_span - 1) < v_cols_total THEN
                SELECT distancia_desde_origen_mm, espesor_perfil_mm INTO v_x_end, v_espesor_der
                FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id AND tipo_eje = 'X'
                ORDER BY distancia_desde_origen_mm ASC OFFSET (v_item.grid_col_start + v_item.grid_col_span - 2) LIMIT 1;
            END IF;

            -- Limite Superior (Y_0)
            IF v_item.grid_row_start > 1 THEN
                SELECT distancia_desde_origen_mm, espesor_perfil_mm INTO v_y_start, v_espesor_sup
                FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id AND tipo_eje = 'Y'
                ORDER BY distancia_desde_origen_mm ASC OFFSET (v_item.grid_row_start - 2) LIMIT 1;
            END IF;

            -- Limite Inferior (Y_1)
            IF (v_item.grid_row_start + v_item.grid_row_span - 1) < v_rows_total THEN
                SELECT distancia_desde_origen_mm, espesor_perfil_mm INTO v_y_end, v_espesor_inf
                FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id AND tipo_eje = 'Y'
                ORDER BY distancia_desde_origen_mm ASC OFFSET (v_item.grid_row_start + v_item.grid_row_span - 2) LIMIT 1;
            END IF;

            -- DIMENSIÓN NETAMENTE FÍSICA A FABRICAR:
            -- Descontamos el espesor de los cruces compartidos (mitad y mitad)
            v_ancho_neto := (v_x_end - v_x_start) - (v_espesor_izq / 2) - (v_espesor_der / 2);
            v_alto_neto := (v_y_end - v_y_start) - (v_espesor_sup / 2) - (v_espesor_inf / 2);
            v_area_neta := (v_ancho_neto * v_alto_neto) / 1000000.0;
            
            -- ===============================================================
            -- EXPLOSIÓN DE INGENIERÍA PARA EL HIJO
            -- ===============================================================
            SELECT COALESCE(num_hojas, 1) INTO v_hojas_modelo FROM mst_recetas_modelos WHERE id_modelo = v_item.producto_id;

            FOR v_receta IN 
                SELECT * FROM mst_recetas_ingenieria 
                WHERE id_modelo = v_item.producto_id 
                AND (condicion IS NULL OR condicion = 'BASE' OR condicion = '' OR condicion = v_linea.tipo_cierre)
                ORDER BY orden_visual
            LOOP
                v_sku_calculado := NULL;
                v_nombre_final := v_receta.nombre_componente || ' (Celda ' || v_item.grid_col_start || ',' || v_item.grid_row_start || ')';
                v_cantidad_calculada := 0; v_medida_corte := 0;
                
                -- Cantidad Matemática
                IF v_receta.formula_cantidad IS NOT NULL AND TRIM(v_receta.formula_cantidad) <> '' THEN
                    v_cantidad_calculada := fn_evaluar_formula(v_receta.formula_cantidad, v_ancho_neto, v_alto_neto, v_hojas_modelo);
                ELSE
                    v_cantidad_calculada := COALESCE(v_receta.cantidad_base, 0);
                    IF COALESCE(v_receta.factor_cantidad_ancho, 0) > 0 OR COALESCE(v_receta.factor_cantidad_alto, 0) > 0 THEN
                        v_cantidad_calculada := (COALESCE(v_receta.factor_cantidad_ancho, 0) * v_ancho_neto) + (COALESCE(v_receta.factor_cantidad_alto, 0) * v_alto_neto);
                    END IF;
                END IF;

                -- Perfilería Matemática
                IF v_receta.tipo = 'Perfil' THEN
                    IF v_receta.formula_perfil IS NOT NULL AND TRIM(v_receta.formula_perfil) <> '' THEN
                        v_medida_corte := fn_evaluar_formula(v_receta.formula_perfil, v_ancho_neto, v_alto_neto, v_hojas_modelo);
                    ELSE
                        v_medida_corte := (COALESCE(v_receta.factor_corte_ancho, 0) * v_ancho_neto) + (COALESCE(v_receta.factor_corte_alto, 0) * v_alto_neto) + COALESCE(v_receta.constante_corte_mm, 0);
                    END IF;
                END IF;

                -- Opción Seleccionada Dinámica
                IF v_receta.grupo_opcion IS NOT NULL AND v_item.opciones_seleccionadas IS NOT NULL THEN
                    v_json_val := v_item.opciones_seleccionadas ->> v_receta.grupo_opcion;
                    IF v_json_val IS NOT NULL AND v_json_val != '' THEN v_sku_calculado := v_json_val; END IF;
                END IF;

                -- SKU Fallback Engine
                IF v_sku_calculado IS NULL THEN
                    IF v_receta.id_sku_catalogo IS NOT NULL AND v_receta.id_sku_catalogo <> '' THEN
                        v_sku_calculado := v_receta.id_sku_catalogo;
                    ELSE
                        BEGIN v_sku_calculado := fn_calcular_sku_real(v_receta.tipo, v_receta.id_plantilla, COALESCE(v_item.color_perfiles, v_linea.color_perfiles), v_cotizacion.id_marca, v_receta.id_material_receta, v_receta.id_acabado_receta, v_receta.id_marca_receta); EXCEPTION WHEN OTHERS THEN v_sku_calculado := NULL; END;
                    END IF;
                END IF;

                v_costo_unit_sku := 0; v_moneda_sku := 'PEN';
                IF v_sku_calculado IS NOT NULL THEN
                    SELECT costo_mercado_unit, nombre_completo, moneda_reposicion INTO v_costo_unit_sku, v_nombre_real, v_moneda_sku FROM cat_productos_variantes WHERE id_sku = v_sku_calculado;
                    IF v_nombre_real IS NOT NULL THEN v_nombre_final := v_nombre_real || ' [Cell-' || v_item.grid_col_start || 'x' || v_item.grid_row_start || ']'; END IF;
                END IF;

                IF v_cantidad_calculada > 0 THEN
                    IF v_moneda_sku = 'USD' THEN v_costo_unit_sku := v_costo_unit_sku * v_tipo_cambio; END IF;

                    IF v_receta.tipo = 'Perfil' THEN
                        v_costo_unit_sku := v_costo_unit_sku / 6.0;
                        v_costo_total_material := (v_cantidad_calculada) * (v_medida_corte / 1000.0) * COALESCE(v_costo_unit_sku, 0);
                    ELSE
                        v_costo_total_material := (v_cantidad_calculada) * COALESCE(v_costo_unit_sku, 0);
                    END IF;

                    -- Insertar en Detalle de Ingenieria Global de la Linea
                    INSERT INTO trx_desglose_materiales (
                        id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, sku_real, costo_total_item, precio_venta_item, medida_corte_mm, codigo_base, angulo_corte, detalle_acabado
                    ) VALUES (
                        p_id_linea_cot, v_receta.tipo, v_nombre_final, v_cantidad_calculada, COALESCE(v_sku_calculado, 'PENDIENTE'), COALESCE(v_costo_total_material, 0), COALESCE(v_costo_total_material, 0), v_medida_corte, v_receta.id_plantilla, v_receta.angulo, COALESCE(v_item.color_perfiles, v_linea.color_perfiles)
                    );
                END IF;
            END LOOP; -- Fin Iteracion Receta Item
            
            -- ===============================================================
            -- VIDRIOS INTERNOS DEL HIJO
            -- ===============================================================
            IF v_item.tipo_vidrio IS NOT NULL AND v_item.tipo_vidrio <> '' THEN
                DECLARE
                    v_costo_vidrio NUMERIC := 0; v_moneda_vidrio VARCHAR;
                BEGIN
                    SELECT costo_mercado_unit, moneda_reposicion INTO v_costo_vidrio, v_moneda_vidrio
                    FROM cat_productos_variantes WHERE id_sku = v_item.tipo_vidrio OR id_sku = 'VID-' || v_item.tipo_vidrio || '-GEN' LIMIT 1;
                    
                    IF v_costo_vidrio IS NOT NULL THEN
                        IF v_moneda_vidrio = 'USD' THEN v_costo_vidrio := v_costo_vidrio * v_tipo_cambio; END IF;
                        INSERT INTO trx_desglose_materiales (
                            id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, sku_real, costo_total_item, precio_venta_item, medida_corte_mm
                        ) VALUES (
                            p_id_linea_cot, 'Vidrio', 'Cristal', v_area_neta, v_item.tipo_vidrio, (v_area_neta * v_costo_vidrio), (v_area_neta * v_costo_vidrio), v_area_neta
                        );
                    END IF;
                END;
            END IF;

        END LOOP; -- Fin Iteracion Tipologia Items

        -- ===============================================================
        -- MATERIALES DE LOS CRUCES FÍSICOS (Tubulares / Divisores Reales)
        -- ===============================================================
        FOR v_cruce IN SELECT * FROM tipologias_cruces WHERE tipologia_id = v_tipologia.id LOOP
            -- Futura implementación (Phase 2)
            -- Leer el "sku_perfil" que guardará tipologias_cruces y añadir su metro lineal al despiece real.
            NULL;
        END LOOP;
        
    END IF;

    -- UPDATE RECURSIVAMENTE LOS COSTOS A LA BASE ORIGINAL
    SELECT COALESCE(SUM(costo_total_item), 0) INTO v_costo_total_item_bruto 
    FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    UPDATE trx_cotizaciones_detalle 
    SET 
        costo_base_ref = v_costo_total_item_bruto,
        subtotal_linea = (v_costo_total_item_bruto * (1 + COALESCE(v_cotizacion.markup_aplicado, 0.35))) * v_linea.cantidad
    WHERE id_linea_cot = p_id_linea_cot;

END;
$function$;
