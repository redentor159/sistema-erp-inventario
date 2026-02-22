-- Safe SKU Rename Function
-- Handles updating the primary key and ALL foreign key references in a single transaction.
-- Matches cat_productos_variantes schema exactly.

CREATE OR REPLACE FUNCTION public.rename_sku(
    old_sku TEXT,
    new_sku TEXT,
    new_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
        cod_proveedor, nombre_completo, unidad_medida,
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
