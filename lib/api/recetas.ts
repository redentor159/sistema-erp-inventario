
import { supabase } from "@/lib/supabase/client"

// ═══════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════

export interface RecetaModelo {
    id_modelo: string
    id_sistema: string | null
    nombre_comercial: string
    num_hojas: number
    descripcion: string | null
    activo: boolean
    created_at?: string
    // join
    mst_series_equivalencias?: { nombre_comercial: string } | null
}

export interface RecetaLinea {
    id_receta: string
    id_modelo: string
    id_sistema: string | null
    id_plantilla: string | null
    id_material_receta: string | null
    id_acabado_receta: string | null
    id_marca_receta: string | null
    id_sku_catalogo: string | null
    nombre_componente: string
    tipo: 'Perfil' | 'Accesorio' | 'Vidrio' | 'Servicio'
    cantidad_base: number | null
    factor_cantidad_ancho: number | null
    factor_cantidad_alto: number | null
    factor_cantidad_area: number | null
    factor_corte_ancho: number | null
    factor_corte_alto: number | null
    constante_corte_mm: number | null
    angulo: number | null
    condicion: string | null
    // New formula columns
    formula_cantidad: string | null
    formula_perfil: string | null
    seccion: string
    orden_visual: number
    precio_unitario_manual: number | null
    // join
    cat_plantillas?: { nombre_generico: string, id_familia: string | null } | null
}

export interface RecetaLineaForm {
    id_receta: string
    id_modelo: string
    id_sistema?: string | null
    id_plantilla?: string | null
    id_material_receta?: string | null
    id_acabado_receta?: string | null
    id_marca_receta?: string | null
    id_sku_catalogo?: string | null
    nombre_componente: string
    tipo: 'Perfil' | 'Accesorio' | 'Vidrio' | 'Servicio'
    cantidad_base?: number | null
    factor_cantidad_ancho?: number | null
    factor_cantidad_alto?: number | null
    factor_cantidad_area?: number | null
    factor_corte_ancho?: number | null
    factor_corte_alto?: number | null
    constante_corte_mm?: number | null
    angulo?: number | null
    condicion?: string | null
    formula_cantidad?: string | null
    formula_perfil?: string | null
    seccion: string
    orden_visual?: number
    precio_unitario_manual?: number | null
}


// ═══════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════

export const recetasApi = {

    // ─── MODELOS ───────────────────────────────────────────────────

    getModelos: async (): Promise<RecetaModelo[]> => {
        const { data, error } = await supabase
            .from('mst_recetas_modelos')
            .select(`
        *,
        mst_series_equivalencias (nombre_comercial)
      `)
            .eq('activo', true)
            .order('id_sistema')
            .order('nombre_comercial')

        if (error) throw error
        return data || []
    },

    getModeloById: async (id_modelo: string): Promise<RecetaModelo | null> => {
        const { data, error } = await supabase
            .from('mst_recetas_modelos')
            .select(`
        *,
        mst_series_equivalencias (nombre_comercial)
      `)
            .eq('id_modelo', id_modelo)
            .single()

        if (error) throw error
        return data
    },

    createModelo: async (modelo: Omit<RecetaModelo, 'created_at' | 'mst_series_equivalencias'>): Promise<RecetaModelo> => {
        const { data, error } = await supabase
            .from('mst_recetas_modelos')
            .insert(modelo)
            .select()
            .single()

        if (error) throw error
        return data
    },

    updateModelo: async (id_modelo: string, updates: Partial<RecetaModelo>): Promise<RecetaModelo> => {
        const { mst_series_equivalencias: _, created_at: __, ...clean } = updates as any
        const { data, error } = await supabase
            .from('mst_recetas_modelos')
            .update(clean)
            .eq('id_modelo', id_modelo)
            .select()
            .single()

        if (error) throw error
        return data
    },

    deleteModelo: async (id_modelo: string): Promise<void> => {
        // First delete all recipe lines for this model
        const { error: recetasError } = await supabase
            .from('mst_recetas_ingenieria')
            .delete()
            .eq('id_modelo', id_modelo)

        if (recetasError) throw recetasError

        // Then delete the model itself
        const { error } = await supabase
            .from('mst_recetas_modelos')
            .delete()
            .eq('id_modelo', id_modelo)

        if (error) throw error
    },

    clonarModelo: async (id_modelo: string, nuevo_id: string, nuevo_nombre: string): Promise<RecetaModelo> => {
        // 1. Get original model
        const original = await recetasApi.getModeloById(id_modelo)
        if (!original) throw new Error('Modelo original no encontrado')

        // 2. Create new model
        const nuevoModelo = await recetasApi.createModelo({
            id_modelo: nuevo_id,
            id_sistema: original.id_sistema,
            nombre_comercial: nuevo_nombre,
            num_hojas: original.num_hojas,
            descripcion: `Copia de ${original.nombre_comercial}`,
            activo: true,
        })

        // 3. Get original recipe lines
        const recetas = await recetasApi.getRecetasByModelo(id_modelo)

        // 4. Clone each line
        for (const r of recetas) {
            const newId = `${nuevo_id}-${r.id_plantilla || 'X'}-${Date.now()}`
            await recetasApi.createRecetaLinea({
                id_receta: newId,
                id_modelo: nuevo_id,
                id_sistema: r.id_sistema,
                id_plantilla: r.id_plantilla,
                id_material_receta: r.id_material_receta,
                nombre_componente: r.nombre_componente,
                tipo: r.tipo,
                cantidad_base: r.cantidad_base,
                angulo: r.angulo,
                condicion: r.condicion,
                formula_cantidad: r.formula_cantidad,
                formula_perfil: r.formula_perfil,
                seccion: r.seccion,
                orden_visual: r.orden_visual,
                precio_unitario_manual: r.precio_unitario_manual,
            })
        }

        return nuevoModelo
    },

    // ─── RECETAS (LÍNEAS) ─────────────────────────────────────────

    getRecetasByModelo: async (id_modelo: string): Promise<RecetaLinea[]> => {
        const { data, error } = await supabase
            .from('mst_recetas_ingenieria')
            .select(`
        *,
        cat_plantillas (nombre_generico, id_familia)
      `)
            .eq('id_modelo', id_modelo)
            .order('seccion')
            .order('orden_visual')
            .order('nombre_componente')

        if (error) throw error
        return data || []
    },

    createRecetaLinea: async (linea: RecetaLineaForm): Promise<RecetaLinea> => {
        const { data, error } = await supabase
            .from('mst_recetas_ingenieria')
            .insert(linea)
            .select()
            .single()

        if (error) throw error
        return data
    },

    updateRecetaLinea: async (id_receta: string, updates: Partial<RecetaLineaForm>): Promise<RecetaLinea> => {
        const { cat_plantillas: _, ...clean } = updates as any
        const { data, error } = await supabase
            .from('mst_recetas_ingenieria')
            .update(clean)
            .eq('id_receta', id_receta)
            .select()
            .single()

        if (error) throw error
        return data
    },

    deleteRecetaLinea: async (id_receta: string): Promise<void> => {
        const { error } = await supabase
            .from('mst_recetas_ingenieria')
            .delete()
            .eq('id_receta', id_receta)

        if (error) throw error
    },

    /**
     * Gets ALL recipes across the system with model metadata and catalog pricing.
     * Used for the global Recipe Mass Audit dashboard.
     */
    getAllRecetasConCatalogInfo: async (): Promise<any[]> => {
        // 1. Fetch all recipes with model info and plantillas
        const { data: recetas, error } = await supabase
            .from('mst_recetas_ingenieria')
            .select(`
                *,
                mst_recetas_modelos (nombre_comercial, id_sistema, num_hojas, activo),
                cat_plantillas (nombre_generico)
            `)
            .order('id_modelo')

        if (error) throw error
        if (!recetas || recetas.length === 0) return []

        // 2. Fetch all variants to map prices
        const { data: variantes, error: varError } = await supabase
            .from('cat_productos_variantes')
            .select('id_sku, costo_mercado_unit')

        if (varError) throw varError

        const variantMap = new Map(variantes?.map(v => [v.id_sku, v.costo_mercado_unit]))

        return recetas.map(r => ({
            ...r,
            modelo_nombre: r.mst_recetas_modelos?.nombre_comercial,
            modelo_activo: r.mst_recetas_modelos?.activo,
            precio_catalogo: r.id_sku_catalogo ? variantMap.get(r.id_sku_catalogo) : null
        }))
    },

    // ─── PRECIOS ACCESORIOS ───────────────────────────────────────

    /**
     * Gets accessories for a model with their catalog prices
     */
    getAccesoriosConPrecio: async (id_modelo: string): Promise<any[]> => {
        // Get accessory recipe lines
        const { data: recetas, error: recetasError } = await supabase
            .from('mst_recetas_ingenieria')
            .select(`
        id_receta,
        nombre_componente,
        id_plantilla,
        formula_cantidad,
        precio_unitario_manual,
        cat_plantillas (nombre_generico)
      `)
            .eq('id_modelo', id_modelo)
            .in('tipo', ['Accesorio', 'Servicio'])

        if (recetasError) throw recetasError
        if (!recetas || recetas.length === 0) return []

        // Get catalog prices for the plantillas used
        const plantillaIds = recetas
            .map(r => r.id_plantilla)
            .filter(Boolean) as string[]

        if (plantillaIds.length === 0) return recetas

        const { data: variantes, error: varError } = await supabase
            .from('cat_productos_variantes')
            .select('id_sku, id_plantilla, nombre_completo, costo_mercado_unit, moneda_costo, fecha_act_precio')
            .in('id_plantilla', plantillaIds)
            .eq('id_material', 'GEN')

        if (varError) throw varError

        // Merge data
        return recetas.map(r => {
            const variante = variantes?.find(v => v.id_plantilla === r.id_plantilla)
            return {
                ...r,
                sku_catalogo: variante?.id_sku || null,
                nombre_producto: variante?.nombre_completo || null,
                precio_catalogo: variante?.costo_mercado_unit || null,
                moneda_precio: variante?.moneda_costo || 'PEN',
                fecha_precio: variante?.fecha_act_precio || null,
            }
        })
    },

    updatePrecioAccesorio: async (id_sku: string, precio: number): Promise<void> => {
        const { error } = await supabase
            .from('cat_productos_variantes')
            .update({
                costo_mercado_unit: precio,
                fecha_act_precio: new Date().toISOString()
            })
            .eq('id_sku', id_sku)

        if (error) throw error
    },

    // ─── DATOS AUXILIARES ─────────────────────────────────────────

    getPlantillas: async () => {
        const { data, error } = await supabase
            .from('cat_plantillas')
            .select('id_plantilla, nombre_generico, id_familia')
            .order('nombre_generico')

        if (error) throw error
        return data || []
    },

    getSistemas: async () => {
        const { data, error } = await supabase
            .from('mst_series_equivalencias')
            .select('id_sistema, nombre_comercial')
            .order('nombre_comercial')

        if (error) throw error
        return data || []
    },

    // Fetch all product variants for accessory SKU selector
    getVariantesAccesorios: async () => {
        const { data, error } = await supabase
            .from('cat_productos_variantes')
            .select('id_sku, id_plantilla, id_material, nombre_completo, costo_mercado_unit, moneda_costo')
            .order('id_sku')

        if (error) throw error
        return data || []
    },

    // ─── BÚSQUEDA DE PRODUCTOS (copia independiente, NO modifica catApi) ───

    /**
     * Server-side search against vw_stock_realtime.
     * Independent copy of catApi.getProductos — used exclusively by recipe editor.
     */
    buscarProductosCatalogo: async (search: string = '', pageSize: number = 50) => {
        let query = supabase
            .from('vw_stock_realtime')
            .select('*', { count: 'exact' })

        if (search) {
            query = query.or(`id_sku.ilike.%${search}%,nombre_completo.ilike.%${search}%`)
        }

        query = query
            .order('id_sku', { ascending: true })
            .range(0, pageSize - 1)

        const { data, error } = await query

        if (error) throw error
        return data || []
    },

    /**
     * Get a single product by exact SKU from vw_stock_realtime.
     * Used to load the selected product name on component mount.
     */
    getProductoPorSku: async (id_sku: string) => {
        const { data, error } = await supabase
            .from('vw_stock_realtime')
            .select('*')
            .eq('id_sku', id_sku)
            .maybeSingle()

        if (error) throw error
        return data
    },

    // ─── OPTIONS (COTIZADOR) ───

    /**
     * Get all recipe lines that are configurable (have grupo_opcion).
     * Used by QuoteForm to show dynamic selectors (e.g. "Tipo de Brazo").
     */
    getRecetasOptions: async () => {
        const { data, error } = await supabase
            .from('mst_recetas_ingenieria')
            .select('*')
            .not('grupo_opcion', 'is', null)
            .order('orden_visual')

        if (error) throw error
        return data || []
    },
}

