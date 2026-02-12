-- MODIFICACION PARA SOPORTAR MONEDA Y SOLUCIONAR COSTOS
-- Autor: Antigravity

CREATE OR REPLACE FUNCTION fn_generar_despiece_ingenieria(p_id_linea_cot UUID)
RETURNS VOID AS $$
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

        -- Insertar en TRX_DESGLOSE_MATERIALES
        INSERT INTO trx_desglose_materiales (
            id_linea_cot,
            tipo_componente,
            codigo_base,
            nombre_componente,
            detalle_acabado,
            angulo_corte,
            sku_real,
            -- Calculos Matemáticos
            medida_corte_mm,
            cantidad_calculada,
            costo_total_item,
            precio_venta_item 
        ) VALUES (
            p_id_linea_cot,
            v_receta.tipo,
            v_receta.id_plantilla,
            v_receta.nombre_componente,
            v_linea.color_perfiles, -- Detalle Acabado
            v_receta.angulo,
            v_sku_calculado,
            -- Medida Corte
            (COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
            (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
            COALESCE(v_receta.constante_corte_mm, 0),
            -- Cantidad (Unidades o Longitud total si se requiere, pero aqui es Unidades de la pieza)
            COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad,
            -- Costo Total: CantidadPiezas * CostoUnitarioProducto * (Longitud/6000 si es perfil? NO, el costo unitario suele ser por barra de 6m o por m lineal)
            -- ASUMPCION IMPORTANTE: El costo_mercado_unit en Catalogo para perfiles es POR METRO LINEAL o POR BARRA?
            -- Generalmente es por BARRA completa (6m). Si despiezamos, cobramos proporcional o la barra entera?
            -- Para ingeniería fina, se costea los mm consumidos: (LongitudMM / 6000) * CostoBarra.
            -- O si el costo es por metro: (LongitudMM / 1000) * CostoMetro.
            -- VAMOS A ASUMIR POR METRO LINEAL para simplificar, o ajustar segun unidad.
            -- Si unidad_medida = 'UND' (Barra), entonces (Largo/6000). Si 'M' (Metro), (Largo/1000).
            -- Por ahora usaremos logica de PROPORCION SIMPLE asuminedo precio por unidad de venta estandar.
            
            -- FIX: Multiplicar por cantidad
             (COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad) * v_costo_convertido * 
             -- Factor de longitud para costo:
             -- Si es Perfil, el costo_unit_sku es "Por Barra de 6m" usualmente?
             -- Vamos a asumir que el precio es por la Unidad de Medida del catalogo.
             -- Si es Perfil, calculamos fraccion? (medida_corte / 1000 si es precio por metro)
             -- Dejaremos valor directo por ahora: Cantidad * CostoUnitario. 
             -- SI ES PERFIL, ESCALAMOS: 
             (CASE WHEN v_receta.tipo = 'Perfil' THEN 
                ((COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
                 (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
                 COALESCE(v_receta.constante_corte_mm, 0)) / 6000.0 -- Asumiendo Precio es por Barra de 6m
              ELSE 1 END),
            0
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
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0, -- M2
            'VID-' || v_linea.tipo_vidrio || '-GEN',
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * COALESCE(v_costo_vidrio, 0)
        );

        -- FLETE VIDRIO
        IF v_es_templado THEN
             DECLARE
                v_flete_sku TEXT;
                v_costo_flete_unit NUMERIC;
             BEGIN
                -- ... (Logica de espesor simplificada para este script)
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
                    'Flete Vidrio',
                    'SER-FLETE-08MM',
                    (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0,
                    ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * COALESCE(v_costo_flete_m2, 0)
                );
             END;
        END IF;
    END IF;

    -- 7. MANO DE OBRA
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
            'Mano de Obra',
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0,
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * v_cotizacion.costo_mano_obra_m2
        );
    END IF;

END;
$$ LANGUAGE plpgsql;
