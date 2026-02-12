-- =================================================================================================
-- SCRIPT DE CORRECCIÓN DE LÓGICA DE COTIZACIONES
-- Fecha: 2026-02-10
-- Descripción: Limpia código muerto de fn_generar_despiece_ingenieria y corrige referencias.
-- =================================================================================================

CREATE OR REPLACE FUNCTION public.fn_generar_despiece_ingenieria(p_id_linea_cot uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_linea RECORD;
    v_cotizacion RECORD;
    v_costo_vidrio NUMERIC := 0;
    v_es_templado BOOLEAN := FALSE;
    v_costo_flete_m2 NUMERIC := 0;
    v_receta RECORD;
    v_sku_calculado TEXT;
    v_costo_unit_sku NUMERIC;
BEGIN
    -- 1. Obtener Datos de la Línea de Cotización
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Línea de cotización % no encontrada', p_id_linea_cot;
    END IF;

    -- 2. Obtener Datos de la Cabecera (para Marca, Markup, etc)
    SELECT * INTO v_cotizacion FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_linea.id_cotizacion;

    -- 3. Limpiar Despiece Anterior (Idempotencia)
    DELETE FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    -- 4. LOGICA ACCION B (Loop sobre Recetas) y A (Generar Fila)
    FOR v_receta IN 
        SELECT * FROM mst_recetas_ingenieria 
        WHERE id_modelo = v_linea.id_modelo 
        AND (condicion = 'BASE' OR condicion = v_linea.tipo_cierre)
        AND nombre_componente NOT ILIKE '%Flete%' 
        AND nombre_componente NOT ILIKE '%Emb%'
    LOOP
        -- Calcular SKU Real
        v_sku_calculado := fn_calcular_sku_real(
            v_receta.tipo,
            v_receta.id_plantilla,
            v_linea.color_perfiles,
            v_cotizacion.id_marca,
            v_receta.id_material_receta,
            v_receta.id_acabado_receta,
            v_receta.id_marca_receta
        );

        -- Buscar Costo del SKU
        SELECT costo_mercado_unit INTO v_costo_unit_sku 
        FROM cat_productos_variantes 
        WHERE id_sku = v_sku_calculado;

        IF v_costo_unit_sku IS NULL THEN v_costo_unit_sku := 0; END IF;

        -- Insertar en TRX_DESGLOSE_MATERIALES
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
            costo_total_item,
            precio_venta_item
        ) VALUES (
            p_id_linea_cot,
            v_receta.tipo,
            v_receta.id_plantilla,
            v_receta.nombre_componente,
            v_linea.color_perfiles,
            v_receta.angulo,
            v_sku_calculado,
            (COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
            (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
            COALESCE(v_receta.constante_corte_mm, 0),
            COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad,
            (COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad) * v_costo_unit_sku * 1, 
            0
        );
    END LOOP;

    -- 5. LOGICA ACCION C: AGREGAR VIDRIO
    IF v_linea.tipo_vidrio IS NOT NULL THEN
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
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0,
            COALESCE(v_linea.tipo_vidrio, 'VID-GEN'),
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * COALESCE(v_costo_vidrio, 0)
        );

        -- 6. LOGICA ACCION D: EMBALAJE + FLETE
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
                    'Embalaje + Flete (' || COALESCE(v_espesor_vidrio, 0) || 'mm)',
                    v_flete_sku,
                    (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0,
                    ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * COALESCE(v_costo_flete_unit, 0)
                );
             END;
        END IF;
    END IF;

    -- 7. LOGICA ACCION E: MANO DE OBRA / COLOCACION
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
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0,
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * v_cotizacion.costo_mano_obra_m2
        );
    END IF;

    -- [REMOVIDO: Paso 8 - Lógica Costo Fijo incorrecta (referenciaba columna inexistente en detalle)]

END;
$function$
;
