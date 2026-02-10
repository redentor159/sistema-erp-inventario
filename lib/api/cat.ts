
import { supabase } from "@/lib/supabase/client"
import { CatPlantilla, CatProductoVariante } from "@/types"
import { PlantillaForm, ProductoVarianteForm } from "@/lib/validators/cat"

export const catApi = {
    // Plantillas
    getPlantillas: async () => {
        const { data, error } = await supabase
            .from('cat_plantillas')
            .select(`
        *,
        mst_familias (nombre_familia),
        mst_series_equivalencias (nombre_comercial)
      `)
            .order('nombre_generico')

        if (error) throw error
        return data
    },

    createPlantilla: async (plantilla: PlantillaForm) => {
        const { data, error } = await supabase
            .from('cat_plantillas')
            .insert(plantilla)
            .select()
            .single()

        if (error) throw error
        return data as CatPlantilla
    },

    // Productos (SKUs)
    getProductos: async ({
        page = 0,
        pageSize = 100,
        search = '',
        familia = 'ALL',
        marca = 'ALL',
        material = 'ALL',
        sistema = 'ALL',
        acabado = 'ALL'
    } = {}) => {
        let query = supabase
            .from('vw_stock_realtime')
            .select('*', { count: 'exact' })

        // 1. Aplicar Filtros Dinámicos
        if (search) {
            // Busqueda por SKU o Nombre
            query = query.or(`id_sku.ilike.%${search}%,nombre_completo.ilike.%${search}%`)
        }

        if (familia !== 'ALL') query = query.eq('nombre_familia', familia)
        if (marca !== 'ALL') query = query.eq('nombre_marca', marca)
        if (material !== 'ALL') query = query.eq('nombre_material', material)
        if (sistema !== 'ALL') query = query.eq('id_sistema', sistema)
        if (acabado !== 'ALL') query = query.eq('nombre_acabado', acabado)

        // 2. Ordenamiento por defecto
        query = query
            .order('orden_prioridad', { ascending: true }) // 1 (Negativo), 2 (Positivo), 3 (Cero)
            .order('id_sku', { ascending: true })

        // 3. Paginación
        const from = page * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query.range(from, to)

        if (error) throw error
        return { data, count }
    },

    createProducto: async (producto: ProductoVarianteForm) => {
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .insert(producto)
            .select()
            .single()

        if (error) throw error
        return data as CatProductoVariante
    },

    updatePrecioMercado: async (id_sku: string, costo_estandar: number) => {
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .update({ costo_estandar })
            .eq('id_sku', id_sku)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Auxiliares
    getFamilias: async () => {
        const { data, error } = await supabase.from('mst_familias').select('*').order('nombre_familia')
        if (error) throw error
        return data
    },

    getMarcas: async () => {
        const { data, error } = await supabase.from('mst_marcas').select('*').order('nombre_marca')
        if (error) throw error
        return data
    },

    getMateriales: async () => {
        const { data, error } = await supabase.from('mst_materiales').select('*').order('nombre_material')
        if (error) throw error
        return data
    },

    getAcabados: async () => {
        const { data, error } = await supabase.from('mst_acabados_colores').select('*').order('nombre_acabado')
        if (error) throw error
        return data
    },

    getSistemas: async () => {
        const { data, error } = await supabase.from('mst_series_equivalencias').select('*').order('nombre_comercial')
        if (error) throw error
        return data
    }
}
