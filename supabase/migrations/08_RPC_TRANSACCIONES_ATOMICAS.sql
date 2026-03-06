-- Migración: 08_RPC_TRANSACCIONES_ATOMICAS
-- Fecha: 2026-03-05
-- Descripción: Corrección de deuda técnica CRIT-02 y ALTO-03.
-- Asegura que transacciones complejas no dejen datos huérfanos usando RPCs atómicas.

----------------------------------------------------------------------------------
-- 1. fn_crear_cotizacion_mto (Atómica: Cabecera + Detalles + Despiece)
----------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_crear_cotizacion_mto(
    p_id_cliente text,
    p_nombre_proyecto text,
    p_id_marca text,
    p_fecha_emision timestamp,
    p_moneda text,
    p_validez_dias int,
    p_plazo_entrega text,
    p_condicion_pago text,
    p_incluye_igv boolean,
    p_observaciones text,
    p_costo_mano_obra_m2 numeric,
    p_costo_global_instalacion numeric,
    p_markup_aplicado numeric,
    p_detalles jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_id_cotizacion uuid;
    v_item jsonb;
    v_id_linea uuid;
BEGIN
    -- 1. Insertar Cabecera
    INSERT INTO trx_cotizaciones_cabecera (
        id_cliente,
        nombre_proyecto,
        id_marca,
        fecha_emision,
        moneda,
        validez_dias,
        plazo_entrega,
        condicion_pago,
        incluye_igv,
        observaciones,
        costo_mano_obra_m2,
        costo_global_instalacion,
        markup_aplicado,
        estado
    ) VALUES (
        p_id_cliente,
        p_nombre_proyecto,
        p_id_marca,
        COALESCE(p_fecha_emision, now()),
        p_moneda,
        p_validez_dias,
        p_plazo_entrega,
        p_condicion_pago,
        p_incluye_igv,
        p_observaciones,
        p_costo_mano_obra_m2,
        p_costo_global_instalacion,
        p_markup_aplicado,
        'Borrador'
    ) RETURNING id_cotizacion INTO v_id_cotizacion;

    -- 2. Insertar Detalles e Invocar Generación de Despiece
    IF p_detalles IS NOT NULL AND jsonb_array_length(p_detalles) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_detalles)
        LOOP
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
                subtotal_linea,
                opciones_seleccionadas
            ) VALUES (
                v_id_cotizacion,
                v_item->>'id_modelo',
                v_item->>'color_perfiles',
                (v_item->>'cantidad')::numeric,
                (v_item->>'ancho_mm')::numeric,
                (v_item->>'alto_mm')::numeric,
                v_item->>'etiqueta_item',
                v_item->>'ubicacion',
                v_item->>'tipo_cierre',
                v_item->>'tipo_vidrio',
                (v_item->>'subtotal_linea')::numeric,
                COALESCE(v_item->'opciones_seleccionadas', '{}'::jsonb)
            ) RETURNING id_linea_cot INTO v_id_linea;

            -- Generar el despiece para esta línea. Si esto falla, TODA la transacción hace rollback.
            PERFORM fn_generar_despiece_ingenieria(v_id_linea);
        END LOOP;
    END IF;

    RETURN v_id_cotizacion;
END;
$$;

----------------------------------------------------------------------------------
-- 2. fn_agregar_linea_cotizacion (Atómica: Detalle + Despiece)
----------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_agregar_linea_cotizacion(
    p_id_cotizacion uuid,
    p_id_modelo text,
    p_color_perfiles text,
    p_cantidad numeric,
    p_ancho_mm numeric,
    p_alto_mm numeric,
    p_tipo_vidrio text,
    p_tipo_cierre text,
    p_etiqueta_item text,
    p_ubicacion text,
    p_opciones_seleccionadas jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_id_linea uuid;
BEGIN
    INSERT INTO trx_cotizaciones_detalle (
        id_cotizacion,
        id_modelo,
        color_perfiles,
        cantidad,
        ancho_mm,
        alto_mm,
        tipo_vidrio,
        tipo_cierre,
        etiqueta_item,
        ubicacion,
        opciones_seleccionadas
    ) VALUES (
        p_id_cotizacion,
        p_id_modelo,
        p_color_perfiles,
        p_cantidad,
        p_ancho_mm,
        p_alto_mm,
        p_tipo_vidrio,
        p_tipo_cierre,
        p_etiqueta_item,
        p_ubicacion,
        COALESCE(p_opciones_seleccionadas, '{}'::jsonb)
    ) RETURNING id_linea_cot INTO v_id_linea;

    -- Generar el despiece. Falla = línea no se añade.
    PERFORM fn_generar_despiece_ingenieria(v_id_linea);

    RETURN v_id_linea;
END;
$$;

----------------------------------------------------------------------------------
-- 3. fn_archive_kanban_batch (Atómica: Multiples archivos)
----------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_archive_kanban_batch()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_order record;
    v_count int := 0;
BEGIN
    FOR v_order IN 
        SELECT id FROM trx_kanban_orders WHERE column_id = 'column-finalizado'
    LOOP
        -- Reutiliza la función existente fn_archive_kanban_order
        PERFORM fn_archive_kanban_order(
            v_order.id, 
            'Archivado', 
            'column-finalizado', 
            '[]'::jsonb, 
            '[]'::jsonb
        );
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$;
