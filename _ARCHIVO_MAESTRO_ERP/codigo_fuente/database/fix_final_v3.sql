-- FIX FINAL V3: ARREGLAR VISUALIZACION DE PRECIOS Y LOGICA DE FLETES
-- Autor: Antigravity
-- Fecha: 2026-02-12

-- 1. ACTUALIZAR VISTA PARA MANEJAR MARKUP NULL
-- Si markup_aplicado es NULL, la operacion matematica daba NULL. Ahora usa 0 como default.
CREATE OR REPLACE VIEW public.vw_cotizaciones_detalladas
WITH(security_invoker=true)
AS SELECT d.id_linea_cot,
    d.id_cotizacion,
    d.id_modelo,
    d.color_perfiles,
    d.cantidad,
    d.ancho_mm,
    d.alto_mm,
    d.etiqueta_item,
    d.ubicacion,
    d.tipo_cierre,
    d.tipo_vidrio,
    d.grupo_opcion,
    d.costo_base_ref,
    d.subtotal_linea,
    -- Costo Materiales (Suma directa)
    COALESCE(( SELECT sum(trx_desglose_materiales.costo_total_item) AS sum
           FROM trx_desglose_materiales
          WHERE trx_desglose_materiales.id_linea_cot = d.id_linea_cot), 0::numeric) AS _costo_materiales,
    -- Precio Unitario (Calculado: Costo * (1 + Markup)). COALESCE en Markup para evitar NULL.
    COALESCE(( SELECT sum(trx_desglose_materiales.costo_total_item) AS sum
           FROM trx_desglose_materiales
          WHERE trx_desglose_materiales.id_linea_cot = d.id_linea_cot), 0::numeric) * (1::numeric + COALESCE(c.markup_aplicado, 0)) AS _vc_precio_unit_oferta_calc,
    -- Subtotal Linea (Precio Unit Calc * Cantidad)
    COALESCE(( SELECT sum(trx_desglose_materiales.costo_total_item) AS sum
           FROM trx_desglose_materiales
          WHERE trx_desglose_materiales.id_linea_cot = d.id_linea_cot), 0::numeric) * (1::numeric + COALESCE(c.markup_aplicado, 0)) * d.cantidad AS _vc_subtotal_linea_calc
   FROM trx_cotizaciones_detalle d
     JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;


-- 2. ACTUALIZAR FUNCION DE DESPIECE (HARDENING)
-- Mejor manejo de NULLs en variables criticas (Mano de Obra, Templado, etc)
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
    SELECT * INTO v_linea FROM trx_cotizaciones_detalle WHERE id_linea_cot = p_id_linea_cot;
    IF NOT FOUND THEN RAISE EXCEPTION 'Línea % no encontrada', p_id_linea_cot; END IF;

    SELECT * INTO v_cotizacion FROM trx_cotizaciones_cabecera WHERE id_cotizacion = v_linea.id_cotizacion;

    SELECT tipo_cambio_referencial INTO v_tipo_cambio FROM mst_config_general LIMIT 1;
    v_tipo_cambio := COALESCE(v_tipo_cambio, 3.8);

    DELETE FROM trx_desglose_materiales WHERE id_linea_cot = p_id_linea_cot;

    -- LOOP PERFILES/ACCESORIOS
    FOR v_receta IN 
        SELECT * FROM mst_recetas_ingenieria 
        WHERE id_modelo = v_linea.id_modelo 
        AND (condicion = 'BASE' OR condicion = v_linea.tipo_cierre)
        AND nombre_componente NOT ILIKE '%Flete%' 
        AND nombre_componente NOT ILIKE '%Emb%'
    LOOP
        v_sku_calculado := fn_calcular_sku_real(
            v_receta.tipo,
            v_receta.id_plantilla,
            v_linea.color_perfiles,
            v_cotizacion.id_marca,
            v_receta.id_material_receta,
            v_receta.id_acabado_receta,
            v_receta.id_marca_receta
        );

        SELECT costo_mercado_unit, moneda_reposicion INTO v_costo_unit_sku, v_moneda_sku
        FROM cat_productos_variantes WHERE id_sku = v_sku_calculado;

        v_costo_unit_sku := COALESCE(v_costo_unit_sku, 0);

        IF v_moneda_sku = 'USD' THEN
            v_costo_convertido := v_costo_unit_sku * v_tipo_cambio;
        ELSE
            v_costo_convertido := v_costo_unit_sku;
        END IF;

        v_costo_total_calc := (COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad) * v_costo_convertido * 
             (CASE WHEN v_receta.tipo = 'Perfil' THEN 
                ((COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
                 (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
                 COALESCE(v_receta.constante_corte_mm, 0)) / 6000.0
              ELSE 1 END);

        INSERT INTO trx_desglose_materiales (
            id_linea_cot, tipo_componente, codigo_base, nombre_componente, detalle_acabado, angulo_corte, sku_real, medida_corte_mm, cantidad_calculada, costo_total_item, precio_venta_item
        ) VALUES (
            p_id_linea_cot, v_receta.tipo, v_receta.id_plantilla, v_receta.nombre_componente, v_linea.color_perfiles, v_receta.angulo, v_sku_calculado,
            (COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + COALESCE(v_receta.constante_corte_mm, 0),
            COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad,
            v_costo_total_calc, v_costo_total_calc
        );
    END LOOP;

    -- LOGICA VIDRIO Y FLETES
    IF v_linea.tipo_vidrio IS NOT NULL AND v_linea.tipo_vidrio <> '' THEN
        -- Buscar datos de vidrio
        SELECT costo_mercado_unit, moneda_reposicion, es_templado, costo_flete_m2 
        INTO v_costo_vidrio, v_moneda_vidrio, v_es_templado, v_costo_flete_m2
        FROM cat_productos_variantes WHERE id_sku = v_linea.tipo_vidrio;
        
        -- Fallback SKU Generico si no encuentra directo
        IF v_costo_vidrio IS NULL THEN
            SELECT costo_mercado_unit, moneda_reposicion, es_templado, costo_flete_m2 
            INTO v_costo_vidrio, v_moneda_vidrio, v_es_templado, v_costo_flete_m2
            FROM cat_productos_variantes WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN';
        END IF;

        -- Conversiones y Defaults
        v_costo_vidrio := COALESCE(v_costo_vidrio, 0);
        v_costo_flete_m2 := COALESCE(v_costo_flete_m2, 0);
        v_es_templado := COALESCE(v_es_templado, FALSE);

        IF v_moneda_vidrio = 'USD' THEN
            v_costo_vidrio := v_costo_vidrio * v_tipo_cambio;
            v_costo_flete_m2 := v_costo_flete_m2 * v_tipo_cambio;
        END IF;

        DECLARE
            v_area_total NUMERIC;
            v_costo_vidrio_total NUMERIC;
        BEGIN
            v_area_total := (v_linea.ancho_mm * v_linea.alto_mm * v_linea.cantidad) / 1000000.0; -- OJO: MULTI POR CANTIDAD DE ITEMS!
            -- CORRECCION CANTIDAD: En el script anterior usabamos solo ancho*alto, pero si son 10 ventanas?
            -- v_linea.cantidad es la cantidad de items (entradas en la tabla).
            -- El despiece debe reflejar el costo TOTAL de la linea.
            -- En Perfiles multiplicamos por v_linea.cantidad.
            -- Aqui tambien debemos multiplicar.
            
            v_costo_vidrio_total := v_area_total * v_costo_vidrio;

            INSERT INTO trx_desglose_materiales (
                id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, sku_real, costo_total_item, precio_venta_item
            ) VALUES (
                p_id_linea_cot, 'Vidrio', 'Vidrio Panel', v_area_total, v_linea.tipo_vidrio, v_costo_vidrio_total, v_costo_vidrio_total
            );

            -- FLETE VIDRIO (Solo si es templado y costo > 0)
            IF v_es_templado AND v_costo_flete_m2 > 0 THEN
                 INSERT INTO trx_desglose_materiales (
                    id_linea_cot, tipo_componente, nombre_componente, sku_real, cantidad_calculada, costo_total_item, precio_venta_item
                ) VALUES (
                    p_id_linea_cot, 'Servicio', 'Flete Vidrio', 'SER-FLETE', v_area_total, v_area_total * v_costo_flete_m2, v_area_total * v_costo_flete_m2
                );
            END IF;
        END;
    END IF;

    -- MANO DE OBRA
    -- Usar COALESCE para evitar NULL en la comparacion
    IF COALESCE(v_cotizacion.costo_mano_obra_m2, 0) > 0 THEN
        DECLARE
            v_costo_mo_total NUMERIC;
            v_area_total_mo NUMERIC;
        BEGIN
             v_area_total_mo := (v_linea.ancho_mm * v_linea.alto_mm * v_linea.cantidad) / 1000000.0;
            v_costo_mo_total := v_area_total_mo * v_cotizacion.costo_mano_obra_m2;
            
            INSERT INTO trx_desglose_materiales (
                id_linea_cot, tipo_componente, nombre_componente, cantidad_calculada, costo_total_item, precio_venta_item
            ) VALUES (
                p_id_linea_cot, 'Servicio', 'Mano de Obra', v_area_total_mo, v_costo_mo_total, v_costo_mo_total
            );
        END;
    END IF;
END;
$function$
;
