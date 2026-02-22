
import { supabase } from "@/lib/supabase/client"
import { CotizacionForm } from "@/lib/validators/mto"

export const mtoApi = {
    // --- COTIZACIONES ---
    getCotizaciones: async () => {
        const { data, error } = await supabase
            .from('trx_cotizaciones_cabecera')
            .select(`
                *,
                mst_clientes (nombre_completo)
            `)
            .order('fecha_emision', { ascending: false })

        if (error) throw error
        return data
    },

    createCotizacion: async (cotizacion: CotizacionForm) => {
        // 1. Calculate Totals (Simplified logic)
        // In a real app, we would sum up details + add markups
        const totalDirectToSum = cotizacion.detalles.reduce((sum, item) => sum + (item.subtotal_linea || 0), 0)

        // 2. Create Header
        const { data: header, error: headerError } = await supabase
            .from('trx_cotizaciones_cabecera')
            .insert({
                id_cliente: cotizacion.id_cliente,
                nombre_proyecto: cotizacion.nombre_proyecto,
                id_marca: cotizacion.id_marca,
                fecha_emision: cotizacion.fecha_emision,
                moneda: cotizacion.moneda,
                validez_dias: cotizacion.validez_dias,
                plazo_entrega: cotizacion.plazo_entrega,
                condicion_pago: cotizacion.condicion_pago,
                incluye_igv: cotizacion.incluye_igv,
                observaciones: cotizacion.observaciones,
                costo_mano_obra_m2: cotizacion.costo_mano_obra_m2,
                costo_global_instalacion: cotizacion.costo_global_instalacion,
                markup_aplicado: cotizacion.markup_aplicado,
                estado: 'BORRADOR', // Default
                total_precio_venta: totalDirectToSum // Placeholder
            })
            .select()
            .single()

        if (headerError) throw headerError
        if (!header) throw new Error("No se pudo crear la cabecera de cotización")

        // 3. Create Details
        const detalles = cotizacion.detalles.map(d => ({
            id_cotizacion: header.id_cotizacion,
            id_modelo: d.id_modelo,
            color_perfiles: d.color_perfiles,
            cantidad: d.cantidad,
            ancho_mm: d.ancho_mm,
            alto_mm: d.alto_mm,
            etiqueta_item: d.etiqueta_item,
            ubicacion: d.ubicacion,
            tipo_cierre: d.tipo_cierre,
            tipo_vidrio: d.tipo_vidrio,
            subtotal_linea: d.subtotal_linea
        }))

        const { error: detailsError } = await supabase
            .from('trx_cotizaciones_detalle')
            .insert(detalles)

        if (detailsError) throw detailsError

        return header
    }
}
