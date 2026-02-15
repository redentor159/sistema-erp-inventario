-- FIX: SOPORTE DE FORMULAS DINAMICAS EN DESPIECE
-- Autor: Antigravity
-- Fecha: 2026-02-13
-- Descripcion: Habilita el calculo de cantidades y medidas usando formulas string (ej: "(ancho/2)-4")
-- almacenadas en mst_recetas_ingenieria, en lugar de solo factores fijos.

-- 1. FUNCION DE EVALUACION SEGURA DE FORMULAS MATEMATICAS
CREATE OR REPLACE FUNCTION fn_evaluar_formula_simple(
    p_expression TEXT,
    p_ancho NUMERIC,
    p_alto NUMERIC,
    p_cant_hojas NUMERIC DEFAULT 1
) RETURNS NUMERIC AS $$
DECLARE
    v_sql TEXT;
    v_result NUMERIC;
    v_safe_expr TEXT;
BEGIN
    -- 0. Si es nulo o vacio, retornar 0
    IF p_expression IS NULL OR TRIM(p_expression) = '' THEN
        RETURN 0;
    END IF;

    -- 1. Reemplazo de Variables (Case Insensitive logic handled by Replace)
    -- Reemplazamos las variables conocidas por sus valores
    v_safe_expr := REPLACE(LOWER(p_expression), 'ancho', COALESCE(p_ancho, 0)::text);
    v_safe_expr := REPLACE(v_safe_expr, 'alto', COALESCE(p_alto, 0)::text);
    v_safe_expr := REPLACE(v_safe_expr, 'hojas', COALESCE(p_cant_hojas, 1)::text);

    -- 2. Sanitizacion (Seguridad Anti-Injection muy basica pero efectiva para math)
    -- Solo permitimos digitos, puntos, parentesis y operadores basicos (+-*/)
    -- Si hay algo mas, retornamos 0 o error.
    IF v_safe_expr !~ '^[0-9\.\+\-\*\/\(\)\s]+$' THEN
        RAISE NOTICE 'Formula invalida o caracteres no permitidos: %', p_expression;
        RETURN 0;
    END IF;

    -- 3. Ejecucion Dinamica
    v_sql := 'SELECT (' || v_safe_expr || ')::numeric';
    
    BEGIN
        EXECUTE v_sql INTO v_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error evaluando formula: % -> %', p_expression, v_safe_expr;
        RETURN 0;
    END;

    RETURN COALESCE(v_result, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 2. ACTUALIZAR GENERACION DE DESPIECE PARA USAR FORMULAS PREFERENTEMENTE
CREATE OR REPLACE FUNCTION fn_generar_despiece_ingenieria(p_id_linea_cot UUID)
RETURNS VOID AS $$
DECLARE
    v_linea RECORD;
    v_cotizacion RECORD;
    v_costo_vidrio NUMERIC := 0;
    v_es_templado BOOLEAN := FALSE;
    v_costo_flete_m2 NUMERIC := 0;
    v_receta RECORD;
    v_sku_calculado TEXT;
    v_costo_unit_sku NUMERIC;
    
    -- Variables para calculos
    v_medida_corte NUMERIC;
    v_cantidad_item NUMERIC;
    v_num_hojas_modelo NUMERIC := 1; -- Default 1 si no encuentra modelo
BEGIN
    -- 1. Obtener Datos de la Línea de Cotización
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Línea de cotización % no encontrada', p_id_linea_cot;
    END IF;

    -- 2. Obtener Datos de la Cabecera (para Marca, Markup, etc)
    SELECT * INTO v_cotizacion FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_linea.id_cotizacion;

    -- 2.1 Obtener Info del Modelo (para saber # hojas si aplica, util para formulas)
    SELECT COALESCE(num_hojas, 1) INTO v_num_hojas_modelo 
    FROM mst_recetas_modelos 
    WHERE id_modelo = v_linea.id_modelo;

    -- 3. Limpiar Despiece Anterior (Idempotencia)
    DELETE FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    -- 4. LOGICA GENERACION
    -- Cambios clave:
    --   a. Condicion NULL se trata como 'BASE'
    --   b. Prioridad Formulas > Factores
    
    FOR v_receta IN 
        SELECT * FROM mst_recetas_ingenieria 
        WHERE id_modelo = v_linea.id_modelo 
        -- Condicion: Si es NULL o 'BASE' siempre entra. Si es Opcional, debe coincidir con seleccion usuario.
        AND (
            COALESCE(condicion, 'BASE') = 'BASE' 
            OR condicion = v_linea.tipo_cierre
            -- TODO: Agregar soporte para 'condicion' basada en opciones_seleccionadas JSONB
        )
        AND nombre_componente NOT ILIKE '%Flete%' 
        AND nombre_componente NOT ILIKE '%Emb%'
    LOOP
        -- A. Calcular Cantidad
        IF v_receta.formula_cantidad IS NOT NULL AND TRIM(v_receta.formula_cantidad) <> '' THEN
            -- Evaluar Formula Cantidad
            v_cantidad_item := fn_evaluar_formula_simple(
                v_receta.formula_cantidad,
                v_linea.ancho_mm,
                v_linea.alto_mm,
                v_num_hojas_modelo -- Pasamos # hojas del modelo como variable 'hojas'
            );
        ELSE
            -- Logica Legacy (Factores de Cantidad)
             -- Cantidad: Base * Cantidad Linea (la cantidad de ventanas se multiplica al final en el insert o aqui?)
             -- OJO: La cantidad calculada es POR UNIDAD DE VENTANA. Luego en el INSERT multiplicamos por v_linea.cantidad
            v_cantidad_item := COALESCE(v_receta.cantidad_base, 0);
            
            -- Si es por m2 o lineal (factores)
            IF COALESCE(v_receta.factor_cantidad_ancho, 0) > 0 OR COALESCE(v_receta.factor_cantidad_alto, 0) > 0 OR COALESCE(v_receta.factor_cantidad_area, 0) > 0 THEN
                 v_cantidad_item := (COALESCE(v_receta.factor_cantidad_ancho, 0) * v_linea.ancho_mm) + 
                                    (COALESCE(v_receta.factor_cantidad_alto, 0) * v_linea.alto_mm) + 
                                    (COALESCE(v_receta.factor_cantidad_area, 0) * (v_linea.ancho_mm * v_linea.alto_mm / 1000000.0));
            END IF;
        END IF;

        -- B. Calcular Medida Corte (Solo Perfiles)
        IF v_receta.tipo = 'Perfil' THEN
            IF v_receta.formula_perfil IS NOT NULL AND TRIM(v_receta.formula_perfil) <> '' THEN
                -- Evaluar Formula Perfil
                v_medida_corte := fn_evaluar_formula_simple(
                    v_receta.formula_perfil,
                    v_linea.ancho_mm,
                    v_linea.alto_mm,
                    v_num_hojas_modelo
                );
            ELSE
                 -- Logica Legacy
                 v_medida_corte := (COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
                                   (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
                                   COALESCE(v_receta.constante_corte_mm, 0);
            END IF;
        ELSE
            v_medida_corte := NULL;
        END IF;


        -- C. Calcular SKU Real
        v_sku_calculado := fn_calcular_sku_real(
            v_receta.tipo,
            v_receta.id_plantilla,
            v_linea.color_perfiles,
            v_cotizacion.id_marca,
            v_receta.id_material_receta,
            v_receta.id_acabado_receta,
            v_receta.id_marca_receta
        );
        
        -- Override SKU si viene fijo en catalogo (recetas v2)
        IF v_receta.id_sku_catalogo IS NOT NULL AND v_receta.id_sku_catalogo <> '' THEN
            v_sku_calculado := v_receta.id_sku_catalogo;
        END IF;


        -- D. Buscar Costo del SKU
        SELECT costo_mercado_unit INTO v_costo_unit_sku 
        FROM cat_productos_variantes 
        WHERE id_sku = v_sku_calculado;

        -- Fallback: Si no encuentra costo, usar 0
        IF v_costo_unit_sku IS NULL THEN v_costo_unit_sku := 0; END IF;

        -- E. Insertar
        INSERT INTO trx_desglose_materiales (
            id_linea_cot,
            tipo_componente,
            codigo_base,
            nombre_componente,
            detalle_acabado,
            angulo_corte,
            sku_real,
            medida_corte_mm,
            cantidad_calculada,
            costo_total_item
        ) VALUES (
            p_id_linea_cot,
            v_receta.tipo,
            v_receta.id_plantilla,
            v_receta.nombre_componente,
            v_linea.color_perfiles,
            v_receta.angulo,
            v_sku_calculado,
            v_medida_corte,
            -- Cantidad Total = Cantidad Unitaria * Cantidad de Ventanas
            v_cantidad_item * v_linea.cantidad,
            -- Costo Total
            (v_cantidad_item * v_linea.cantidad) * v_costo_unit_sku
        );
    END LOOP;

    -- 5. LOGICA ACCION C: AGREGAR VIDRIO (Sin cambios mayores, solo asegurar inputs)
    IF v_linea.tipo_vidrio IS NOT NULL THEN
        -- Obtener datos del vidrio
        SELECT costo_mercado_unit, es_templado, costo_flete_m2 
        INTO v_costo_vidrio, v_es_templado, v_costo_flete_m2
        FROM cat_productos_variantes
        WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN'; 

        IF v_costo_vidrio IS NULL THEN
             SELECT costo_mercado_unit, es_templado, costo_flete_m2 
             INTO v_costo_vidrio, v_es_templado, v_costo_flete_m2
             FROM cat_productos_variantes WHERE id_sku = v_linea.tipo_vidrio;
        END IF;

        INSERT INTO trx_desglose_materiales (
            id_linea_cot,
            tipo_componente,
            nombre_componente,
            cantidad_calculada,
            sku_real,
            costo_total_item
        ) VALUES (
            p_id_linea_cot,
            'Vidrio',
            'Vidrio Panel',
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0 * v_linea.cantidad, -- M2 Total
            'VID-' || v_linea.tipo_vidrio || '-GEN',
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0 * v_linea.cantidad) * COALESCE(v_costo_vidrio, 0)
        );

        -- Flete Templado
        IF v_es_templado THEN
             DECLARE
                v_flete_sku TEXT;
                v_costo_flete_unit NUMERIC;
                v_espesor_vidrio NUMERIC := 0;
             BEGIN
                SELECT espesor_mm INTO v_espesor_vidrio FROM cat_productos_variantes WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN';
                IF v_espesor_vidrio IS NULL THEN
                    SELECT espesor_mm INTO v_espesor_vidrio FROM cat_productos_variantes WHERE id_sku = v_linea.tipo_vidrio;
                END IF;

                IF v_espesor_vidrio <= 6 THEN v_flete_sku := 'SER-FLETE-06MM';
                ELSIF v_espesor_vidrio <= 8 THEN v_flete_sku := 'SER-FLETE-08MM';
                ELSE v_flete_sku := 'SER-FLETE-10MM';
                END IF;

                SELECT costo_mercado_unit INTO v_costo_flete_unit FROM cat_productos_variantes WHERE id_sku = v_flete_sku;

                INSERT INTO trx_desglose_materiales (
                    id_linea_cot,
                    tipo_componente,
                    nombre_componente,
                    sku_real,
                    cantidad_calculada,
                    costo_total_item
                ) VALUES (
                    p_id_linea_cot,
                    'Servicio',
                    'Embalaje + Flete Templado',
                    v_flete_sku,
                    (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0 * v_linea.cantidad,
                    ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0 * v_linea.cantidad) * COALESCE(v_costo_flete_unit, 0)
                );
             END;
        END IF;
    END IF;

    -- 6. LOGICA ACCION E: MANO DE OBRA
    IF v_cotizacion.costo_mano_obra_m2 > 0 THEN
        INSERT INTO trx_desglose_materiales (
            id_linea_cot,
            tipo_componente,
            nombre_componente,
            cantidad_calculada,
            costo_total_item
        ) VALUES (
            p_id_linea_cot,
            'Servicio',
            'Mano de Obra (m2)',
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0 * v_linea.cantidad,
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0 * v_linea.cantidad) * v_cotizacion.costo_mano_obra_m2
        );
    END IF;

END;
$$ LANGUAGE plpgsql;
