import type { Tipologia, TipologiaCruce, CalculatedGridCell } from '@/types/tipologias';

/**
 * Motor Matemático de la Cuadrícula Paramétrica
 * Funciones puras para transformar el estado relacional en matrices geométricas.
 */

// Helper interno para representar un corte o "línea guía"
interface CorteGrid {
    posicion_mm: number;
    espesor_mm: number;
}

/**
 * Calcula las filas y columnas resultantes con sus dimensiones netas y brutas.
 */
export function calculateGridMatrix(
    tipologia: Tipologia,
    cruces: TipologiaCruce[]
): CalculatedGridCell[] {
    const { ancho_total_mm, alto_total_mm } = tipologia;

    // 1. Extraer y ordenar cortes verticales (Eje X)
    const cortesX: CorteGrid[] = cruces
        .filter(c => c.tipo_eje === 'X')
        .map(c => ({
            posicion_mm: c.distancia_desde_origen_mm,
            espesor_mm: c.espesor_perfil_mm,
        }))
        .sort((a, b) => a.posicion_mm - b.posicion_mm);

    // 2. Extraer y ordenar cortes horizontales (Eje Y)
    const cortesY: CorteGrid[] = cruces
        .filter(c => c.tipo_eje === 'Y')
        .map(c => ({
            posicion_mm: c.distancia_desde_origen_mm,
            espesor_mm: c.espesor_perfil_mm,
        }))
        .sort((a, b) => a.posicion_mm - b.posicion_mm);

    // 3. Agregar los límites de la tipologia como "cortes virtuales" de espesor 0 (marco exterior)
    const limitesX: CorteGrid[] = [
        { posicion_mm: 0, espesor_mm: 0 },
        ...cortesX,
        { posicion_mm: ancho_total_mm, espesor_mm: 0 },
    ];

    const limitesY: CorteGrid[] = [
        { posicion_mm: 0, espesor_mm: 0 },
        ...cortesY,
        { posicion_mm: alto_total_mm, espesor_mm: 0 },
    ];

    const cells: CalculatedGridCell[] = [];

    // 4. Iterar sobre las franjas para crear la matriz de celdas
    for (let r = 0; r < limitesY.length - 1; r++) {
        const topEdge = limitesY[r];
        const bottomEdge = limitesY[r + 1];

        for (let c = 0; c < limitesX.length - 1; c++) {
            const leftEdge = limitesX[c];
            const rightEdge = limitesX[c + 1];

            const width_bruto = rightEdge.posicion_mm - leftEdge.posicion_mm;
            const height_bruto = bottomEdge.posicion_mm - topEdge.posicion_mm;

            // Descuentos por espesor (La mitad de cada perfil adyacente)
            const descuentoIzquierdo = leftEdge.espesor_mm / 2;
            const descuentoDerecho = rightEdge.espesor_mm / 2;
            const descuentoSuperior = topEdge.espesor_mm / 2;
            const descuentoInferior = bottomEdge.espesor_mm / 2;

            const width_neto = width_bruto - descuentoIzquierdo - descuentoDerecho;
            const height_neto = height_bruto - descuentoSuperior - descuentoInferior;

            cells.push({
                colIndex: c + 1, // 1-based start (CSS Grid format)
                rowIndex: r + 1, // 1-based start
                x_start_mm: leftEdge.posicion_mm,
                y_start_mm: topEdge.posicion_mm,
                width_bruto_mm: width_bruto,
                height_bruto_mm: height_bruto,
                width_neto_mm: width_neto,
                height_neto_mm: height_neto,
            });
        }
    }

    return cells;
}

/**
 * Matriz de ocupación para validación de colisiones (Spanning Ocupancy)
 * Retorna true si un nuevo ítem puede colocarse en la posición dada.
 */
export function isAreaFree(
    existingItems: { grid_col_start: number; grid_row_start: number; grid_col_span: number; grid_row_span: number }[],
    newColStart: number,
    newRowStart: number,
    newColSpan: number,
    newRowSpan: number,
    maxCols: number,
    maxRows: number
): boolean {
    // 1. Validar desbordamiento del Contenedor Maestro
    if (
        newColStart < 1 ||
        newRowStart < 1 ||
        newColStart + newColSpan - 1 > maxCols ||
        newRowStart + newRowSpan - 1 > maxRows
    ) {
        return false; // Se sale de la cuadrícula
    }

    // 2. Revisar Colisiones con ítems existentes
    for (const item of existingItems) {
        const itemColEnd = item.grid_col_start + item.grid_col_span - 1;
        const itemRowEnd = item.grid_row_start + item.grid_row_span - 1;

        const newColEnd = newColStart + newColSpan - 1;
        const newRowEnd = newRowStart + newRowSpan - 1;

        // Lógica 2D AABB Collision Detection ajustada a celdas discretas
        const overlapX = newColStart <= itemColEnd && newColEnd >= item.grid_col_start;
        const overlapY = newRowStart <= itemRowEnd && newRowEnd >= item.grid_row_start;

        if (overlapX && overlapY) {
            return false; // COLISIÓN
        }
    }

    return true;
}

/**
 * Calcula las proporciones de una celda con respecto a la tipologia maestra (0.0 a 1.0)
 * Útil para convertir milímetros a SVG relacional `%` o viewbox relacional.
 */
export function getRelativeCellBounds(
    cell: CalculatedGridCell,
    tipologiaWidth: number,
    tipologiaHeight: number
) {
    return {
        xPct: cell.x_start_mm / tipologiaWidth,
        yPct: cell.y_start_mm / tipologiaHeight,
        widthBrutoPct: cell.width_bruto_mm / tipologiaWidth,
        heightBrutoPct: cell.height_bruto_mm / tipologiaHeight,
    };
}
