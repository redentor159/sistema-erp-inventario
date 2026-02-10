import { supabase } from "@/lib/supabase/client"
import { CotizacionForm } from "@/lib/validators/mto"

export const cotizacionesApi = {
    /**
     * Obtiene todas las cotizaciones con datos de cliente.
     */
    getCotizaciones: async () => {
        // Usamos la vista para traer ya los totales calculados si es posible, 
        // o la tabla base si la vista es muy pesada. Por ahora tabla base + joins.
        // Pero idealmente usariamos vw_cotizaciones_totales para mostrar el "Total" real en la lista.
        const { data, error } = await supabase
            .from('vw_cotizaciones_totales') // Usamos la vista poderosa
            .select(`
                *,
                mst_clientes (nombre_completo)
            `)
            .order('fecha_emision', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Obtiene una cotización específica con sus detalles y desglose.
     */
    getCotizacionById: async (id: string) => {
        const { data: cabecera, error: cabeceraError } = await supabase
            .from('vw_cotizaciones_totales')
            .select(`*, mst_clientes(*)`)
            .eq('id_cotizacion', id)
            .single()

        if (cabeceraError) throw cabeceraError

        const { data: detalles, error: detallesError } = await supabase
            .from('vw_cotizaciones_detalladas')
            .select('*')
            .eq('id_cotizacion', id)

        if (detallesError) throw detallesError

        return { ...cabecera, detalles }
    },

    /**
     * Crea la cabecera de la cotización.
     */
    createCotizacion: async (data: Partial<CotizacionForm>) => {
        const { data: newRow, error } = await supabase
            .from('trx_cotizaciones_cabecera')
            .insert({
                id_cliente: data.id_cliente,
                nombre_proyecto: data.nombre_proyecto,
                id_marca: data.id_marca,
                estado: 'Borrador',
                moneda: data.moneda || 'PEN',
                validez_dias: 15,
                incluye_igv: true
            })
            .select()
            .single()

        console.log('API createCotizacion result:', newRow, error)

        if (error) throw error
        return newRow
    },

    /**
     * Actualiza la cabecera de la cotización.
     */
    updateCotizacion: async (id: string, updates: Partial<any>) => {
        const { data, error } = await supabase
            .from('trx_cotizaciones_cabecera')
            .update(updates)
            .eq('id_cotizacion', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Agrega una linea (Ventana/Ítem) a la cotización.
     */
    addLineItem: async (idCotizacion: string, item: any) => {
        const { data, error } = await supabase
            .from('trx_cotizaciones_detalle')
            .insert({
                id_cotizacion: idCotizacion,
                id_modelo: item.id_modelo,
                color_perfiles: item.color_perfiles,
                cantidad: item.cantidad,
                ancho_mm: item.ancho_mm,
                alto_mm: item.alto_mm,
                tipo_vidrio: item.tipo_vidrio,
                tipo_cierre: item.tipo_cierre,
                etiqueta_item: item.etiqueta_item,
                ubicacion: item.ubicacion
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * EJECUTA LA MAGIA: Dispara el despiece automático en base de datos via RPC.
     */
    triggerDespiece: async (idLineaCot: string) => {
        const { error } = await supabase
            .rpc('fn_generar_despiece_ingenieria', {
                p_id_linea_cot: idLineaCot
            })

        if (error) throw error
        return true
    },

    /**
     * Inserta manualmente un item de desglose (para Servicios o Extras).
     */
    addDesgloseItem: async (item: any) => {
        const { data, error } = await supabase
            .from('trx_desglose_materiales')
            .insert(item)
            .select()
        if (error) throw error
        return data
    },

    /**
     * Obtiene el desglose de materiales para visualización.
     */
    getDesgloseMateriales: async (idLineaCot: string) => {
        const { data, error } = await supabase
            .from('trx_desglose_materiales')
            .select('*')
            .eq('id_linea_cot', idLineaCot)

        if (error) throw error
        return data
    },

    // Auxiliares para el Dialogo de Items
    getSistemas: async () => {
        const { data, error } = await supabase
            .from('mst_series_equivalencias')
            .select('*')
            .order('nombre_comercial')
        if (error) throw error
        return data
    },

    // Fetching Engineering Recipes with system info for filtering
    getRecetasIDs: async () => {
        const { data, error } = await supabase
            .from('mst_recetas_ingenieria')
            .select('id_modelo, id_sistema')

        if (error) throw error

        // De-duplicate by id_modelo, keeping id_sistema
        const uniqueMap = new Map<string, { id_modelo: string, id_sistema: string | null }>()
        data.forEach(d => {
            if (!uniqueMap.has(d.id_modelo)) {
                uniqueMap.set(d.id_modelo, { id_modelo: d.id_modelo, id_sistema: d.id_sistema })
            }
        })
        return Array.from(uniqueMap.values()).sort((a, b) => a.id_modelo.localeCompare(b.id_modelo))
    },

    // Filtrar modelos por sistema seleccionado
    getModelosBySistema: async (idSistema: string) => {
        const { data, error } = await supabase
            .from('mst_recetas_ingenieria')
            .select('id_modelo')
            .eq('id_sistema', idSistema)

        if (error) throw error

        // De-duplicate
        const unique = Array.from(new Set(data.map(d => d.id_modelo))).map(id => ({ id_modelo: id }))
        return unique.sort((a, b) => a.id_modelo.localeCompare(b.id_modelo))
    },

    getModelos: async () => {
        return cotizacionesApi.getRecetasIDs()
    },

    getVidrios: async () => {
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .select(`
                id_sku,
                nombre_completo,
                costo_mercado_unit,
                es_templado,
                espesor_mm,
                cat_plantillas!inner(id_familia)
            `)
            .eq('cat_plantillas.id_familia', 'VID')
            .order('nombre_completo')
        if (error) throw error
        return data
    },

    // Sprint 2 Features
    clonarCotizacion: async (id_cotizacion: string) => {
        const { data, error } = await supabase.rpc('fn_clonar_cotizacion', { p_id_cotizacion: id_cotizacion })
        if (error) throw error
        return data // Returns new ID
    },

    clonarItem: async (id_linea_cot: string) => {
        const { data, error } = await supabase.rpc('fn_clonar_item_cotizacion', { p_id_linea_cot: id_linea_cot })
        if (error) throw error
        return data // Returns new ID
    },

    updateLineItems: async (ids: string[], updates: any) => {
        const { data, error } = await supabase
            .from('trx_cotizaciones_detalle')
            .update(updates)
            .in('id_linea_cot', ids)
            .select()

        if (error) throw error
        return data
    },

    // Master Data
    getAcabados: async () => {
        // Solo retornar colores/acabados que aplican a perfiles de aluminio
        const { data, error } = await supabase
            .from('mst_acabados_colores')
            .select('*')
            .in('id_acabado', ['BLA', 'CHA', 'MAD', 'MAT', 'NEG'])
            .order('nombre_acabado')
        if (error) throw error
        return data
    },

    // Header & Clientes
    getClientes: async () => {
        const { data, error } = await supabase
            .from('mst_clientes')
            .select('*')
            .order('nombre_completo')
        if (error) throw error
        return data
    },

    getMarcas: async () => {
        const { data, error } = await supabase
            .from('mst_marcas')
            .select('*')
            .order('nombre_marca')
        if (error) throw error
        return data
    }
}
