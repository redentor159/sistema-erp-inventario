
import { KanbanOrder } from "./api/kanban"

// Legacy types used by the ported components (Statistics, Export, etc.)
export interface WorkOrder {
    id: string;
    client: string;
    product: string;
    brand: string;
    color: string;
    crystal: string;
    deliveryDate: string; // YYYY-MM-DD
    creationDate: string; // YYYY-MM-DD
    completionDate?: string; // YYYY-MM-DD
    width?: number;
    height?: number;
    additionalDescription?: string;
    reworkCount?: number;
    movementHistory?: any[];
    reworkHistory?: any[];
}

export interface ProjectHistory extends WorkOrder {
    status: 'Activo' | 'Finalizado' | 'Eliminado' | 'Archivado';
    deletedFromColumn: string | null;
    deletionDate: string | null;
    reworkHistory?: any[]; // JSONB
    movementHistory?: any[]; // JSONB
}

// Adapter function to convert DB (snake_case) to Frontend Legacy (camelCase)
export function adaptOrderToLegacy(order: KanbanOrder): WorkOrder {
    return {
        id: order.id,
        client: order.client_name,
        product: order.product_name,
        brand: order.brand,
        color: order.color,
        crystal: order.crystal_type,
        deliveryDate: order.delivery_date,
        creationDate: order.creation_date,
        completionDate: order.completion_date,
        width: order.width_mm,
        height: order.height_mm,
        additionalDescription: order.additional_desc,
        reworkCount: order.rework_count,
        movementHistory: order.movement_history,
        reworkHistory: order.rework_history
    }
}

// Adapter from DB History to Legacy History
// Need to define the DB interface for History first as it was generic in the API
export interface KanbanHistoryDB {
    history_id: string
    original_order_id: string
    client_name: string
    product_name: string
    brand: string
    color: string
    crystal_type: string
    width_mm: number
    height_mm: number
    delivery_date: string
    creation_date: string
    completion_date: string
    final_status: string
    deleted_from_column: string
    deletion_date: string
    rework_history: any
    movement_history: any
}

export function adaptHistoryToLegacy(h: KanbanHistoryDB): ProjectHistory {
    return {
        id: h.original_order_id, // Use original ID for display
        client: h.client_name,
        product: h.product_name,
        brand: h.brand,
        color: h.color,
        crystal: h.crystal_type,
        width: h.width_mm,
        height: h.height_mm,
        deliveryDate: h.delivery_date,
        creationDate: h.creation_date,
        completionDate: h.completion_date,
        additionalDescription: "", // Not explicitly in history table select unless added? Check schema.
        reworkCount: h.rework_history ? h.rework_history.length : 0,
        status: h.final_status as any,
        deletedFromColumn: h.deleted_from_column,
        deletionDate: h.deletion_date,
        reworkHistory: h.rework_history,
        movementHistory: h.movement_history
    }
}
