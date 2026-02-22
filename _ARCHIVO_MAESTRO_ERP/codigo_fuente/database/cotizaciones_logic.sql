-- LOGICA DE NEGOCIO Y AUTOMATIZACION: MODULO COTIZACIONES (Thread-Safe)
-- Fecha: 2026-02-05
-- Autor: Windsurf Agent (Antigraivty)
-- Descripcion: Implementación de la lógica de "Despiece Automático" usando funciones Postgres 
-- para evitar condiciones de carrera (MAXROW) y asegurar integridad.

-- =================================================================================================
-- 1. FUNCIONES AUXILIARES
-- =================================================================================================

-- Función para construir el SKU dinámicamente según la lógica del prompt
CREATE OR REPLACE FUNCTION fn_calcular_sku_real(
    p_tipo TEXT,
    p_id_plantilla TEXT,
    p_color_perfiles TEXT,
    p_id_marca_cot TEXT,
    p_id_material_receta TEXT,
    p_id_acabado_receta TEXT,
    p_id_marca_receta TEXT
) RETURNS TEXT AS $$
BEGIN
    -- Logica exacta del JSON:
    -- IFS([TIPO] = "Perfil", CONCATENATE("AL-", [ID_Plantilla], "-", [Color_Perfiles], "-", [Marca_Cot]), TRUE, ...
    IF p_tipo = 'Perfil' THEN
        RETURN 'AL-' || p_id_plantilla || '-' || p_color_perfiles || '-' || p_id_marca_cot;
    ELSE
        -- Default for Accessories etc:
        -- CONCATENATE(IF(ISBLANK(...), "AC", ...), "-", [Plantilla], "-", ...)
        RETURN COALESCE(p_id_material_receta, 'AC') || '-' || 
               p_id_plantilla || '-' || 
               COALESCE(p_id_acabado_receta, 'GEN') || '-' || 
               COALESCE(p_id_marca_receta, 'GEN');
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =================================================================================================
-- 2. PROCEDIMIENTO PRINCIPAL: GENERAR DESPIECE (Acciones A, B, C, D)
-- =================================================================================================

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
    -- Filtro: [ID_Modelo] = [_THISROW].[ID_Modelo] AND ([CONDICION] = "BASE" OR [CONDICION] = Tipo_Cierre)
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

        -- Si no encuentra costo, usar 0 (o lanzar warning)
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
            -- Calculos Matemáticos
            medida_corte_mm,
            cantidad_calculada,
            costo_total_item,
            precio_venta_item -- Default 0 en el prompt
        ) VALUES (
            p_id_linea_cot,
            v_receta.tipo,
            v_receta.id_plantilla,
            v_receta.nombre_componente,
            v_linea.color_perfiles, -- Detalle Acabado
            v_receta.angulo,
            v_sku_calculado,
            -- Medida Corte: (Ancho * Factor) + (Alto * Factor) + Constante
            (COALESCE(v_receta.factor_corte_ancho, 0) * v_linea.ancho_mm) + 
            (COALESCE(v_receta.factor_corte_alto, 0) * v_linea.alto_mm) + 
            COALESCE(v_receta.constante_corte_mm, 0),
            -- Cantidad: Base * Cantidad Linea
            COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad,
            -- Costo Total: Cantidad * Costo Unitario SKU
            (COALESCE(v_receta.cantidad_base, 0) * v_linea.cantidad) * v_costo_unit_sku * 
            -- Ajuste por longitud si es perfil? El prompt no lo especifica explicitamente en Costo_Total_Item formula compleja, 
            -- pero dice: LookUp(... Costo_Mercado). 
            -- Si el costo es por metro lineal vs unidad, esto varía. Asumiremos UNIDAD por ahora según prompt simple.
            1, 
            0
        );
    END LOOP;

    -- 5. LOGICA ACCION C: AGREGAR VIDRIO
    -- Solo si hay tipo de vidrio definido
    IF v_linea.tipo_vidrio IS NOT NULL THEN
        -- Obtener datos del vidrio (Costo, Es Templado, Flete)
        SELECT costo_mercado_unit, es_templado, costo_flete_m2 
        INTO v_costo_vidrio, v_es_templado, v_costo_flete_m2
        FROM cat_productos_variantes
        WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN'; -- Asumiendo format SKU base

        -- Fallback si no encuentra por SKU construido, buscar por ID directo si fuera FK (pero el prompt dice Ref Cat)
        -- El prompt usa SKU_Real: CONCATENATE("VID-", [Tipo_Vidrio], "-GEN")
        -- Si v_costo_vidrio es null, intentar buscar directo en tabla por si el ID coincidia
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
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0, -- Metros Cuadrados
            'VID-' || v_linea.tipo_vidrio || '-GEN',
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * COALESCE(v_costo_vidrio, 0)
        );

        -- 6. LOGICA ACCION D: EMBALAJE + FLETE (Dinámico por Espesor)
        -- Solo si es vidrio templado, se cobra Flete según espesor (6, 8, 10mm)
        IF v_es_templado THEN
             DECLARE
                v_flete_sku TEXT;
                v_costo_flete_unit NUMERIC;
                v_espesor_vidrio NUMERIC := 0;
             BEGIN
                -- Buscar el espesor del vidrio
                SELECT espesor_mm INTO v_espesor_vidrio FROM cat_productos_variantes WHERE id_sku = 'VID-' || v_linea.tipo_vidrio || '-GEN';
                
                -- Fallback lookup
                IF v_espesor_vidrio IS NULL THEN
                    SELECT espesor_mm INTO v_espesor_vidrio FROM cat_productos_variantes WHERE id_sku = v_linea.tipo_vidrio;
                END IF;

                -- Determinar SKU de Flete (Default 10mm si no encuentra)
                IF v_espesor_vidrio <= 6 THEN v_flete_sku := 'SER-FLETE-06MM';
                ELSIF v_espesor_vidrio <= 8 THEN v_flete_sku := 'SER-FLETE-08MM';
                ELSE v_flete_sku := 'SER-FLETE-10MM'; -- 10mm o mas
                END IF;

                -- Obtener costo del servicio de flete
                SELECT costo_mercado_unit INTO v_costo_flete_unit FROM cat_productos_variantes WHERE id_sku = v_flete_sku;

                -- Insertar
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
                    (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0, -- Cantidad (M2)
                    ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * COALESCE(v_costo_flete_unit, 0)
                );
             END;
        END IF;
    END IF;

    -- 7. LOGICA ACCION E: MANO DE OBRA / COLOCACION (Explicito en Despiece)
    -- Si hay costo de MO configurado en la cabecera, se agrega como item de Servicio.
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
            (v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0, -- Metros Cuadrados
            ((v_linea.ancho_mm * v_linea.alto_mm) / 1000000.0) * v_cotizacion.costo_mano_obra_m2
        );
    END IF;

END;
$$ LANGUAGE plpgsql;


-- =================================================================================================
-- 3. VISTAS PARA COLUMNAS VIRTUALES (Virtual Columns Optimization)
-- =================================================================================================

-- Vista Detallada con Costos Calculados (Reemplaza _VC_Precio_Venta_Linea y Costo_Base_Ref)
CREATE OR REPLACE VIEW vw_cotizaciones_detalladas AS
SELECT 
    d.*,
    -- _Costo_Materiales (Suma del desglose, ahora incluye MO)
    COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0) as _costo_materiales,
    
    -- Recalculo dinámico de precios (Por si cambian parametros globales)
    -- Precio_Unit_Oferta FORMULA: [Costo_Total_Desglose] * (1+Markup)
    -- NOTA: Ya no sumamos MO aqui porque se agrego al desglose explícitamente.
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + c.markup_aplicado)
    ) as _vc_precio_unit_oferta_calc,

    -- Subtotal Linea
    (
        COALESCE((SELECT SUM(costo_total_item) FROM trx_desglose_materiales WHERE id_linea_cot = d.id_linea_cot), 0)
        * (1 + c.markup_aplicado)
    ) * d.cantidad as _vc_subtotal_linea_calc

FROM trx_cotizaciones_detalle d
JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion;

-- Vista de Cabecera con Totales (Reemplaza _VC_Precio_Final_Cliente)
CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
SELECT 
    c.*,
    -- Suma de costos directos de todas las lineas
    COALESCE((
        SELECT SUM(_costo_materiales) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _vc_total_costo_materiales,

    -- Suma de precios de venta (Subtotal antes de IGV header calculator)
    COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) as _vc_subtotal_venta,

    -- IGV
    CASE WHEN c.incluye_igv THEN 
        COALESCE((
            SELECT SUM(_vc_subtotal_linea_calc) 
            FROM vw_cotizaciones_detalladas 
            WHERE id_cotizacion = c.id_cotizacion
        ), 0) * (SELECT igv FROM mst_config_general LIMIT 1)
    ELSE 0 END as _vc_monto_igv,

    -- Total Final
    (COALESCE((
        SELECT SUM(_vc_subtotal_linea_calc) 
        FROM vw_cotizaciones_detalladas 
        WHERE id_cotizacion = c.id_cotizacion
    ), 0) * (CASE WHEN c.incluye_igv THEN (1 + (SELECT igv FROM mst_config_general LIMIT 1)) ELSE 1 END)) 
    as _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c;
