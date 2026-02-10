
import { supabase } from "@/lib/supabase/client"
import { CatPlantilla, CatProductoVariante } from "@/types"
import { PlantillaForm, ProductoVarianteForm } from "@/lib/validators/cat"

export const catApi = {
    // ═══════════════════════════════════════════════════
    // PLANTILLAS
    // ═══════════════════════════════════════════════════

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
        // Clean nullable/empty fields
        const clean: Record<string, any> = { ...plantilla }
        if (clean.id_sistema === "" || clean.id_sistema === "null") clean.id_sistema = null
        if (clean.id_familia === "" || clean.id_familia === "null") clean.id_familia = null
        if (clean.imagen_ref === "") clean.imagen_ref = null

        const { data, error } = await supabase
            .from('cat_plantillas')
            .insert(clean)
            .select()
            .single()

        if (error) throw error
        return data as CatPlantilla
    },

    updatePlantilla: async (id_plantilla: string, plantilla: Partial<PlantillaForm>) => {
        // Clean nullable/empty fields
        const { id_plantilla: _id, ...updateData } = plantilla as any
        const clean: Record<string, any> = { ...updateData }
        if (clean.id_sistema === "" || clean.id_sistema === "null") clean.id_sistema = null
        if (clean.id_familia === "" || clean.id_familia === "null") clean.id_familia = null
        if (clean.imagen_ref === "") clean.imagen_ref = null

        const { data, error } = await supabase
            .from('cat_plantillas')
            .update(clean)
            .eq('id_plantilla', id_plantilla)
            .select()
            .single()

        if (error) throw error
        return data as CatPlantilla
    },

    deletePlantilla: async (id_plantilla: string) => {
        const { error } = await supabase
            .from('cat_plantillas')
            .delete()
            .eq('id_plantilla', id_plantilla)

        if (error) throw error
    },

    // ═══════════════════════════════════════════════════
    // PRODUCTOS (SKUs / Variantes)
    // ═══════════════════════════════════════════════════

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

        if (search) {
            query = query.or(`id_sku.ilike.%${search}%,nombre_completo.ilike.%${search}%`)
        }

        if (familia !== 'ALL') query = query.eq('nombre_familia', familia)
        if (marca !== 'ALL') query = query.eq('nombre_marca', marca)
        if (material !== 'ALL') query = query.eq('nombre_material', material)
        if (sistema !== 'ALL') query = query.eq('id_sistema', sistema)
        if (acabado !== 'ALL') query = query.eq('nombre_acabado', acabado)

        query = query
            .order('orden_prioridad', { ascending: true })
            .order('id_sku', { ascending: true })

        const from = page * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query.range(from, to)

        if (error) throw error
        return { data, count }
    },

    /**
     * Fetch a single product by SKU (for editing with ALL columns)
     */
    getProductoBySku: async (id_sku: string) => {
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .select('*')
            .eq('id_sku', id_sku)
            .single()

        if (error) throw error
        return data as CatProductoVariante
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

    updateProducto: async (old_sku: string, producto: Partial<ProductoVarianteForm>) => {
        const new_sku = producto.id_sku || old_sku

        // If SKU changed, use the safe rename RPC
        if (new_sku !== old_sku) {
            const { id_sku, ...updateData } = producto
            const { error } = await supabase.rpc('rename_sku', {
                old_sku,
                new_sku,
                new_data: updateData
            })

            // Fallback if RPC not deployed yet
            if (error && error.code === 'PGRST202') {
                console.warn('RPC rename_sku not found. Attempting direct update.')
                const { data, error: updateError } = await supabase
                    .from('cat_productos_variantes')
                    .update(producto)
                    .eq('id_sku', old_sku)
                    .select()
                    .single()
                if (updateError) throw updateError
                return data as CatProductoVariante
            }

            if (error) throw error

            // Fetch the renamed product
            const { data: newProduct, error: fetchError } = await supabase
                .from('cat_productos_variantes')
                .select('*')
                .eq('id_sku', new_sku)
                .single()
            if (fetchError) throw fetchError
            return newProduct as CatProductoVariante
        }

        // SKU didn't change: normal update (exclude id_sku from payload)
        const { id_sku, ...safeUpdate } = producto
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .update(safeUpdate)
            .eq('id_sku', old_sku)
            .select()
            .single()

        if (error) throw error
        return data as CatProductoVariante
    },

    deleteProducto: async (id_sku: string) => {
        const { error } = await supabase
            .from('cat_productos_variantes')
            .delete()
            .eq('id_sku', id_sku)

        if (error) throw error
    },

    updatePrecioMercado: async (id_sku: string, costo_mercado_unit: number) => {
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .update({ costo_mercado_unit, fecha_act_precio: new Date().toISOString() })
            .eq('id_sku', id_sku)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Bulk update
    updatePreciosMasivos: async (updates: { id_sku: string, costo_mercado_unit: number }[]) => {
        const { data, error } = await supabase
            .rpc('update_costos_mercado_bulk', { payload: updates })

        if (error && error.code === 'PGRST202') {
            console.warn("RPC update_costos_mercado_bulk not found, falling back to iterative update")
            const promises = updates.map(u =>
                supabase
                    .from('cat_productos_variantes')
                    .update({ costo_mercado_unit: u.costo_mercado_unit, fecha_act_precio: new Date().toISOString() })
                    .eq('id_sku', u.id_sku)
            )
            const results = await Promise.all(promises)
            const firstError = results.find(r => r.error)?.error
            if (firstError) throw firstError
            return true
        } else if (error) {
            throw error
        }

        return data
    },

    updatePreciosMasivosClient: async (updates: { id_sku: string, costo_mercado_unit: number }[]) => {
        const promises = updates.map(u =>
            supabase
                .from('cat_productos_variantes')
                .update({ costo_mercado_unit: u.costo_mercado_unit, fecha_act_precio: new Date().toISOString() })
                .eq('id_sku', u.id_sku)
        )
        const results = await Promise.all(promises)
        const firstError = results.find(r => r.error)?.error
        if (firstError) throw firstError
        return true
    },

    // ═══════════════════════════════════════════════════
    // AUXILIARES (Master Tables)
    // ═══════════════════════════════════════════════════

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
