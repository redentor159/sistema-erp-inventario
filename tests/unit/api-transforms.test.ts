import { describe, it, expect } from 'vitest';
import { adaptOrderToLegacy, adaptHistoryToLegacy } from '../../lib/kanban-adapter';

describe('API Transforms - Kanban Adapters', () => {

    describe('adaptOrderToLegacy()', () => {
        it('debe convertir un KanbanOrder de DB a WorkOrder de Frontend (camelCase)', () => {
            const dbOrder = {
                id: 'ord-123',
                column_id: 'col-1',
                position_rank: 1,
                client_name: 'Cliente A',
                product_name: 'Ventana',
                brand: 'Onda',
                color: 'Negro',
                crystal_type: 'Templado',
                width_mm: 1000,
                height_mm: 2000,
                delivery_date: '2023-12-01',
                creation_date: '2023-11-01',
                completion_date: null,
                additional_desc: 'Des',
                rework_count: 0,
                movement_history: [],
                rework_history: []
            } as any;

            const result = adaptOrderToLegacy(dbOrder);

            expect(result.id).toBe('ord-123');
            expect(result.client).toBe('Cliente A');
            expect(result.product).toBe('Ventana');
            expect(result.width).toBe(1000);
            expect(result.deliveryDate).toBe('2023-12-01');
            expect(result.creationDate).toBe('2023-11-01');
        });
    });

    describe('adaptHistoryToLegacy()', () => {
        it('debe convertir un registro histórico de Kanban (KanbanHistoryDB) a formato legacy', () => {
            const dbHistory = {
                history_id: 'hist-1',
                original_order_id: 'ord-123',
                client_name: 'Cliente B',
                product_name: 'Puerta',
                brand: null,
                color: null,
                crystal_type: null,
                width_mm: 500,
                height_mm: 500,
                delivery_date: '2023-12-01',
                creation_date: '2023-11-01',
                completion_date: '2023-12-05',
                final_status: 'Archivado',
                deleted_from_column: 'col-finalizado',
                deletion_date: '2023-12-06',
                rework_history: [{}],
                movement_history: []
            } as any;

            const result = adaptHistoryToLegacy(dbHistory);

            expect(result.id).toBe('ord-123');
            expect(result.status).toBe('Archivado');
            expect(result.deletedFromColumn).toBe('col-finalizado');
            expect(result.reworkCount).toBe(1);
        });
    });
});
