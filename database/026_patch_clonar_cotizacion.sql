-- =================================================================================================
-- MIGRATION 026: Parche de Lógica de Clonación (Ajustado al DDL Actual)
-- Fecha: 2026-02-23
-- Descripción: Actualiza las funciones fn_clonar_cotizacion y fn_clonar_item_cotizacion 
-- para incluir de forma estricta las columnas presentes en el DDL más reciente, como
-- opciones_seleccionadas, costo_fijo_instalacion, es_despiece_manual, terminos_personalizados, etc.
-- =================================================================================================

-- DROP FUNCTION IF EXISTS public.fn_clonar_cotizacion(uuid);

CREATE OR REPLACE FUNCTION public.fn_clonar_cotizacion(p_id_cotizacion uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_new_id UUID;
    v_old_detalle RECORD;
    v_new_linea_id UUID;
BEGIN
    -- 1. Clonar Cabecera (Se mapean todos los campos según el DDL actualizado)
    INSERT INTO trx_cotizaciones_cabecera (
        fecha_emision,
        estado,
        id_cliente,
        id_marca,
        nombre_proyecto,
        moneda,
        validez_dias,
        plazo_entrega,
        condicion_pago,
        markup_aplicado,
        incluye_igv,
        aplica_detraccion,
        costo_mano_obra_m2,
        costo_global_instalacion,
        observaciones,
        link_pdf,
        costo_fijo_instalacion,
        terminos_personalizados,
        titulo_documento
        -- No copiamos total_costo_directo, total_precio_venta, fechas de entrega/aprobacion
    )
    SELECT
        NOW(), -- Fecha actual
        'Borrador', -- Estado inicial
        id_cliente,
        id_marca,
        nombre_proyecto || ' (Copia)', -- Sufijo para identificar
        moneda,
        validez_dias,
        plazo_entrega,
        condicion_pago,
        markup_aplicado,
        incluye_igv,
        aplica_detraccion,
        costo_mano_obra_m2,
        costo_global_instalacion,
        observaciones,
        NULL, -- Nuevo PDF
        costo_fijo_instalacion,
        terminos_personalizados,
        titulo_documento
    FROM trx_cotizaciones_cabecera
    WHERE id_cotizacion = p_id_cotizacion
    RETURNING id_cotizacion INTO v_new_id;

    -- 2. Clonar Detalles e Ingeniería
    FOR v_old_detalle IN 
        SELECT * FROM trx_cotizaciones_detalle WHERE id_cotizacion = p_id_cotizacion
    LOOP
        -- Insertar nueva línea respetando JSONB y Flags de Ingeniería
        INSERT INTO trx_cotizaciones_detalle (
            id_cotizacion,
            id_modelo,
            color_perfiles,
            cantidad,
            ancho_mm,
            alto_mm,
            etiqueta_item,
            ubicacion,
            tipo_cierre,
            tipo_vidrio,
            grupo_opcion,
            costo_base_ref,
            subtotal_linea,
            opciones_seleccionadas,
            es_despiece_manual
        )
        VALUES (
            v_new_id,
            v_old_detalle.id_modelo,
            v_old_detalle.color_perfiles,
            v_old_detalle.cantidad,
            v_old_detalle.ancho_mm,
            v_old_detalle.alto_mm,
            v_old_detalle.etiqueta_item,
            v_old_detalle.ubicacion,
            v_old_detalle.tipo_cierre,
            v_old_detalle.tipo_vidrio,
            v_old_detalle.grupo_opcion,
            v_old_detalle.costo_base_ref, 
            v_old_detalle.subtotal_linea,
            v_old_detalle.opciones_seleccionadas,
            v_old_detalle.es_despiece_manual
        )
        RETURNING id_linea_cot INTO v_new_linea_id;

        -- Generar Despiece (Recalcular conservando factor de fletes en opciones_seleccionadas)
        PERFORM fn_generar_despiece_ingenieria(v_new_linea_id);
    END LOOP;

    RETURN v_new_id;
END;
$function$
;

-- DROP FUNCTION IF EXISTS public.fn_clonar_item_cotizacion(uuid);

CREATE OR REPLACE FUNCTION public.fn_clonar_item_cotizacion(p_id_linea_cot uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_new_linea_id UUID;
    v_old_detalle trx_cotizaciones_detalle%ROWTYPE;
BEGIN
    -- Obtener datos originales
    SELECT * INTO v_old_detalle FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item no encontrado';
    END IF;

    -- Insertar nueva copia preservando factores en el JSONB
    INSERT INTO trx_cotizaciones_detalle (
        id_cotizacion,
        id_modelo,
        color_perfiles,
        cantidad,
        ancho_mm,
        alto_mm,
        etiqueta_item,
        ubicacion,
        tipo_cierre,
        tipo_vidrio,
        grupo_opcion,
        costo_base_ref,
        subtotal_linea,
        opciones_seleccionadas,
        es_despiece_manual
    )
    VALUES (
        v_old_detalle.id_cotizacion,
        v_old_detalle.id_modelo,
        v_old_detalle.color_perfiles,
        v_old_detalle.cantidad,
        v_old_detalle.ancho_mm,
        v_old_detalle.alto_mm,
        v_old_detalle.etiqueta_item || ' (Copia)',
        v_old_detalle.ubicacion,
        v_old_detalle.tipo_cierre,
        v_old_detalle.tipo_vidrio,
        v_old_detalle.grupo_opcion,
        v_old_detalle.costo_base_ref,
        v_old_detalle.subtotal_linea,
        v_old_detalle.opciones_seleccionadas,
        v_old_detalle.es_despiece_manual
    )
    RETURNING id_linea_cot INTO v_new_linea_id;

    -- Generar Despiece
    PERFORM fn_generar_despiece_ingenieria(v_new_linea_id);

    RETURN v_new_linea_id;
END;
$function$
;
