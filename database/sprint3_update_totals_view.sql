-- =================================================================================================
-- SPRINT 3: Corrección Totales con Costo Fijo
-- Fecha: 2026-02-10
-- Incluye: Actualizar vista vw_cotizaciones_totales para sumar costo_fijo_instalacion exento de IGV (o sujeto, según lógica)
-- Lógica: El usuario dijo "Incluye: Embalaje, Flete...". Generalmente son servicios afectos a IGV si la factura es global.
-- Asumiremos que sigue la misma regla de IGV de la cotización.
-- =================================================================================================

DROP VIEW IF EXISTS vw_cotizaciones_totales;

CREATE VIEW vw_cotizaciones_totales AS
SELECT
    c.id_cotizacion,
    c.fecha_emision,
    c.estado,
    c.id_cliente,
    c.id_marca,
    c.nombre_proyecto,
    c.moneda,
    c.validez_dias,
    c.plazo_entrega,
    c.condicion_pago,
    c.markup_aplicado,
    c.incluye_igv,
    c.aplica_detraccion,
    c.costo_mano_obra_m2,
    c.costo_global_instalacion,
    c.costo_fijo_instalacion,  -- Nuevo campo
    c.total_costo_directo,
    c.total_precio_venta,
    c.observaciones,
    c.link_pdf,
    c.terminos_personalizados,
    c.titulo_documento,
    -- c.created_at, -- No existen en el schema original
    -- c.updated_at, -- No existen en el schema original

    -- Costo Materiales (Suma de Desglose)
    COALESCE((
        SELECT SUM(d._costo_materiales)
        FROM vw_cotizaciones_detalladas d
        WHERE d.id_cotizacion = c.id_cotizacion
    ), 0) as _vc_total_costo_materiales,

    -- Base Imponible (Suma de precios de venta de items + Costo Fijo Instalacion)
    (
        COALESCE((
            SELECT SUM(d._vc_subtotal_linea_calc)
            FROM vw_cotizaciones_detalladas d
            WHERE d.id_cotizacion = c.id_cotizacion
        ), 0) 
        + COALESCE(c.costo_fijo_instalacion, 0)
    ) as _vc_base_imponible,

    -- Monto IGV
    CASE WHEN c.incluye_igv THEN
        (
            COALESCE((
                SELECT SUM(d._vc_subtotal_linea_calc)
                FROM vw_cotizaciones_detalladas d
                WHERE d.id_cotizacion = c.id_cotizacion
            ), 0)
            + COALESCE(c.costo_fijo_instalacion, 0)
        ) * (SELECT igv FROM mst_config_general LIMIT 1)
    ELSE 0 END as _vc_monto_igv,

    -- Precio Final Cliente (Base + IGV si aplica)
    (
        (
            COALESCE((
                SELECT SUM(d._vc_subtotal_linea_calc)
                FROM vw_cotizaciones_detalladas d
                WHERE d.id_cotizacion = c.id_cotizacion
            ), 0)
            + COALESCE(c.costo_fijo_instalacion, 0)
        ) 
        * (CASE WHEN c.incluye_igv THEN (1 + (SELECT igv FROM mst_config_general LIMIT 1)) ELSE 1 END)
    ) as _vc_precio_final_cliente

FROM trx_cotizaciones_cabecera c;
