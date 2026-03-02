export type EjeCruce = "X" | "Y";

/**
 * Tabla: tipologias
 * Contenedor maestro del vano paramétrico
 */
export interface Tipologia {
    id: string; // UUID
    pedido_id: string; // FK a trx_cotizaciones_cabecera
    descripcion: string | null;
    ancho_total_mm: number;
    alto_total_mm: number;
    cantidad: number;
    created_at?: string;
    updated_at?: string;

    // Virtual properties para frontend Zustand store (relaciones cargadas)
    cruces?: TipologiaCruce[];
    items?: TipologiaItem[];
}

/**
 * Tabla: tipologias_cruces
 * Divisiones físicas del vano (Mullions y Transoms)
 */
export interface TipologiaCruce {
    id: string; // UUID
    tipologia_id: string; // FK a tipologias
    tipo_eje: EjeCruce; // 'X' para cortes verticales, 'Y' para cortes horizontales
    distancia_desde_origen_mm: number; // Distancia desde top o left (0)
    espesor_perfil_mm: number; // Grosor físico de la división
    created_at?: string;
    updated_at?: string;
}

/**
 * Tabla: tipologias_items
 * Asignación de productos dentro del grid formado por los cruces
 */
export interface TipologiaItem {
    id: string; // UUID
    tipologia_id: string; // FK a tipologias
    producto_id: string | null; // FK a cat_productos_variantes (Receta seleccionada)

    // Posicionamiento en el grid (1-based index similar a CSS Grid)
    grid_col_start: number;
    grid_row_start: number;
    grid_col_span: number;
    grid_row_span: number;

    // Propiedades internas del item (Especialmente para Fijos/Sobreluces)
    cruces_verticales?: number;
    cruces_horizontales?: number;

    // Propiedades dinámicas de apertura (Fijos, Corredizas)
    tipo_apertura?: string; // (Referencia)
    tipo_dibujo?: string; // Corrediza, Proyectante, Batiente, Fijo, Fijo_Sin_Marco
    configuracion_hojas?: string; // CC, FCCF, FCF...

    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// Tipos auxiliares para el Frontend y cálculo matemático
// ============================================================================

/**
 * Representa una celda calculada y sus dimensiones netas
 * Usado por el NetDimensionResolver
 */
export interface CalculatedGridCell {
    colIndex: number; // 1-based
    rowIndex: number; // 1-based
    x_start_mm: number; // Coordenada X real absoluta
    y_start_mm: number; // Coordenada Y real absoluta
    width_bruto_mm: number; // Ancho sin descontar cruces
    height_bruto_mm: number; // Alto sin descontar cruces
    width_neto_mm: number; // Ancho descontando la mitad de espesor de los cruces perimetrales
    height_neto_mm: number; // Alto descontando la mitad de espesor de los cruces perimetrales
}

export interface DragItemPayload {
    producto_id: string; // ID real del producto (mst_recetas_modelos)
    nombre_producto: string; // Nombre comercial
    tipo_apertura?: string; // (Legacy/Referencia)
    tipo_dibujo?: string; // Corrediza, Proyectante, Batiente, Fijo, Fijo_Sin_Marco
    config_hojas_default?: string; // CC, P, A, F
}
