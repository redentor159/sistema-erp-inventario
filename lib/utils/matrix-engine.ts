import type { Tipologia, TipologiaCruce, TipologiaItem } from '@/types/tipologias';

export interface GridCell {
    col: number; // 1-indexed
    row: number; // 1-indexed
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
    width: number;
    height: number;
}

export interface GridMatrix {
    colsCount: number;
    rowsCount: number;
    cells: GridCell[][]; // cells[row-1][col-1]
    occupancy: (string | null)[][]; // occupancy[row-1][col-1] = itemId or null
}

/**
 * Genera la matriz espacial y el mapa de ocupación basado en la Tipología, Cruces e Ítems.
 */
export function calculateGridMatrix(
    tipologia: Tipologia | null,
    cruces: TipologiaCruce[],
    items: TipologiaItem[]
): GridMatrix {
    if (!tipologia) {
        return { colsCount: 0, rowsCount: 0, cells: [], occupancy: [] };
    }

    // 1. Obtener ejes ordenados (Cotas absolutas desde 0)
    // Agregamos los bordes (0 y Ancho/Alto Total)
    const xPositions = [0];
    cruces
        .filter(c => c.tipo_eje === 'X')
        .sort((a, b) => a.distancia_desde_origen_mm - b.distancia_desde_origen_mm)
        .forEach(c => {
            if (c.distancia_desde_origen_mm > 0 && c.distancia_desde_origen_mm < tipologia.ancho_total_mm) {
                xPositions.push(c.distancia_desde_origen_mm);
            }
        });
    xPositions.push(tipologia.ancho_total_mm);

    const yPositions = [0];
    cruces
        .filter(c => c.tipo_eje === 'Y')
        .sort((a, b) => a.distancia_desde_origen_mm - b.distancia_desde_origen_mm)
        .forEach(c => {
            if (c.distancia_desde_origen_mm > 0 && c.distancia_desde_origen_mm < tipologia.alto_total_mm) {
                yPositions.push(c.distancia_desde_origen_mm);
            }
        });
    yPositions.push(tipologia.alto_total_mm);

    const colsCount = xPositions.length - 1;
    const rowsCount = yPositions.length - 1;

    // 2. Construir matriz de celdas físicas
    const cells: GridCell[][] = [];
    for (let r = 0; r < rowsCount; r++) {
        const rowCells: GridCell[] = [];
        for (let c = 0; c < colsCount; c++) {
            rowCells.push({
                col: c + 1,
                row: r + 1,
                xStart: xPositions[c],
                xEnd: xPositions[c + 1],
                yStart: yPositions[r],
                yEnd: yPositions[r + 1],
                width: xPositions[c + 1] - xPositions[c],
                height: yPositions[r + 1] - yPositions[r],
            });
        }
        cells.push(rowCells);
    }

    // 3. Construir matriz de ocupación
    const occupancy: (string | null)[][] = Array.from({ length: rowsCount }, () =>
        Array.from({ length: colsCount }, () => null)
    );

    items.forEach(item => {
        const startRow = item.grid_row_start - 1;
        const startCol = item.grid_col_start - 1;
        const endRow = startRow + (item.grid_row_span || 1);
        const endCol = startCol + (item.grid_col_span || 1);

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (r >= 0 && r < rowsCount && c >= 0 && c < colsCount) {
                    occupancy[r][c] = item.id;
                }
            }
        }
    });

    return { colsCount, rowsCount, cells, occupancy };
}

/**
 * Valida si un ítem se puede colocar o expandir en la matriz dada.
 * Retorna true si el espacio está libre (o si solo está ocupado por el mismo item).
 */
export function validateItemPlacement(
    matrix: GridMatrix,
    colStart: number,
    rowStart: number,
    colSpan: number,
    rowSpan: number,
    ignoreItemId?: string
): boolean {
    const endRow = rowStart - 1 + rowSpan;
    const endCol = colStart - 1 + colSpan;

    // Out of bounds
    if (colStart < 1 || rowStart < 1 || endCol > matrix.colsCount || endRow > matrix.rowsCount) {
        return false;
    }

    // Collisions
    for (let r = rowStart - 1; r < endRow; r++) {
        for (let c = colStart - 1; c < endCol; c++) {
            const occupant = matrix.occupancy[r][c];
            if (occupant !== null && occupant !== ignoreItemId) {
                return false;
            }
        }
    }

    return true;
}
