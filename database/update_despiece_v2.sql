-- MODIFICACION V2: ARREGJAR PRECIO VENTA ITEM = 0 Y LOGICA DESPIECE
-- Autor: Antigravity
-- Fecha: 2026-02-12

CREATE OR REPLACE FUNCTION public.fn_generar_despiece_ingenieria(p_id_linea_cot uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_linea RECORD;
    v_cotizacion RECORD;
    v_costo_vidrio NUMERIC := 0;
    v_moneda_vidrio TEXT;
    v_es_templado BOOLEAN := FALSE;
    v_costo_flete_m2 NUMERIC := 0;
    v_receta RECORD;
    v_sku_calculado TEXT;
    v_costo_unit_sku NUMERIC;
    v_moneda_sku TEXT;
    v_tipo_cambio NUMERIC;
    v_costo_convertido NUMERIC;
    v_costo_total_calc NUMERIC;
BEGIN
    -- 1. Obtener Datos de la Línea de Cotización
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Línea de cotización % no encontrada', p_id_linea_cot;
    END IF;

    -- 2. Obtener Datos de la Cabecera (para Marca, Markup, etc)
    SELECT * INTO v_cotizacion FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_linea.id_cotizacion;

    -- 3. Obtener Tipo de Cambio (Fallback a 3.8 si no existe)
    SELECT tipo_cambio_referencial INTO v_tipo_cambio FROM mst_config_general LIMIT 1;
    IF v_tipo_cambio IS NULL OR v_tipo_cambio = 0 THEN 
        v_tipo_cambio := 3.8; 
    END IF;

    -- 4. Limpiar Despiece Anterior (Idempotencia)
    DELETE FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    -- 5. LOGICA ACCION B (Loop sobre Recetas) y A (Generar Fila)
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

        -- Buscar Costo y Moneda del SKU
        SELECT costo_mercado_unit, moneda_reposicion INTO v_costo_unit_sku, v_moneda_sku
        FROM cat_productos_variantes 
        WHERE id_sku = v_sku_calculado;

        -- Si no encuentra costo, usar 0
        IF v_costo_unit_sku IS NULL THEN v_costo_unit_sku := 0; END IF;

        -- CONVERSION DE MONEDA (Si es USD, convertir a PEN)
        IF v_moneda_sku = 'USD' THEN
            v_costo_convertido := v_costo_unit_sku * v_tipo_cambio;
        ELSE
            v_costo_convertido := v_costo_unit_sku;
        END IF;

        -- CALCULO DE COSTO TOTAL (Refactorizado para claridad)
        -- Si es Perfil: (Metros * CostoMetro) * CantidadItems * CantidadPiezas
        -- Asumimos CostoCatalogo es por UNIDAD DE VENTA (Barra 6m o Pieza).
        -- Ajuste: Multiplicar por proporcion de uso si es barra.
        v_costo_total_calc := (COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad) * v_costo_convertido * 
             (CASE WHEN v_receta.tipo = 'Perfil' THEN 
                ((COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
                 (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
                 COALESCE(v_receta.constante_corte_mm, 0)) / 6000.0 -- Proporcion de Barra 6m
              ELSE 1 END);

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
            precio_venta_item -- FIX: Ahora igual al costo total (base para markup)
        ) VALUES (
            p_id_linea_cot,
            v_receta.tipo,
            v_receta.id_plantilla,
            v_receta.nombre_componente,
            v_linea.color_perfiles, 
            v_receta.angulo,
            v_sku_calculado,
            -- Medida Corte
            (COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
            (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
            COALESCE(v_receta.constante_corte_mm, 0),
            -- Cantidad Piezas Total
            COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad,
            -- Costo Total
            v_costo_total_calc,
            -- Precio Venta (Base) - FIX: Igual al costo total, para que no salga 0
            v_costo_total_calc
        );
    END LOOP;

    -- 6. LOGICA ACCION C: AGREGAR VIDRIO
    IF v_linea.tipo_vidrio IS NOT NULL THEN
        SELECT costo_mercado_unit, moneda_reposicion, es_templado, costo_flete_m2 
        INTO v_costo_vidrio, v_moneda_vidrio, v_es_templado, v_costo_flete_m2
        FROM cat_productos_variantes
        WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN';

        IF v_costo_vidrio IS NULL THEN
             SELECT costo_mercado_unit, moneda_reposicion, es_templado, costo_flete_m2 
             INTO v_costo_vidrio, v_moneda_vidrio, v_es_templado, v_costo_flete_m2
             FROM cat_productos_variantes WHERE id_sku = v_linea.tipo_vidrio;
        END IF;

        IF v_moneda_vidrio = 'USD' THEN
            v_costo_vidrio := v_costo_vidrio * v_tipo_cambio;
            v_costo_flete_m2 := v_costo_flete_m2 * v_tipo_cambio;
        END IF;

        DECLARE
            v_area_total NUMERIC;
            v_costo_vidrio_total NUMERIC;
        BEGIN
            v_area_total := (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0;
            v_costo_vidrio_total := v_area_total * COALESCE(v_costo_vidrio, 0);

            INSERT INTO trx_desglose_materiales (
                id_linea_cot,
                tipo_componente,
                nombre_componente,
                cantidad_calculada,
                sku_real,
                costo_total_item,
                precio_venta_item -- FIX
            ) VALUES (
                p_id_linea_cot,
                'Vidrio',
                'Vidrio Panel',
                v_area_total, -- M2
                'VID-' || v_linea.tipo_vidrio || '-GEN',
                v_costo_vidrio_total,
                v_costo_vidrio_total -- FIX
            );

            -- FLETE VIDRIO
            IF v_es_templado THEN
                 INSERT INTO trx_desglose_materiales (
                    id_linea_cot,
                    tipo_componente,
                    nombre_componente,
                    sku_real,
                    cantidad_calculada,
                    costo_total_item,
                    precio_venta_item -- FIX
                ) VALUES (
                    p_id_linea_cot,
                    'Servicio',
                    'Flete Vidrio',
                    'SER-FLETE-08MM',
                    v_area_total,
                    v_area_total * COALESCE(v_costo_flete_m2, 0),
                    v_area_total * COALESCE(v_costo_flete_m2, 0) -- FIX
                );
            END IF;
        END;
    END IF;

    -- 7. MANO DE OBRA
    IF v_cotizacion.costo_mano_obra_m2 > 0 THEN
        DECLARE
            v_costo_mo_total NUMERIC;
        BEGIN
            v_costo_mo_total := ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * v_cotizacion.costo_mano_obra_m2;
            INSERT INTO trx_desglose_materiales (
                id_linea_cot,
                tipo_componente,
                nombre_componente,
                cantidad_calculada,
                costo_total_item,
                precio_venta_item -- FIX
            ) VALUES (
                p_id_linea_cot,
                'Servicio',
                'Mano de Obra',
                (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0,
                v_costo_mo_total,
                v_costo_mo_total -- FIX
            );
        END;
    END IF;

END;
$function$
;
