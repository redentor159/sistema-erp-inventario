/**
 * Tipos TypeScript para el módulo de Cotizaciones
 * 
 * Este archivo define tipos completos para:
 * - Cotizaciones cabecera (trx_cotizaciones_cabecera)
 * - Cotizaciones detalle (trx_cotizaciones_detalle)
 * - Desglose de materiales (trx_desglose_materiales)
 * - Vistas calculadas (vw_cotizaciones_totales, vw_cotizaciones_detalladas)
 */

import type { MstCliente, MstMarca } from './index'

// ============================================================================
// TIPOS BASE (Tablas)
// ============================================================================

/**
 * Cabecera de cotización (tabla base)
 */
export interface TrxCotizacionCabecera {
    id_cotizacion: string
    fecha_emision: string
    estado: string
    id_cliente: string
    id_marca?: string | null
    nombre_proyecto: string
    moneda: string
    validez_dias: number
    plazo_entrega?: string | null
    condicion_pago?: string | null
    markup_aplicado?: number | null
    incluye_igv: boolean
    aplica_detraccion?: boolean | null
    costo_mano_obra_m2?: number | null
    costo_global_instalacion?: number | null
    costo_fijo_instalacion?: number | null
    total_costo_directo?: number | null
    total_precio_venta?: number | null
    observaciones?: string | null
    link_pdf?: string | null
}

/**
 * Detalle de cotización - línea individual (ventana/item)
 */
export interface TrxCotizacionDetalle {
    id_linea_cot: string
    id_cotizacion: string
    id_modelo?: string | null
    color_perfiles?: string | null
    cantidad: number
    ancho_mm?: number | null
    alto_mm?: number | null
    etiqueta_item?: string | null
    ubicacion?: string | null
    tipo_cierre?: string | null
    tipo_vidrio?: string | null
    grupo_opcion?: string | null
    costo_base_ref?: number | null
    subtotal_linea?: number | null
}

/**
 * Desglose de materiales (despiece automático)
 */
export interface TrxDesgloseMateriales {
    id_desglose: string
    id_linea_cot: string
    tipo_componente: 'Perfil' | 'Vidrio' | 'Accesorio' | 'Servicio'
    codigo_base?: string | null
    nombre_componente?: string | null
    detalle_acabado?: string | null
    medida_corte_mm?: number | null
    angulo_corte?: number | null
    cantidad_calculada?: number | null
    sku_real?: string | null
    costo_total_item?: number | null
    precio_venta_item?: number | null
}

// ============================================================================
// TIPOS ENRIQUECIDOS (Vistas con Cálculos)
// ============================================================================

/**
 * Detalle de cotización enriquecido con cálculos de la vista
 * (vw_cotizaciones_detalladas)
 */
export interface CotizacionDetalleEnriquecido extends TrxCotizacionDetalle {
    // Campos calculados de la vista
    _costo_materiales: number
    _vc_precio_unit_oferta_calc: number
    _vc_subtotal_linea_calc: number
}

/**
 * Cotización completa con totales calculados y relaciones
 * (vw_cotizaciones_totales + joins)
 */
export interface CotizacionDetallada extends TrxCotizacionCabecera {
    // Relaciones con tablas maestras
    mst_clientes?: MstCliente | null

    // Campos calculados de la vista vw_cotizaciones_totales
    _vc_total_costo_materiales: number
    _vc_subtotal_venta: number
    _vc_monto_igv: number
    _vc_precio_final_cliente: number

    // Detalles anidados
    detalles?: CotizacionDetalleEnriquecido[]
}

// ============================================================================
// TIPOS PARA RESPONSES DE API
// ============================================================================

/**
 * Response típica de getCotizacionById
 */
export interface CotizacionByIdResponse extends CotizacionDetallada {
    detalles: CotizacionDetalleEnriquecido[]
    mst_clientes: MstCliente
}

/**
 * Item de lista de cotizaciones
 */
export interface CotizacionListItem {
    id_cotizacion: string
    fecha_emision: string
    estado: string
    nombre_proyecto: string
    moneda: string
    _vc_precio_final_cliente: number
    mst_clientes?: {
        nombre_completo: string
    } | null
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Datos para el diálogo de agregar item
 */
export interface NewCotizacionItemData {
    id_modelo?: string
    color_perfiles?: string
    cantidad: number
    ancho_mm?: number
    alto_mm?: number
    tipo_vidrio?: string
    tipo_cierre?: string
    etiqueta_item?: string
    ubicacion?: string
}

/**
 * Datos para crear nueva cotización (cabecera)
 */
export interface NewCotizacionData {
    id_cliente: string
    nombre_proyecto: string
    id_marca?: string
    moneda?: 'PEN' | 'USD'
}

/**
 * Updates permitidos en bulk para items
 */
export interface BulkItemUpdates {
    color_perfiles?: string
    tipo_vidrio?: string
    tipo_cierre?: string
}
