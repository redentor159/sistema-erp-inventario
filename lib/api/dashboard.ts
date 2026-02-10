
import { supabase } from "@/lib/supabase/client"

export interface DashboardValuation {
    total_skus: number
    valor_inventario_pen: number
    valor_inventario_usd: number
    skus_criticos: number
    skus_alerta: number
}

export interface ABCItem {
    id_sku: string
    nombre_completo: string
    valor_salida: number
    pct_participacion: number
    pct_acumulado: number
    clasificacion_abc: 'A' | 'B' | 'C'
}

export interface OTIFData {
    mes: string // ISO Date
    total_pedidos: number
    pedidos_a_tiempo: number
    pct_otif: number
}

export interface StockRealtime {
    id_sku: string
    nombre_completo: string
    unidad_medida: string
    stock_actual: number
    stock_minimo: number
    punto_pedido: number
    estado_abastecimiento: 'OK' | 'ALERTA' | 'CRITICO'
    dias_inventario: number
    costo_pmp: number
    valor_total_pen: number
    id_familia: string
}

export const dashboardApi = {
    getValuation: async (): Promise<DashboardValuation> => {
        const { data, error } = await supabase
            .from('vw_kpi_valorizacion')
            .select('*')
            .single()

        if (error) throw error
        return data
    },

    getABCAnalysis: async (): Promise<ABCItem[]> => {
        const { data, error } = await supabase
            .from('vw_kpi_abc_analisis')
            .select('*')
            .order('pct_acumulado', { ascending: true })
            .limit(100) // Top items usually

        if (error) throw error
        return data
    },

    getOTIF: async (): Promise<OTIFData[]> => {
        const { data, error } = await supabase
            .from('vw_kpi_otif')
            .select('*')
            .order('mes', { ascending: false })
            .limit(12) // Last 12 months

        if (error) throw error
        return data
    },

    getStockRealtime: async (filters?: { estado?: string }): Promise<StockRealtime[]> => {
        let query = supabase
            .from('vw_dashboard_stock_realtime')
            .select('*')
            .order('stock_actual', { ascending: true }) // Lowest stock first especially if critical

        if (filters?.estado) {
            query = query.eq('estado_abastecimiento', filters.estado)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    }
}
