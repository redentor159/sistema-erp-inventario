import { supabase } from "@/lib/supabase/client";

// Types matching the SQL schema and original React app types
export interface KanbanOrder {
  id: string;
  column_id: string;
  position_rank: number;

  // Core Data
  client_name: string;
  product_name: string;
  brand: string;
  color: string;
  crystal_type: string;

  // Dimensions
  width_mm: number;
  height_mm: number;

  // Dates
  delivery_date: string; // YYYY-MM-DD
  creation_date: string; // YYYY-MM-DD
  completion_date?: string;

  // Meta
  additional_desc?: string;
  rework_count: number;
  movement_history?: any[];
  rework_history?: any[];
}

export type KanbanColumnId =
  | "column-pedidos-confirmados"
  | "column-en-corte"
  | "column-en-ensamblaje"
  | "column-listo-para-instalar"
  | "column-finalizado";

export const kanbanApi = {
  // Get all active orders
  getBoard: async (): Promise<KanbanOrder[]> => {
    const { data, error } = await supabase
      .from("trx_kanban_orders")
      .select("*")
      .order("position_rank", { ascending: true });

    if (error) throw error;
    return data as KanbanOrder[];
  },

  // Create a new order
  createOrder: async (
    order: Omit<KanbanOrder, "created_at" | "updated_at">,
  ) => {
    const { data, error } = await supabase
      .from("trx_kanban_orders")
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an order (edit content)
  updateOrder: async (id: string, updates: Partial<KanbanOrder>) => {
    const { data, error } = await supabase
      .from("trx_kanban_orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Move card (update column and position)
  moveCard: async (id: string, columnId: string, newIndex: number) => {
    const COL_ORDER = [
      "column-pedidos-confirmados",
      "column-en-corte",
      "column-en-ensamblaje",
      "column-listo-para-instalar",
      "column-finalizado",
    ];

    // 1. Get current order state
    const { data: currentOrder, error: fetchError } = await supabase
      .from("trx_kanban_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const oldColIdx = COL_ORDER.indexOf(currentOrder.column_id);
    const newColIdx = COL_ORDER.indexOf(columnId);

    const updates: any = {
      column_id: columnId,
      position_rank: newIndex,
      updated_at: new Date().toISOString(),
    };

    // 2. Check for Rework (Backward move)
    // If moving backwards (new < old) AND not just staying in same col
    if (newColIdx < oldColIdx && newColIdx !== -1 && oldColIdx !== -1) {
      const currentReworks = currentOrder.rework_history || [];
      const newReworkEntry = {
        date: new Date().toISOString(),
        from: currentOrder.column_id,
        to: columnId,
        reason: "Movimiento manual hacia atrás",
      };

      updates.rework_count = (currentOrder.rework_count || 0) + 1;
      updates.rework_history = [...currentReworks, newReworkEntry];
    }

    // 3. Track Movement History (Always)
    const currentMovements = currentOrder.movement_history || [];
    // Update previous movement exit time if exists
    const latestMove =
      currentMovements.length > 0
        ? currentMovements[currentMovements.length - 1]
        : null;

    const newMovements = [...currentMovements];

    if (latestMove && !latestMove.exitDate) {
      // Close previous
      newMovements[newMovements.length - 1] = {
        ...latestMove,
        exitDate: new Date().toISOString(),
      };
    }

    // Add new entry
    newMovements.push({
      stage: columnId,
      entryDate: new Date().toISOString(),
      exitDate: null,
    });

    updates.movement_history = newMovements;

    // 4. Perform Update
    const { data, error } = await supabase
      .from("trx_kanban_orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Archive/Delete order
  archiveOrder: async (
    id: string,
    status: "Finalizado" | "Eliminado" | "Archivado",
    deletedFrom: string,
  ) => {
    // Uses the SQL function we created to move data to history
    const { error } = await supabase.rpc("fn_archive_kanban_order", {
      p_order_id: id,
      p_status: status,
      p_deleted_from: deletedFrom,
      p_rework_hist: [], // Pass proper tracking if you have it in frontend state
      p_move_hist: [], // Pass proper tracking if you have it in frontend state
    });

    if (error) throw error;
  },

  // Archive All Finished
  archiveAllFinished: async () => {
    // Usar la RPC de lote atómico en base de datos
    const { data: count, error } = await supabase.rpc("fn_archive_kanban_batch");

    if (error) throw error;
    return count;
  },

  // Get History for Stats
  getHistory: async () => {
    const { data, error } = await supabase
      .from("trx_kanban_history")
      .select("*")
      .order("deletion_date", { ascending: false });

    return { data, error };
  },

  // Get Config (WIP Limits)
  getConfig: async () => {
    const { data, error } = await supabase
      .from("mst_kanban_config")
      .select("*")
      .eq("config_key", "main_config")
      .single();

    return { data, error };
  },

  // Update Config
  updateConfig: async (settings: {
    company_name?: string;
    wip_limits?: any;
  }) => {
    const { data, error } = await supabase
      .from("mst_kanban_config")
      .update(settings)
      .eq("config_key", "main_config");

    return { data, error };
  },

  // GENERATE DEMO DATA (For Testing Stats)
  generateDemoData: async () => {
    const years = 5;
    const itemsPerYear = 100;
    const statuses = ["Finalizado", "Archivado"];
    const clients = [
      "Constructora G&M",
      "Hogar Ideal SAC",
      "Clínica Bienestar",
      "Diseño Interior Moderno",
      "Oficinas Centrales Corp",
      "Residencial Los Álamos",
      "Arq. Roberto Méndez",
    ];
    const products = [
      "36 (PB 71) / MBT 036 / MBL 46",
      "80 / ML48",
      "35 / MBT 035",
      "MCO 043 / ML46",
      "3831 / 38",
      "Ventana Corrediza 2 Hojas",
      "Mampara Batiente",
      "Puerta Ducha Templada",
    ];
    const demoHistory: any[] = [];
    const stages = [
      "column-pedidos-confirmados",
      "column-en-corte",
      "column-en-ensamblaje",
      "column-listo-para-instalar",
    ];
    const COLUMN_TITLES_MAP: Record<string, string> = {
      "column-pedidos-confirmados": "Pedidos Confirmados",
      "column-en-corte": "En Corte",
      "column-en-ensamblaje": "En Ensamblaje",
      "column-listo-para-instalar": "Listo para Instalar",
      "column-finalizado": "Finalizado",
    };
    const stageTiming: Record<string, [number, number]> = {
      "column-pedidos-confirmados": [1, 3],
      "column-en-corte": [2, 5],
      "column-en-ensamblaje": [4, 8],
      "column-listo-para-instalar": [1, 4],
    };

    for (let i = 0; i < years * itemsPerYear; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365 * 5));
      const movements = [];
      let currentCursor = new Date(date);
      let totalLeadTime = 0;

      for (const stage of stages) {
        const [min, max] = stageTiming[stage];
        const daysInStage = Math.floor(Math.random() * (max - min + 1)) + min + Math.random();
        const entry = new Date(currentCursor);
        const exit = new Date(currentCursor);
        exit.setDate(exit.getDate() + daysInStage);
        exit.setHours(Math.floor(Math.random() * 8) + 9);
        movements.push({
          stage: COLUMN_TITLES_MAP[stage],
          entryDate: entry.toISOString().split("T")[0],
          exitDate: exit.toISOString().split("T")[0],
        });
        currentCursor = exit;
        totalLeadTime += daysInStage;
      }

      const hasRework = Math.random() < 0.2;
      if (hasRework) {
        const reworkDelay = Math.floor(Math.random() * 5) + 2;
        currentCursor.setDate(currentCursor.getDate() + reworkDelay);
      }
      const completion = currentCursor;

      demoHistory.push({
        history_id: crypto.randomUUID(),
        original_order_id: `HIST-${date.getFullYear()}-${Math.floor(Math.random() * 1000000)}-${i}`,
        client_name: clients[Math.floor(Math.random() * clients.length)],
        product_name: products[Math.floor(Math.random() * products.length)],
        width_mm: 1000 + Math.floor(Math.random() * 2000),
        height_mm: 2000 + Math.floor(Math.random() * 1000),
        creation_date: date.toISOString().split("T")[0],
        completion_date: completion.toISOString().split("T")[0],
        final_status: statuses[Math.floor(Math.random() * statuses.length)],
        movement_history: movements,
        rework_history: hasRework
          ? [
            {
              date: completion.toISOString().split("T")[0],
              from: COLUMN_TITLES_MAP["column-en-ensamblaje"],
              to: COLUMN_TITLES_MAP["column-en-corte"],
            },
          ]
          : [],
        deletion_date: new Date().toISOString(),
        brand: "Generico",
        color: "Natural",
        crystal_type: "Templado 6mm",
      });
    }

    const chunkSize = 50;
    for (let i = 0; i < demoHistory.length; i += chunkSize) {
      const chunk = demoHistory.slice(i, i + chunkSize);
      const { error } = await supabase.from("trx_kanban_history").insert(chunk);
      if (error) {
        console.error("Error inserting chunk:", JSON.stringify(error, null, 2));
        throw error;
      }
    }
  },

};
