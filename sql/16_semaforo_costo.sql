-- Modificaciones para el Semáforo de Costos y Salidas con Costo de Mercado

-- 1. Actualizar vw_stock_realtime para exponer fecha_act_precio
CREATE OR REPLACE VIEW public.vw_stock_realtime
WITH(security_invoker=on)
AS SELECT p.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    p.cod_proveedor,
    p.costo_mercado_unit,
    p.moneda_reposicion,
    p.id_marca,
    p.id_material,
    p.id_acabado,
    p.id_almacen,
    pl.id_sistema,
    pl.largo_estandar_mm,
    pl.peso_teorico_kg,
    pl.imagen_ref,
    m_sis.nombre_comercial AS sistema_nombre,
    m_sis.cod_corrales,
    m_sis.cod_eduholding,
    m_sis.cod_hpd,
    m_sis.cod_limatambo,
    m_sis.uso_principal AS sistema_uso,
    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado,
    m_alm.nombre_almacen,
    COALESCE(sum(tm.cantidad), 0::numeric) AS stock_actual,
    COALESCE(sum(tm.costo_total_pen), 0::numeric) AS inversion_total,
        CASE
            WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN COALESCE(sum(tm.costo_total_pen), 0::numeric) / NULLIF(sum(tm.cantidad), 0::numeric)
            ELSE 0::numeric
        END AS costo_promedio,
        CASE
            WHEN COALESCE(sum(tm.cantidad), 0::numeric) < 0::numeric THEN 1
            WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN 2
            ELSE 3
        END AS orden_prioridad,
    max(tm.fecha_hora) AS ultima_actualizacion,
    COALESCE(p.stock_minimo, 0::numeric) AS stock_minimo,
    COALESCE(p.punto_pedido, 0::numeric) AS punto_pedido,
    p.fecha_act_precio -- NUEVO CAMPO AÑADIDO AL FINAL
   FROM cat_productos_variantes p
     LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
     LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
     LEFT JOIN mst_series_equivalencias m_sis ON pl.id_sistema = m_sis.id_sistema
     LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia
     LEFT JOIN mst_marcas m_mar ON p.id_marca = m_mar.id_marca
     LEFT JOIN mst_materiales m_mat ON p.id_material = m_mat.id_material
     LEFT JOIN mst_acabados_colores m_acab ON p.id_acabado = m_acab.id_acabado
     LEFT JOIN mst_almacenes m_alm ON p.id_almacen = m_alm.id_almacen
  GROUP BY p.id_sku, p.nombre_completo, p.unidad_medida, p.cod_proveedor, p.costo_mercado_unit, p.moneda_reposicion, p.id_marca, p.id_material, p.id_acabado, p.id_almacen, pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado, m_alm.nombre_almacen, p.stock_minimo, p.punto_pedido, p.fecha_act_precio;


-- 2. Eliminar y recrear mvw_stock_realtime para incluir fecha_act_precio
DROP MATERIALIZED VIEW IF EXISTS public.mvw_stock_realtime;
CREATE MATERIALIZED VIEW public.mvw_stock_realtime
TABLESPACE pg_default
AS SELECT p.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    p.cod_proveedor,
    p.costo_mercado_unit,
    p.moneda_reposicion,
    p.id_marca,
    p.id_material,
    p.id_acabado,
    p.id_almacen,
    pl.id_sistema,
    pl.largo_estandar_mm,
    pl.peso_teorico_kg,
    pl.imagen_ref,
    m_sis.nombre_comercial AS sistema_nombre,
    m_sis.cod_corrales,
    m_sis.cod_eduholding,
    m_sis.cod_hpd,
    m_sis.cod_limatambo,
    m_sis.uso_principal AS sistema_uso,
    m_fam.nombre_familia,
    m_mar.nombre_marca,
    m_mat.nombre_material,
    m_acab.nombre_acabado,
    m_alm.nombre_almacen,
    COALESCE(sum(tm.cantidad), 0::numeric) AS stock_actual,
    COALESCE(sum(tm.costo_total_pen), 0::numeric) AS inversion_total,
        CASE
            WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN COALESCE(sum(tm.costo_total_pen), 0::numeric) / NULLIF(sum(tm.cantidad), 0::numeric)
            ELSE 0::numeric
        END AS costo_promedio,
        CASE
            WHEN COALESCE(sum(tm.cantidad), 0::numeric) < 0::numeric THEN 1
            WHEN COALESCE(sum(tm.cantidad), 0::numeric) > 0::numeric THEN 2
            ELSE 3
        END AS orden_prioridad,
    max(tm.fecha_hora) AS ultima_actualizacion,
    COALESCE(p.stock_minimo, 0::numeric) AS stock_minimo,
    COALESCE(p.punto_pedido, 0::numeric) AS punto_pedido,
    p.fecha_act_precio -- NUEVO CAMPO AÑADIDO AL FINAL
   FROM cat_productos_variantes p
     LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
     LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
     LEFT JOIN mst_series_equivalencias m_sis ON pl.id_sistema = m_sis.id_sistema
     LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia
     LEFT JOIN mst_marcas m_mar ON p.id_marca = m_mar.id_marca
     LEFT JOIN mst_materiales m_mat ON p.id_material = m_mat.id_material
     LEFT JOIN mst_acabados_colores m_acab ON p.id_acabado = m_acab.id_acabado
     LEFT JOIN mst_almacenes m_alm ON p.id_almacen = m_alm.id_almacen
  GROUP BY p.id_sku, p.nombre_completo, p.unidad_medida, p.cod_proveedor, p.costo_mercado_unit, p.moneda_reposicion, p.id_marca, p.id_material, p.id_acabado, p.id_almacen, pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado, m_alm.nombre_almacen, p.stock_minimo, p.punto_pedido, p.fecha_act_precio
WITH DATA;

CREATE INDEX idx_mvw_stock_nombre ON public.mvw_stock_realtime USING btree (nombre_completo);
CREATE INDEX idx_mvw_stock_orden ON public.mvw_stock_realtime USING btree (orden_prioridad, id_sku);
CREATE UNIQUE INDEX idx_mvw_stock_realtime_id_sku ON public.mvw_stock_realtime USING btree (id_sku);


-- 3. Modificar fn_trigger_salida_to_kardex
CREATE OR REPLACE FUNCTION public.fn_trigger_salida_to_kardex()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_tipo_salida TEXT;
    v_comentario TEXT;
    v_tipo_movimiento TEXT;
    v_costo_pmp NUMERIC;
    v_costo_mercado NUMERIC;
    v_tipo_cambio NUMERIC := 1.00;
    v_moneda_sku TEXT := 'PEN';
    v_costo_aplicado NUMERIC;
BEGIN
    -- Get header info
    SELECT tipo_salida, comentario INTO v_tipo_salida, v_comentario
    FROM trx_salidas_cabecera
    WHERE id_salida = NEW.id_salida;
    
    -- Get Current PMP and Costo Mercado from View (Snapshot before this insert)
    SELECT COALESCE(costo_promedio, 0), COALESCE(costo_mercado_unit, 0), moneda_reposicion 
    INTO v_costo_pmp, v_costo_mercado, v_moneda_sku
    FROM vw_stock_realtime
    WHERE id_sku = NEW.id_sku;

    -- Map Logic
    IF v_tipo_salida = 'AJUSTE_NEGATIVO' THEN
        v_tipo_movimiento := 'AJUSTE';
    ELSIF v_tipo_salida = 'DEVOLUCION_PROOVEDOR' THEN
        v_tipo_movimiento := 'AJUSTE'; 
    ELSIF v_tipo_salida = 'PRODUCCION' THEN
        v_tipo_movimiento := 'PRODUCCION';
    ELSE
        v_tipo_movimiento := 'VENTA';
    END IF;

    -- Aplicar lógica de costo basada en requerimiento: Ventas a Costo Mercado
    IF v_tipo_movimiento = 'VENTA' THEN
        -- Si esta en USD, convertir a PEN en el momento (asumiendo TC 3.75 aprox desde config)
        IF v_moneda_sku = 'USD' THEN
           SELECT COALESCE(tipo_cambio_referencial, 3.75) INTO v_tipo_cambio FROM mst_config_general LIMIT 1;
           v_costo_mercado := v_costo_mercado * v_tipo_cambio;
        END IF;

        IF v_costo_mercado > 0 THEN
            v_costo_aplicado := v_costo_mercado;
        ELSE
            v_costo_aplicado := v_costo_pmp;
        END IF;
    ELSE
        v_costo_aplicado := v_costo_pmp;
    END IF;

    INSERT INTO trx_movimientos (
        tipo_movimiento,
        id_sku,
        cantidad,
        costo_unit_doc,
        costo_total_pen,
        referencia_doc,
        comentarios,
        tipo_cambio,
        id_almacen,
        moneda_origen
    )
    VALUES (
        v_tipo_movimiento,
        NEW.id_sku,
        NEW.cantidad * -1, -- Negative for outbound
        v_costo_aplicado,       -- Exit at applied cost
        (NEW.cantidad * -1) * v_costo_aplicado, -- Total value
        NEW.id_salida,
        v_comentario,
        1.00,
        'PRINCIPAL',
        'PEN'
    );
    RETURN NEW;
END;
$function$
;
