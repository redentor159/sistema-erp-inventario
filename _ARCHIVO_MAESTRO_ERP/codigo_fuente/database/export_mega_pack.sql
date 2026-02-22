-- MEGA EXPORT PACK
-- Views designed for maximum granularity in Excel Reports

-- 1. DETAILED MATERIALS BREAKDOWN (Despliegue de Materiales)
-- Connects: Quote -> Line Item -> Material Breakdown
-- Usage: "Ventas" Excel -> Sheet "Explosión de Insumos"
CREATE OR REPLACE VIEW public.vw_reporte_desglose
WITH(security_invoker=true)
AS SELECT 
    -- Context
    c.id_cotizacion,
    c.fecha_emision,
    c.estado,
    c.nombre_proyecto,
    cli.nombre_completo as cliente,
    
    -- Line Item
    d.etiqueta_item,
    d.id_modelo,
    d.ubicacion,
    d.cantidad as cantidad_items,
    
    -- Material (The Breakdown)
    m.tipo_componente,
    m.nombre_componente,
    m.sku_real,
    prod.nombre_completo as descripcion_sku,
    m.detalle_acabado,
    m.medida_corte_mm,
    m.angulo_corte,
    m.cantidad_calculada as cantidad_insumo_total, -- (Qty Item * Base Qty)
    m.costo_total_item,
    
    -- Unit Cost for verification
    prod.unidad_medida,
    prod.costo_mercado_unit
    
   FROM trx_desglose_materiales m
     JOIN trx_cotizaciones_detalle d ON m.id_linea_cot = d.id_linea_cot
     JOIN trx_cotizaciones_cabecera c ON d.id_cotizacion = c.id_cotizacion
     LEFT JOIN mst_clientes cli ON c.id_cliente = cli.id_cliente
     LEFT JOIN cat_productos_variantes prod ON m.sku_real = prod.id_sku;


-- 2. OFFCUTS REPORT (Retazos)
-- Usage: "Inventario" Excel -> Sheet "Retazos Disponibles"
CREATE OR REPLACE VIEW public.vw_reporte_retazos
WITH(security_invoker=true)
AS SELECT 
    r.id_retazo,
    r.fecha_creacion,
    r.estado,
    r.ubicacion,
    r.longitud_mm,
    r.orden_trabajo,
    
    -- Parent SKU Logic
    r.id_sku_padre,
    p.nombre_completo as nombre_perfil,
    p.id_marca,
    p.id_acabado,
    p.costo_mercado_unit,
    
    -- Valuation (Estimated based on ratio of length vs standard length 6000mm)
    -- Assuming standard length 6000mm for profiles if not found in plantilla
    ROUND(
        (r.longitud_mm / COALESCE(NULLIF(pl.largo_estandar_mm, 0), 6000)) * COALESCE(p.costo_mercado_unit, 0), 
        2
    ) as valor_recuperable_estimado
    
   FROM dat_retazos_disponibles r
     JOIN cat_productos_variantes p ON r.id_sku_padre = p.id_sku
     LEFT JOIN cat_plantillas pl ON p.id_plantilla = pl.id_plantilla;


-- 3. KANBAN HISTORY REPORT
-- Usage: "Producción" Excel (New?) or "Ventas" Sheet 
CREATE OR REPLACE VIEW public.vw_reporte_produccion
WITH(security_invoker=true)
AS SELECT 
    h.history_id::text as id_registro,
    h.completion_date as fecha_termino,
    h.final_status as estado_final,
    'HISTORICO' as origen,
    h.client_name,
    h.product_name,
    h.brand,
    h.color,
    h.width_mm,
    h.height_mm,
    h.delivery_date
   FROM trx_kanban_history h
UNION ALL
   SELECT
    o.id as id_registro,
    NULL as fecha_termino,
    o.column_id as estado_actual,
    'EN_PROCESO' as origen,
    o.client_name,
    o.product_name,
    o.brand,
    o.color,
    o.width_mm,
    o.height_mm,
    o.delivery_date
   FROM trx_kanban_orders o;
