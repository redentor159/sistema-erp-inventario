-- FIX: LOGICA DE PRECIOS Y VIDRIOS (014)
-- Autor: Antigravity
-- Fecha: 2026-02-15
-- Updated: Added specific naming "Servicio Flete Vidrio Templado"

CREATE OR REPLACE FUNCTION fn_generar_despiece_ingenieria(p_id_linea_cot uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $$
DECLARE
    v_linea RECORD;
    v_cotizacion RECORD;
    v_receta RECORD;
    v_config RECORD;
    
    -- Variables calculadas
    v_sku_calculado VARCHAR;
    v_cantidad_calculada NUMERIC;
    v_medida_corte NUMERIC;
    v_costo_unit_sku NUMERIC;
    v_costo_total_item NUMERIC;
    v_moneda_sku VARCHAR;
    v_tipo_cambio NUMERIC;
    
    v_ancho NUMERIC;
    v_alto NUMERIC;
    v_hojas_modelo NUMERIC := 1;
    v_nombre_final VARCHAR;
    v_nombre_real VARCHAR;
    v_json_val TEXT;

    -- Variables Vidrio
    v_costo_vidrio NUMERIC := 0;
    v_es_templado BOOLEAN := FALSE;
    v_costo_flete_m2 NUMERIC := 0;
    v_moneda_vidrio VARCHAR;
    v_area_total NUMERIC;
BEGIN
    -- A. Obtener datos de la linea
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    IF NOT FOUND THEN RETURN; END IF;

    -- Datos cabecera
    SELECT * INTO v_cotizacion FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_linea.id_cotizacion;

    -- Datos Config (Tipo Cambio)
    SELECT * INTO v_config FROM mst_config_general LIMIT 1;
    v_tipo_cambio := COALESCE(v_config.tipo_cambio_referencial, 3.75);

    -- Obtener numero de hojas del modelo (para formula 'hojas')
    SELECT COALESCE(num_hojas, 1) INTO v_hojas_modelo FROM mst_recetas_modelos WHERE id_modelo = v_linea.id_modelo;

    -- Limpiar despiece anterior
    DELETE FROM trx_desglose_materiales 
    WHERE id_linea_cot = p_id_linea_cot;

    -- (Recalculate Area Unitary)
    v_ancho := COALESCE(v_linea.ancho_mm, 0);
    v_alto := COALESCE(v_linea.alto_mm, 0);
    v_area_total := (v_ancho * v_alto / 1000000.0); -- Area UNITARIA (M2)

    -- B. Iterar Recetas
    FOR v_receta IN 
        SELECT * FROM mst_recetas_ingenieria 
        WHERE id_modelo = v_linea.id_modelo 
        -- Condicion: BASE o coincidencia con tipo_cierre
        AND (condicion IS NULL OR condicion = 'BASE' OR condicion = '' OR condicion = v_linea.tipo_cierre)
        ORDER BY orden_visual
    LOOP
        v_sku_calculado := NULL;
        v_nombre_final := v_receta.nombre_componente;
        v_cantidad_calculada := 0;
        v_medida_corte := 0;

        -- 1. CALCULO DE CANTIDAD (Prioridad Formula > Factor > Base)
        IF v_receta.formula_cantidad IS NOT NULL AND TRIM(v_receta.formula_cantidad) <> '' THEN
            v_cantidad_calculada := fn_evaluar_formula(v_receta.formula_cantidad, v_ancho, v_alto, v_hojas_modelo);
        ELSE
            -- Legacy factors
            v_cantidad_calculada := COALESCE(v_receta.cantidad_base, 0);
            IF COALESCE(v_receta.factor_cantidad_ancho, 0) > 0 OR COALESCE(v_receta.factor_cantidad_alto, 0) > 0 THEN
                 v_cantidad_calculada := (COALESCE(v_receta.factor_cantidad_ancho, 0) * v_ancho) + 
                                         (COALESCE(v_receta.factor_cantidad_alto, 0) * v_alto);
            END IF;
        END IF;

        -- 2. CALCULO DE MEDIDA CORTE (Solo Perfiles)
        IF v_receta.tipo = 'Perfil' THEN
            IF v_receta.formula_perfil IS NOT NULL AND TRIM(v_receta.formula_perfil) <> '' THEN
                v_medida_corte := fn_evaluar_formula(v_receta.formula_perfil, v_ancho, v_alto, v_hojas_modelo);
            ELSE
                -- Legacy factors
                v_medida_corte := (COALESCE(v_receta.factor_corte_ancho, 0) * v_ancho) + 
                                  (COALESCE(v_receta.factor_corte_alto, 0) * v_alto) + 
                                  COALESCE(v_receta.constante_corte_mm, 0);
            END IF;
        END IF;

        -- 3. CALCULO DE SKU
        -- 3a. Opciones variables (User Selection)
        IF v_receta.grupo_opcion IS NOT NULL AND v_linea.opciones_seleccionadas IS NOT NULL THEN
             v_json_val := v_linea.opciones_seleccionadas ->> v_receta.grupo_opcion;
             IF v_json_val IS NOT NULL AND v_json_val != '' THEN
                 v_sku_calculado := v_json_val;
             END IF;
        END IF;

        -- 3b. Calculo estandar
        IF v_sku_calculado IS NULL THEN
             -- Override catalogo directo
             IF v_receta.id_sku_catalogo IS NOT NULL AND v_receta.id_sku_catalogo <> '' THEN
                 v_sku_calculado := v_receta.id_sku_catalogo;
             ELSE
                 -- Generar dinamico
                 BEGIN
                    v_sku_calculado := fn_calcular_sku_real(
                        v_receta.tipo,
                        v_receta.id_plantilla,
                        v_linea.color_perfiles,
                        v_cotizacion.id_marca,
                        v_receta.id_material_receta,
                        v_receta.id_acabado_receta,
                        v_receta.id_marca_receta
                    );
                 EXCEPTION WHEN OTHERS THEN
                    v_sku_calculado := NULL;
                 END;
             END IF;
        END IF;

        -- 4. COSTO
        v_costo_unit_sku := 0;
        v_moneda_sku := 'PEN';

        IF v_sku_calculado IS NOT NULL THEN
            SELECT costo_mercado_unit, nombre_completo, moneda_reposicion 
            INTO v_costo_unit_sku, v_nombre_real, v_moneda_sku
            FROM cat_productos_variantes WHERE id_sku = v_sku_calculado;
            
            IF v_nombre_real IS NOT NULL THEN v_nombre_final := v_nombre_real; END IF;
        END IF;

        -- 5. INSERTAR (Solo si cantidad > 0)
        IF v_cantidad_calculada > 0 THEN
            
            -- FIX LOGICA PRECIOS (UNITARIOS):
            -- 1. Convertir moneda si es USD -> PEN
            IF v_moneda_sku = 'USD' THEN
                v_costo_unit_sku := v_costo_unit_sku * v_tipo_cambio;
            END IF;

            -- 2. Si es Perfil, dividir entre 6 (Barra 6m)
            IF v_receta.tipo = 'Perfil' THEN
                 v_costo_unit_sku := v_costo_unit_sku / 6.0;
                 -- Costo Item Unitario = (Cant_Calc * 1) * (Medida / 1000) * Costo_Metro
                 v_costo_total_item := (v_cantidad_calculada) * (v_medida_corte / 1000.0) * COALESCE(v_costo_unit_sku, 0);
            ELSE
                 -- Accesorios: Costo = Cantidad_Calc * Costo_Unit
                 v_costo_total_item := (v_cantidad_calculada) * COALESCE(v_costo_unit_sku, 0);
            END IF;

            INSERT INTO trx_desglose_materiales (
                id_linea_cot,
                tipo_componente,
                nombre_componente,
                cantidad_calculada,     -- Cantidad UNITARIA (por item)
                sku_real,
                costo_total_item,       -- Costo UNITARIO (por item)
                medida_corte_mm,
                codigo_base,
                angulo_corte,
                detalle_acabado
            ) VALUES (
                p_id_linea_cot,
                v_receta.tipo,
                v_nombre_final, 
                v_cantidad_calculada,   -- Sin multiplicar por v_linea.cantidad
                COALESCE(v_sku_calculado, 'PENDIENTE'),
                COALESCE(v_costo_total_item, 0),
                v_medida_corte,
                v_receta.id_plantilla,
                v_receta.angulo,
                v_linea.color_perfiles
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
                id_linea_cot,
                tipo_componente,
                nombre_componente,
                cantidad_calculada,
                sku_real,
                costo_total_item,
                medida_corte_mm
            ) VALUES (
                p_id_linea_cot,
                'Vidrio',
                COALESCE(v_linea.tipo_vidrio, 'Vidrio'),
                v_area_total, -- Area Unitaria
                v_linea.tipo_vidrio,
                v_area_total * COALESCE(v_costo_vidrio, 0), -- Costo Unitario
                v_area_total -- Guardamos M2 unitario aqui
            );

            -- Insertar Flete Templado (UNITARIO)
            IF v_es_templado AND v_costo_flete_m2 > 0 THEN
                INSERT INTO trx_desglose_materiales (
                    id_linea_cot, 
                    tipo_componente, 
                    nombre_componente, 
                    cantidad_calculada, 
                    costo_total_item
                ) VALUES (
                    p_id_linea_cot, 
                    'Accesorio',
                    'Servicio Flete Vidrio Templado', 
                    v_area_total,
                    v_area_total * v_costo_flete_m2
                );
            END IF;
        END IF;
    END IF;

    -- D. INSERTAR MANO DE OBRA (UNITARIO)
    IF v_cotizacion.costo_mano_obra_m2 > 0 THEN
        INSERT INTO trx_desglose_materiales (
            id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, costo_total_item
        ) VALUES (
            p_id_linea_cot, 'Servicio', 'Mano de Obra', 
            v_area_total,
            v_area_total * v_cotizacion.costo_mano_obra_m2
        );
    END IF;

    -- E. ACTUALIZAR COSTO Y PRECIO EN LINEA DE COTIZACION
    -- Suma de Costos UNITARIOS de materiales
    SELECT COALESCE(SUM(costo_total_item), 0) INTO v_costo_total_item 
    FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    UPDATE trx_cotizaciones_detalle 
    SET 
        -- Costo Unitario = Suma de costos de materiales del item
        costo_base_ref = v_costo_total_item,
        
        -- Subtotal Linea = (Costo Unitario * Markup) * Cantidad
        subtotal_linea = (v_costo_total_item * COALESCE(v_cotizacion.markup_aplicado, 1.35)) * v_linea.cantidad
    WHERE id_linea_cot = p_id_linea_cot;

END;
$$;
