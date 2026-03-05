-- =====================================================================================
-- SCRIPT DE MIGRACIÓN: ALMACENES (Ubicaciones Físicas)
-- =====================================================================================

-- 1. Crear tabla de Almacenes
CREATE TABLE public.mst_almacenes (
    id_almacen text NOT NULL,
    nombre_almacen text NOT NULL,
    CONSTRAINT mst_almacenes_pkey PRIMARY KEY (id_almacen)
);

ALTER TABLE public.mst_almacenes ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para mst_almacenes
CREATE POLICY almacenes_select ON public.mst_almacenes
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);

CREATE POLICY almacenes_write ON public.mst_almacenes
    AS PERMISSIVE FOR ALL TO authenticated
    USING (get_user_role() = 'ADMIN'::text)
    WITH CHECK (get_user_role() = 'ADMIN'::text);

-- 2. Insertar Almacenes por Default
INSERT INTO public.mst_almacenes (id_almacen, nombre_almacen) VALUES
('PERFILES', 'Almacén Perfiles'),
('ACCESORIOS', 'Almacén Accesorios'),
('VIDRIOS', 'Almacén Vidrios'),
('PRINCIPAL', 'Almacén Principal');

-- 3. Agregar columna id_almacen a cat_productos_variantes
ALTER TABLE public.cat_productos_variantes
    ADD COLUMN id_almacen text NULL,
    ADD CONSTRAINT cat_productos_variantes_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES public.mst_almacenes(id_almacen);

CREATE INDEX idx_cat_productos_variantes_id_almacen ON public.cat_productos_variantes USING btree (id_almacen);

-- 4. Asignación Masiva de Almacenes (Migración de Data)
-- Perfiles -> PERFILES
UPDATE public.cat_productos_variantes
SET id_almacen = 'PERFILES'
WHERE id_sku LIKE 'AL-%';

-- Resto (Accesorios, Servicios, etc.) -> ACCESORIOS
UPDATE public.cat_productos_variantes
SET id_almacen = 'ACCESORIOS'
WHERE id_almacen IS NULL;

-- 5. Actualizar Función rename_sku para incluir id_almacen
CREATE OR REPLACE FUNCTION public.rename_sku(old_sku text, new_sku text, new_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- 1. Verificar que el SKU antiguo existe
    IF NOT EXISTS (SELECT 1 FROM cat_productos_variantes WHERE id_sku = old_sku) THEN
        RAISE EXCEPTION 'SKU antiguo "%" no existe', old_sku;
    END IF;

    -- 2. Si el SKU no cambió, solo actualizar los datos
    IF old_sku = new_sku THEN
        UPDATE cat_productos_variantes
        SET
            id_plantilla = COALESCE(new_data->>'id_plantilla', id_plantilla),
            id_marca = COALESCE(new_data->>'id_marca', id_marca),
            id_material = COALESCE(new_data->>'id_material', id_material),
            id_acabado = COALESCE(new_data->>'id_acabado', id_acabado),
            cod_proveedor = COALESCE(new_data->>'cod_proveedor', cod_proveedor),
            id_almacen = COALESCE(new_data->>'id_almacen', id_almacen), -- NUEVO CAMPO
            nombre_completo = COALESCE(new_data->>'nombre_completo', nombre_completo),
            unidad_medida = COALESCE(new_data->>'unidad_medida', unidad_medida),
            costo_mercado_unit = COALESCE((new_data->>'costo_mercado_unit')::numeric, costo_mercado_unit),
            moneda_reposicion = COALESCE(new_data->>'moneda_reposicion', moneda_reposicion),
            es_templado = COALESCE((new_data->>'es_templado')::boolean, es_templado),
            espesor_mm = COALESCE((new_data->>'espesor_mm')::numeric, espesor_mm),
            costo_flete_m2 = COALESCE((new_data->>'costo_flete_m2')::numeric, costo_flete_m2),
            stock_minimo = COALESCE((new_data->>'stock_minimo')::numeric, stock_minimo),
            punto_pedido = COALESCE((new_data->>'punto_pedido')::numeric, punto_pedido),
            tiempo_reposicion_dias = COALESCE((new_data->>'tiempo_reposicion_dias')::int, tiempo_reposicion_dias),
            lote_econ_compra = COALESCE((new_data->>'lote_econ_compra')::numeric, lote_econ_compra),
            demanda_promedio_diaria = COALESCE((new_data->>'demanda_promedio_diaria')::numeric, demanda_promedio_diaria),
            fecha_act_precio = NOW()
        WHERE id_sku = old_sku;
        RETURN;
    END IF;

    -- 3. Verificar que el nuevo SKU no exista ya
    IF EXISTS (SELECT 1 FROM cat_productos_variantes WHERE id_sku = new_sku) THEN
        RAISE EXCEPTION 'SKU nuevo "%" ya existe en el catálogo', new_sku;
    END IF;

    -- 4. Insertar nuevo registro copiando datos del antiguo + nuevos datos
    INSERT INTO cat_productos_variantes (
        id_sku, id_plantilla, id_marca, id_material, id_acabado,
        cod_proveedor, id_almacen, nombre_completo, unidad_medida, -- NUEVO CAMPO id_almacen
        costo_mercado_unit, moneda_reposicion, fecha_act_precio,
        es_templado, espesor_mm, costo_flete_m2,
        stock_minimo, punto_pedido, tiempo_reposicion_dias,
        lote_econ_compra, demanda_promedio_diaria
    )
    SELECT
        new_sku,
        COALESCE(new_data->>'id_plantilla', old.id_plantilla),
        COALESCE(new_data->>'id_marca', old.id_marca),
        COALESCE(new_data->>'id_material', old.id_material),
        COALESCE(new_data->>'id_acabado', old.id_acabado),
        COALESCE(new_data->>'cod_proveedor', old.cod_proveedor),
        COALESCE(new_data->>'id_almacen', old.id_almacen), -- NUEVO CAMPO
        COALESCE(new_data->>'nombre_completo', old.nombre_completo),
        COALESCE(new_data->>'unidad_medida', old.unidad_medida),
        COALESCE((new_data->>'costo_mercado_unit')::numeric, old.costo_mercado_unit),
        COALESCE(new_data->>'moneda_reposicion', old.moneda_reposicion),
        NOW(),
        COALESCE((new_data->>'es_templado')::boolean, old.es_templado),
        COALESCE((new_data->>'espesor_mm')::numeric, old.espesor_mm),
        COALESCE((new_data->>'costo_flete_m2')::numeric, old.costo_flete_m2),
        COALESCE((new_data->>'stock_minimo')::numeric, old.stock_minimo),
        COALESCE((new_data->>'punto_pedido')::numeric, old.punto_pedido),
        COALESCE((new_data->>'tiempo_reposicion_dias')::int, old.tiempo_reposicion_dias),
        COALESCE((new_data->>'lote_econ_compra')::numeric, old.lote_econ_compra),
        COALESCE((new_data->>'demanda_promedio_diaria')::numeric, old.demanda_promedio_diaria)
    FROM cat_productos_variantes old
    WHERE old.id_sku = old_sku;

    -- 5. Actualizar TODAS las tablas que referencian el SKU antiguo
    UPDATE trx_movimientos SET id_sku = new_sku WHERE id_sku = old_sku;
    UPDATE trx_entradas_detalle SET id_sku = new_sku WHERE id_sku = old_sku;
    UPDATE trx_salidas_detalle SET id_sku = new_sku WHERE id_sku = old_sku;
    UPDATE trx_desglose_materiales SET sku_real = new_sku WHERE sku_real = old_sku;
    UPDATE dat_retazos_disponibles SET id_sku_padre = new_sku WHERE id_sku_padre = old_sku;

    -- 6. Eliminar el registro antiguo (ya no tiene dependencias)
    DELETE FROM cat_productos_variantes WHERE id_sku = old_sku;
END;
$function$;

-- 6. Actualizar Vistas

-- 6a. vw_stock_realtime
DROP VIEW IF EXISTS public.vw_dashboard_stock_realtime CASCADE;
DROP VIEW IF EXISTS public.vw_kpi_stock_zombie CASCADE;
DROP VIEW IF EXISTS public.vw_kpi_valorizacion CASCADE;
DROP VIEW IF EXISTS public.vw_stock_realtime CASCADE;

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
    p.id_almacen, -- NUEVO CAMPO
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
    m_alm.nombre_almacen, -- NUEVO CAMPO
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
    COALESCE(p.punto_pedido, 0::numeric) AS punto_pedido
   FROM cat_productos_variantes p
     LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
     LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
     LEFT JOIN mst_series_equivalencias m_sis ON pl.id_sistema = m_sis.id_sistema
     LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia
     LEFT JOIN mst_marcas m_mar ON p.id_marca = m_mar.id_marca
     LEFT JOIN mst_materiales m_mat ON p.id_material = m_mat.id_material
     LEFT JOIN mst_acabados_colores m_acab ON p.id_acabado = m_acab.id_acabado
     LEFT JOIN mst_almacenes m_alm ON p.id_almacen = m_alm.id_almacen -- NUEVO JOIN
  GROUP BY p.id_sku, p.nombre_completo, p.unidad_medida, p.cod_proveedor, p.costo_mercado_unit, p.moneda_reposicion, p.id_marca, p.id_material, p.id_acabado, p.id_almacen, pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado, m_alm.nombre_almacen, p.stock_minimo, p.punto_pedido;


-- 6b. vw_dashboard_stock_realtime (depende de cat_productos_variantes)
CREATE OR REPLACE VIEW public.vw_dashboard_stock_realtime
WITH(security_invoker=true)
AS WITH stock_calc AS (
         SELECT trx_movimientos.id_sku,
            COALESCE(sum(trx_movimientos.cantidad), 0::numeric) AS stock_actual,
                CASE
                    WHEN sum(
                    CASE
                        WHEN trx_movimientos.cantidad > 0::numeric THEN trx_movimientos.cantidad
                        ELSE 0::numeric
                    END) = 0::numeric THEN 0::numeric
                    ELSE sum(
                    CASE
                        WHEN trx_movimientos.cantidad > 0::numeric THEN trx_movimientos.cantidad * COALESCE(trx_movimientos.costo_unit_doc, 0::numeric)
                        ELSE 0::numeric
                    END) / sum(
                    CASE
                        WHEN trx_movimientos.cantidad > 0::numeric THEN trx_movimientos.cantidad
                        ELSE 0::numeric
                    END)
                END AS costo_promedio_calculado
           FROM trx_movimientos
          GROUP BY trx_movimientos.id_sku
        )
 SELECT sc.id_sku,
    p.nombre_completo,
    p.unidad_medida,
    p.id_almacen, -- NUEVO CAMPO
    COALESCE(p.stock_minimo, 0::numeric) AS stock_minimo,
    COALESCE(p.punto_pedido, 0::numeric) AS punto_pedido,
    sc.stock_actual,
    sc.costo_promedio_calculado AS costo_pmp,
    sc.stock_actual * sc.costo_promedio_calculado AS valor_total_pen,
        CASE
            WHEN sc.stock_actual <= 0::numeric THEN 'CRITICO'::text
            WHEN sc.stock_actual <= p.stock_minimo THEN 'CRITICO'::text
            WHEN sc.stock_actual <= p.punto_pedido THEN 'ALERTA'::text
            ELSE 'OK'::text
        END AS estado_abastecimiento
   FROM stock_calc sc
     JOIN cat_productos_variantes p ON sc.id_sku = p.id_sku;


-- Recrear las dependencias de vw_dashboard_stock_realtime
CREATE OR REPLACE VIEW public.vw_kpi_stock_zombie WITH(security_invoker=true) AS 
WITH movimientos_recientes AS (SELECT DISTINCT trx_movimientos.id_sku FROM trx_movimientos WHERE (trx_movimientos.tipo_movimiento = ANY (ARRAY['VENTA'::text, 'SALIDA'::text, 'PRODUCCION'::text])) AND trx_movimientos.fecha_hora >= (now() - '90 days'::interval))
SELECT s.id_sku, p.nombre_completo, p.unidad_medida, s.stock_actual, s.costo_pmp AS costo_unitario, s.stock_actual * s.costo_pmp AS valor_estancado, max(m.fecha_hora) AS ultima_salida_registrada FROM vw_dashboard_stock_realtime s JOIN cat_productos_variantes p ON s.id_sku = p.id_sku LEFT JOIN trx_movimientos m ON s.id_sku = m.id_sku AND (m.tipo_movimiento = ANY (ARRAY['VENTA'::text, 'SALIDA'::text, 'PRODUCCION'::text])) WHERE s.stock_actual > 0::numeric AND NOT (s.id_sku IN ( SELECT movimientos_recientes.id_sku FROM movimientos_recientes)) GROUP BY s.id_sku, p.nombre_completo, p.unidad_medida, s.stock_actual, s.costo_pmp ORDER BY (s.stock_actual * s.costo_pmp) DESC;

CREATE OR REPLACE VIEW public.vw_kpi_valorizacion WITH(security_invoker=true) AS SELECT count(*) AS total_skus, sum(valor_total_pen) AS valor_inventario_pen, sum(valor_total_pen) / (( SELECT COALESCE(mst_config_general.tipo_cambio_referencial, 3.75) AS "coalesce" FROM mst_config_general LIMIT 1)) AS valor_inventario_usd, sum(CASE WHEN estado_abastecimiento = 'CRITICO'::text THEN 1 ELSE 0 END) AS skus_criticos, sum(CASE WHEN estado_abastecimiento = 'ALERTA'::text THEN 1 ELSE 0 END) AS skus_alerta FROM vw_dashboard_stock_realtime;


-- 6c. mvw_stock_realtime
DROP MATERIALIZED VIEW IF EXISTS public.mvw_stock_realtime CASCADE;

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
    p.id_almacen, -- NUEVO CAMPO
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
    m_alm.nombre_almacen, -- NUEVO CAMPO
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
    COALESCE(p.punto_pedido, 0::numeric) AS punto_pedido
   FROM cat_productos_variantes p
     LEFT JOIN trx_movimientos tm ON p.id_sku = tm.id_sku
     LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla
     LEFT JOIN mst_series_equivalencias m_sis ON pl.id_sistema = m_sis.id_sistema
     LEFT JOIN mst_familias m_fam ON pl.id_familia = m_fam.id_familia
     LEFT JOIN mst_marcas m_mar ON p.id_marca = m_mar.id_marca
     LEFT JOIN mst_materiales m_mat ON p.id_material = m_mat.id_material
     LEFT JOIN mst_acabados_colores m_acab ON p.id_acabado = m_acab.id_acabado
     LEFT JOIN mst_almacenes m_alm ON p.id_almacen = m_alm.id_almacen -- NUEVO JOIN
  GROUP BY p.id_sku, p.nombre_completo, p.unidad_medida, p.cod_proveedor, p.costo_mercado_unit, p.moneda_reposicion, p.id_marca, p.id_material, p.id_acabado, p.id_almacen, pl.id_familia, pl.id_sistema, pl.largo_estandar_mm, pl.peso_teorico_kg, pl.imagen_ref, m_sis.nombre_comercial, m_sis.cod_corrales, m_sis.cod_eduholding, m_sis.cod_hpd, m_sis.cod_limatambo, m_sis.uso_principal, m_fam.nombre_familia, m_mar.nombre_marca, m_mat.nombre_material, m_acab.nombre_acabado, m_alm.nombre_almacen, p.stock_minimo, p.punto_pedido
WITH DATA;

CREATE INDEX idx_mvw_stock_nombre ON public.mvw_stock_realtime USING btree (nombre_completo);
CREATE INDEX idx_mvw_stock_orden ON public.mvw_stock_realtime USING btree (orden_prioridad, id_sku);
CREATE UNIQUE INDEX idx_mvw_stock_realtime_id_sku ON public.mvw_stock_realtime USING btree (id_sku);
