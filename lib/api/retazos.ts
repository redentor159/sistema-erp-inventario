import { supabase } from "@/lib/supabase/client"

export type RetazoEstado = 'DISPONIBLE' | 'ASIGNADO' | 'USADO'

export interface Retazo {
    id_retazo: string
    id_sku_padre: string
    longitud_mm: number
    ubicacion: string | null
    fecha_creacion: string
    estado: RetazoEstado
    orden_trabajo: string | null
    fecha_consumo: string | null
    // Joins
    sku_nombre?: string
    sku_medida?: string
}

export const retazosApi = {
    getRetazos: async (filters?: { estado?: string }) => {
        let query = supabase
            .from('dat_retazos_disponibles')
            .select(`
                *,
                cat_productos_variantes (
                    nombre_completo,
                    unidad_medida
                )
            `)
            .order('fecha_creacion', { ascending: false })

        if (filters?.estado && filters.estado !== 'TODOS') {
            query = query.eq('estado', filters.estado)
        }

        const { data, error } = await query
        if (error) throw error

        // Map joined data for easier consumption
        return data.map((item: any) => ({
            ...item,
            sku_nombre: item.cat_productos_variantes?.nombre_completo,
            sku_medida: item.cat_productos_variantes?.unidad_medida
        })) as Retazo[]
    },

    createRetazo: async (retazo: Omit<Retazo, 'id_retazo' | 'fecha_creacion' | 'fecha_consumo' | 'sku_nombre' | 'sku_medida'>) => {
        const { data, error } = await supabase
            .from('dat_retazos_disponibles')
            .insert({
                ...retazo,
                fecha_creacion: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    consumirRetazo: async (id_retazo: string) => {
        const { data, error } = await supabase
            .from('dat_retazos_disponibles')
            .update({
                estado: 'USADO',
                fecha_consumo: new Date().toISOString()
            })
            .eq('id_retazo', id_retazo)
            .select()
            .single()

        if (error) throw error
        return data
    },

    uodateEstado: async (id_retazo: string, estado: RetazoEstado, orden_trabajo?: string) => {
        const { data, error } = await supabase
            .from('dat_retazos_disponibles')
            .update({
                estado,
                orden_trabajo: orden_trabajo || null
            })
            .eq('id_retazo', id_retazo)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
