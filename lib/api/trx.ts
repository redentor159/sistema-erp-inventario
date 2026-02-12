
import { supabase } from "@/lib/supabase/client"
import { EntradaForm, SalidaForm } from "@/lib/validators/trx"

export const trxApi = {
    // --- KARDEX (MOVIMIENTOS) ---
    getMovimientos: async (filters?: { search?: string, tipo?: string, from?: Date, to?: Date, limit?: number, offset?: number }) => {
        let query = supabase
            .from('vw_kardex_reporte')
            .select('*', { count: 'exact' }) // Request count for pagination
            .order('fecha_hora', { ascending: false })
            .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 100) - 1)

        if (filters?.tipo && filters.tipo !== 'TODOS') {
            query = query.eq('tipo_movimiento', filters.tipo)
        }

        if (filters?.search) {
            const s = filters.search
            query = query.or(`id_sku.ilike.%${s}%,producto_nombre.ilike.%${s}%,entidad_nombre.ilike.%${s}%,nro_documento.ilike.%${s}%,comentarios.ilike.%${s}%`)
        }

        const { data, error, count } = await query

        if (error) throw error
        return { data, count } // Return object with data and count
    },

    // Get current stock (simple aggregation)
    // Note: In a real heavy app, this should be a Materialized View or RPC
    getStockActual: async () => {
        // Using a custom RPC would be better, but for now we fetch all logic 
        // OR we assume we can sum quantity grouped by SKU. 
        // Let's rely on a view or just fetching movements for now.
        // Actually, let's fetch 'cat_productos_variantes' and maybe we add a 'stock' logic later.
        // For now, let's just return the movements and calculate locally or create a View.
        return []
    },

    // --- ENTRADAS (COMPRAS) ---
    createEntrada: async (entrada: EntradaForm) => {
        // 1. Create Header
        const { data: header, error: headerError } = await supabase
            .from('trx_entradas_cabecera')
            .insert({
                id_proveedor: entrada.id_proveedor,
                tipo_entrada: entrada.tipo_entrada,
                fecha_registro: entrada.fecha_registro,
                nro_documento_fisico: entrada.nro_documento_fisico,
                moneda: entrada.moneda,
                tipo_cambio: entrada.tipo_cambio,
                comentarios: entrada.comentarios,
                estado: entrada.estado
            })
            .select()
            .single()

        if (headerError) throw headerError
        if (!header) throw new Error("No se pudo crear la cabecera de entrada")

        // 2. Create Details
        const detalles = entrada.detalles.map(d => ({
            id_entrada: header.id_entrada,
            id_sku: d.id_sku,
            cantidad: d.cantidad,
            costo_unitario: d.costo_unitario,
            descuento: d.descuento,
            total_linea: (d.cantidad * d.costo_unitario) - (d.descuento || 0)
        }))

        const { error: detailsError } = await supabase
            .from('trx_entradas_detalle')
            .insert(detalles)

        if (detailsError) throw detailsError

        // The Trigger in DB should auto-insert into trx_movimientos using fn_trigger_entrada_to_kardex

        return header
    },

    getEntradas: async (filters?: { search?: string }) => {
        let query = supabase
            .from('trx_entradas_cabecera')
            .select(`
                *,
                mst_proveedores (razon_social)
            `)
            .order('fecha_registro', { ascending: false })
            .limit(50)

        if (filters?.search) {
            const s = filters.search
            // Filter on nested provider name is hard in one go without flattened view.
            // For now, filter on columns we have directly + explicit relation hint if possible,
            // but standard Supabase .or() with nested tables is tricky.
            // Let's filter on local columns + we might need a view for correct full text search on joined relation.
            // Simplified: Filter by doc number and comments.
            query = query.or(`nro_documento_fisico.ilike.%${s}%,comentarios.ilike.%${s}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    // --- SALIDAS (VENTAS) ---
    createSalida: async (salida: SalidaForm) => {
        // 1. Create Header
        const { data: header, error: headerError } = await supabase
            .from('trx_salidas_cabecera')
            .insert({
                tipo_salida: salida.tipo_salida,
                fecha: salida.fecha,
                id_destinatario: salida.id_cliente,
                comentario: salida.comentario,
                estado: salida.estado
            })
            .select()
            .single()

        if (headerError) throw headerError
        if (!header) throw new Error("No se pudo crear la cabecera de salida")

        // 2. Details
        const detalles = salida.detalles.map(d => ({
            id_salida: header.id_salida,
            id_sku: d.id_sku,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.cantidad * d.precio_unitario
        }))

        const { error: detailsError } = await supabase
            .from('trx_salidas_detalle')
            .insert(detalles)

        if (detailsError) throw detailsError

        // DB Trigger handles Kardex update
        // DB Trigger handles Kardex update
        return header
    },

    getSalidas: async (filters?: { search?: string, fecha?: Date }) => {
        let query = supabase
            .from('trx_salidas_cabecera')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(50)

        if (filters?.search) {
            const s = filters.search
            // Note: id_destinatario might become name if valid, but checking raw values
            query = query.or(`comentario.ilike.%${s}%,id_destinatario.ilike.%${s}%,tipo_salida.ilike.%${s}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    getEntradaDetalles: async (id: string) => {
        const { data, error } = await supabase
            .from('trx_entradas_detalle')
            .select(`
                *,
                cat_productos_variantes (
                    nombre_completo,
                    unidad_medida,
                    cod_proveedor
                )
            `)
            .eq('id_entrada', id)

        if (error) throw error
        return data
    },

    getSalidaDetalles: async (id: string) => {
        const { data, error } = await supabase
            .from('trx_salidas_detalle')
            .select(`
                *,
                cat_productos_variantes (
                    nombre_completo,
                    unidad_medida
                )
            `)
            .eq('id_salida', id)

        if (error) throw error
        return data
    },

    // --- STOCK REALTIME (VISTA) ---
    getStockRealtime: async () => {
        const { data, error } = await supabase
            .from('vw_stock_realtime')
            .select('*')
            .order('nombre_completo')

        if (error) throw error
        return data
    }
}
