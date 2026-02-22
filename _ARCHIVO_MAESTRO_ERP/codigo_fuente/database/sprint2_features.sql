-- =================================================================================================
-- SPRINT 2: Funcionalidades Avanzadas de Cotización y Configuración
-- =================================================================================================

-- 1. Expandir MST_CONFIG_GENERAL
-- Añadimos columnas para la identidad de la empresa
ALTER TABLE mst_config_general
ADD COLUMN IF NOT EXISTS nombre_empresa TEXT,
ADD COLUMN IF NOT EXISTS ruc TEXT,
ADD COLUMN IF NOT EXISTS direccion_fiscal TEXT,
ADD COLUMN IF NOT EXISTS telefono_contacto TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS firma_digital_url TEXT;

-- 2. Función para Clonar Cotización Completa
CREATE OR REPLACE FUNCTION fn_clonar_cotizacion(p_id_cotizacion UUID)
RETURNS UUID AS $$
DECLARE
    v_new_id UUID;
    v_old_detalle RECORD;
    v_new_linea_id UUID;
BEGIN
    -- 2.1 Clonar Cabecera
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
        link_pdf
        -- No copiamos total_costo_directo ni total_precio_venta, se recalcularán
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
        NULL -- Nuevo PDF
    FROM trx_cotizaciones_cabecera
    WHERE id_cotizacion = p_id_cotizacion
    RETURNING id_cotizacion INTO v_new_id;

    -- 2.2 Clonar Detalles e Ingeniería
    FOR v_old_detalle IN 
        SELECT * FROM trx_cotizaciones_detalle WHERE id_cotizacion = p_id_cotizacion
    LOOP
        -- Insertar nueva línea
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
            subtotal_linea
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
            v_old_detalle.costo_base_ref, -- Se recomienda recalcular, pero por ahora copiamos
            v_old_detalle.subtotal_linea
        )
        RETURNING id_linea_cot INTO v_new_linea_id;

        -- Generar Despiece (Recalcular con precios actuales)
        PERFORM fn_generar_despiece_ingenieria(v_new_linea_id);
    END LOOP;

    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Función para Clonar Ítem Individual
CREATE OR REPLACE FUNCTION fn_clonar_item_cotizacion(p_id_linea_cot UUID)
RETURNS UUID AS $$
DECLARE
    v_new_linea_id UUID;
    v_old_detalle trx_cotizaciones_detalle%ROWTYPE;
BEGIN
    -- Obtener datos originales
    SELECT * INTO v_old_detalle FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item no encontrado';
    END IF;

    -- Insertar nueva copia
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
        subtotal_linea
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
        v_old_detalle.subtotal_linea
    )
    RETURNING id_linea_cot INTO v_new_linea_id;

    -- Generar Despiece
    PERFORM fn_generar_despiece_ingenieria(v_new_linea_id);

    RETURN v_new_linea_id;
END;
$$ LANGUAGE plpgsql;
