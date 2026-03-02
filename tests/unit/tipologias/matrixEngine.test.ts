import { describe, it, expect } from 'vitest';
import { calculateGridMatrix, isAreaFree } from '@/lib/tipologias/matrixEngine';
import type { Tipologia, TipologiaCruce } from '@/types/tipologias';

describe('Matrix Engine: calculateGridMatrix', () => {
    it('Debe calcular correctamente una tipologia sin cruces (1x1)', () => {
        const tipologia: Tipologia = {
            id: 't-1',
            pedido_id: 'p-1',
            descripcion: 'Ventanita 1x1',
            ancho_total_mm: 1000,
            alto_total_mm: 1000,
            cantidad: 1,
        };

        const cruces: TipologiaCruce[] = [];
        const cells = calculateGridMatrix(tipologia, cruces);

        expect(cells.length).toBe(1);

        const cell = cells[0];
        expect(cell.colIndex).toBe(1);
        expect(cell.rowIndex).toBe(1);
        expect(cell.width_bruto_mm).toBe(1000);
        expect(cell.height_bruto_mm).toBe(1000);
        expect(cell.width_neto_mm).toBe(1000);
        expect(cell.height_neto_mm).toBe(1000);
        expect(cell.x_start_mm).toBe(0);
        expect(cell.y_start_mm).toBe(0);
    });

    it('Debe descontar correctamente el espesor de un Parante central (División en X)', () => {
        const tipologia: Tipologia = {
            id: 't-2',
            pedido_id: 'p-1',
            descripcion: 'Vano con Parante central',
            ancho_total_mm: 2000,
            alto_total_mm: 1500,
            cantidad: 1,
        };

        const cruces: TipologiaCruce[] = [
            {
                id: 'c-1',
                tipologia_id: 't-2',
                tipo_eje: 'X',
                distancia_desde_origen_mm: 1000,
                espesor_perfil_mm: 40,
            }
        ];

        const cells = calculateGridMatrix(tipologia, cruces);

        expect(cells.length).toBe(2);

        const leftCell = cells.find(c => c.colIndex === 1 && c.rowIndex === 1)!;
        expect(leftCell.width_bruto_mm).toBe(1000);
        expect(leftCell.width_neto_mm).toBe(980);
        expect(leftCell.height_neto_mm).toBe(1500);
        expect(leftCell.x_start_mm).toBe(0);

        const rightCell = cells.find(c => c.colIndex === 2 && c.rowIndex === 1)!;
        expect(rightCell.width_bruto_mm).toBe(1000);
        expect(rightCell.width_neto_mm).toBe(980);
        expect(rightCell.height_neto_mm).toBe(1500);
        expect(rightCell.x_start_mm).toBe(1000);
    });

    it('Debe descontar múltiples perfiles en una cuadrícula 2x2', () => {
        const tipologia: Tipologia = {
            id: 't-3',
            pedido_id: 'p-1',
            descripcion: 'Grid 2x2',
            ancho_total_mm: 3000,
            alto_total_mm: 3000,
            cantidad: 1,
        };

        const cruces: TipologiaCruce[] = [
            { id: 'c-x1', tipologia_id: 't-3', tipo_eje: 'X', distancia_desde_origen_mm: 1000, espesor_perfil_mm: 40 },
            { id: 'c-y1', tipologia_id: 't-3', tipo_eje: 'Y', distancia_desde_origen_mm: 2000, espesor_perfil_mm: 60 },
        ];

        const cells = calculateGridMatrix(tipologia, cruces);
        expect(cells.length).toBe(4);

        const topLeft = cells.find(c => c.colIndex === 1 && c.rowIndex === 1)!;
        expect(topLeft.width_neto_mm).toBe(980);
        expect(topLeft.height_neto_mm).toBe(1970);

        const bottomRight = cells.find(c => c.colIndex === 2 && c.rowIndex === 2)!;
        expect(bottomRight.width_neto_mm).toBe(1980);
        expect(bottomRight.height_neto_mm).toBe(970);
    });
});

describe('Matrix Engine: isAreaFree', () => {
    it('Detecta colisión cuando se superponen directamente las coordenadas AABB', () => {
        const existing = [
            { grid_col_start: 1, grid_row_start: 1, grid_col_span: 2, grid_row_span: 1 }
        ];

        const canPlace1 = isAreaFree(existing, 2, 1, 1, 1, 3, 3);
        expect(canPlace1).toBe(false);

        const canPlace2 = isAreaFree(existing, 1, 2, 2, 1, 3, 3);
        expect(canPlace2).toBe(true);

        const canPlace3 = isAreaFree(existing, 2, 0, 1, 3, 3, 3);
        expect(canPlace3).toBe(false);
    });

    it('Bloquea colocar ítems fuera de los bordes del grid (Out of bounds)', () => {
        const canPlace1 = isAreaFree([], 3, 1, 2, 1, 3, 3);
        expect(canPlace1).toBe(false);
    });
});
