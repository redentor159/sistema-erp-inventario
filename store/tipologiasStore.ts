import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Tipologia, TipologiaCruce, TipologiaItem, EjeCruce } from '@/types/tipologias';
import { supabase } from '@/lib/supabase/client';
import { calculateGridMatrix, validateItemPlacement } from '@/lib/utils/matrix-engine';

// Estado inmutable del store
interface TipologiaState {
    // Entidad padre
    tipologia: Tipologia | null;
    // Entidades relacionadas
    cruces: TipologiaCruce[];
    items: TipologiaItem[];
    // Opciones base
    espesorPerfilDefault: number;
    // UI State
    selectedItemId: string | null;

    // Acciones (Actions)
    setTipologia: (tipologia: Tipologia) => void;
    loadTipologiaState: (tipologia: Tipologia, cruces: TipologiaCruce[], items: TipologiaItem[]) => void;
    updateDimensiones: (width: number, height: number) => void;

    // Acciones sobre Cruces
    addCruce: (eje: EjeCruce, posicion: number, espesor?: number) => Promise<void>;
    updateCruce: (id: string, posicion: number) => Promise<void>;
    removeCruce: (id: string) => Promise<void>;

    // Acciones sobre Items
    addItem: (item: Omit<TipologiaItem, 'id'>) => Promise<void>;
    updateItemSpan: (id: string, colSpan: number, rowSpan: number) => Promise<void>;
    updateItemCrucesInternos: (id: string, horizontales: number, verticales: number) => Promise<void>;
    updateItemConfiguracion: (id: string, configHojas: string) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    selectItem: (id: string) => void;

    // Persistencia a BD
    saveTipologia: (pedidoId?: string) => Promise<{ id: string | null; error: string | null }>;
}

export const useTipologiasStore = create<TipologiaState>()(
    immer((set, get) => ({
        // Estado inicial
        tipologia: null,
        cruces: [],
        items: [],
        espesorPerfilDefault: 40, // 40mm por defecto
        selectedItemId: null,

        // ------------------------------------------------------------------
        // TIPOLOGIA (Master container)
        // ------------------------------------------------------------------
        setTipologia: (tipologia) =>
            set((state) => {
                state.tipologia = tipologia;
            }),

        loadTipologiaState: (tipologia, cruces, items) =>
            set((state) => {
                state.tipologia = tipologia;
                state.cruces = cruces;
                state.items = items;
                state.selectedItemId = null;
            }),

        updateDimensiones: (width, height) =>
            set((state) => {
                if (!state.tipologia) return;

                // Unidirectional Binding: 
                // No podemos reducir el ancho más allá del último cruce vertical
                const maxXCruce = state.cruces
                    .filter(c => c.tipo_eje === 'X')
                    .reduce((max, c) => Math.max(max, c.distancia_desde_origen_mm), 0);

                const maxYCruce = state.cruces
                    .filter(c => c.tipo_eje === 'Y')
                    .reduce((max, c) => Math.max(max, c.distancia_desde_origen_mm), 0);

                if (width >= maxXCruce) state.tipologia.ancho_total_mm = width;
                if (height >= maxYCruce) state.tipologia.alto_total_mm = height;
            }),

        // ------------------------------------------------------------------
        // CRUCES (Mullions & Transoms)
        // ------------------------------------------------------------------
        addCruce: async (eje, posicion, espesor) => {
            const state = get();
            if (!state.tipologia || state.tipologia.id.includes('test')) return; // Ignore on dummy state

            const limite = eje === 'X' ? state.tipologia.ancho_total_mm : state.tipologia.alto_total_mm;
            if (posicion <= 0 || posicion >= limite) return;

            const newId = crypto.randomUUID();
            const newCruce: TipologiaCruce = {
                id: newId,
                tipologia_id: state.tipologia.id,
                tipo_eje: eje,
                distancia_desde_origen_mm: Math.round(posicion),
                espesor_perfil_mm: espesor ?? state.espesorPerfilDefault,
            };

            // DB sync
            const { error } = await supabase.from('tipologias_cruces').insert(newCruce);

            if (!error) {
                set((s) => { s.cruces.push(newCruce); });
            } else {
                console.error("No se pudo guardar el cruce", error);
            }
        },

        updateCruce: async (id, posicion) => {
            const state = get();
            if (!state.tipologia) return;

            const cruce = state.cruces.find(c => c.id === id);
            if (!cruce) return;

            const limite = cruce.tipo_eje === 'X' ? state.tipologia.ancho_total_mm : state.tipologia.alto_total_mm;

            if (posicion > 0 && posicion < limite) {
                set((s) => {
                    const localCruce = s.cruces.find(c => c.id === id);
                    if (localCruce) localCruce.distancia_desde_origen_mm = Math.round(posicion);
                });

                // Debounced DB Update idealmente, pero procedemos directo
                await supabase.from('tipologias_cruces').update({ distancia_desde_origen_mm: Math.round(posicion) }).eq('id', id);
            }
        },

        removeCruce: async (id) => {
            set((s) => {
                s.cruces = s.cruces.filter(c => c.id !== id);
                s.items = []; // Cascade en UI
                s.selectedItemId = null;
            });
            await supabase.from('tipologias_cruces').delete().eq('id', id);
            await supabase.from('tipologias_items').delete().eq('tipologia_id', get().tipologia?.id);
        },

        // ------------------------------------------------------------------
        // ITEMS (Productos en el Grid)
        // ------------------------------------------------------------------
        addItem: async (itemInput) => {
            const state = get();
            const matrix = calculateGridMatrix(state.tipologia, state.cruces as TipologiaCruce[], state.items as TipologiaItem[]);

            // Validación básica de ocupación para 1x1 default
            const isValid = validateItemPlacement(
                matrix,
                itemInput.grid_col_start,
                itemInput.grid_row_start,
                itemInput.grid_col_span,
                itemInput.grid_row_span
            );

            if (!isValid) {
                console.warn(`Zustand: No se puede colocar item en ${itemInput.grid_col_start}x${itemInput.grid_row_start}`);
                return;
            }

            const newItem = {
                ...itemInput,
                id: crypto.randomUUID()
            };

            // Preparamos payload validado para BD (omitimos virtuales como tipo_dibujo, tipo_apertura)
            const dbPayload = {
                id: newItem.id,
                tipologia_id: newItem.tipologia_id,
                producto_id: newItem.producto_id,
                grid_col_start: newItem.grid_col_start,
                grid_row_start: newItem.grid_row_start,
                grid_col_span: newItem.grid_col_span,
                grid_row_span: newItem.grid_row_span,
                cruces_horizontales: newItem.cruces_horizontales || 0,
                cruces_verticales: newItem.cruces_verticales || 0,
                configuracion_hojas: newItem.configuracion_hojas
            };

            // DB sync
            const { error } = await supabase.from('tipologias_items').insert(dbPayload);

            if (!error) {
                set((s) => { s.items.push(newItem); });
            } else {
                console.error("Error BD addItem:", error);
            }
        },

        updateItemSpan: async (id, colSpan, rowSpan) => {
            const state = get();
            const item = state.items.find(i => i.id === id);
            if (!item) return;

            const matrix = calculateGridMatrix(state.tipologia, state.cruces as TipologiaCruce[], state.items as TipologiaItem[]);

            const isValid = validateItemPlacement(
                matrix,
                item.grid_col_start,
                item.grid_row_start,
                colSpan,
                rowSpan,
                item.id // Ignorar a sí mismo
            );

            if (!isValid) {
                console.warn(`Zustand: Espansión inválida para item ${id}`);
                return;
            }

            set((s) => {
                const i = s.items.find(it => it.id === id);
                if (i) {
                    i.grid_col_span = colSpan;
                    i.grid_row_span = rowSpan;
                }
            });

            await supabase.from('tipologias_items').update({ grid_col_span: colSpan, grid_row_span: rowSpan }).eq('id', id);
        },

        updateItemCrucesInternos: async (id, horizontales, verticales) => {
            set((s) => {
                const item = s.items.find(i => i.id === id);
                if (!item) return;
                item.cruces_horizontales = Math.max(0, horizontales);
                item.cruces_verticales = Math.max(0, verticales);
            });
            await supabase.from('tipologias_items').update({
                cruces_horizontales: Math.max(0, horizontales),
                cruces_verticales: Math.max(0, verticales)
            }).eq('id', id);
        },

        updateItemConfiguracion: async (id, configHojas) => {
            set((s) => {
                const item = s.items.find(i => i.id === id);
                if (item) item.configuracion_hojas = configHojas;
            });
            await supabase.from('tipologias_items').update({ configuracion_hojas: configHojas }).eq('id', id);
        },

        removeItem: async (id) => {
            set((s) => {
                s.items = s.items.filter(i => i.id !== id);
                if (s.selectedItemId === id) s.selectedItemId = null;
            });
            await supabase.from('tipologias_items').delete().eq('id', id);
        },

        selectItem: (id) =>
            set((state) => {
                state.selectedItemId = id;
            }),

        // ------------------------------------------------------------------
        // PERSISTENCIA
        // ------------------------------------------------------------------
        saveTipologia: async (pedidoId) => {
            // Usar get() para obtener un snapshot limpio del estado sin proxy traps
            const state = get();

            const tipologia = state.tipologia ? JSON.parse(JSON.stringify(state.tipologia)) as Tipologia : null;
            const cruces = JSON.parse(JSON.stringify(state.cruces)) as TipologiaCruce[];
            const items = JSON.parse(JSON.stringify(state.items)) as TipologiaItem[];

            if (!tipologia) return { id: null, error: "No hay tipología definida" };

            try {
                // Validate if pedidoId is a valid UUID, otherwise it will crash the DB insert due to FK constraints
                const isValidUUID = pedidoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pedidoId);

                const { data: newTipologia, error: tipologiaError } = await supabase
                    .from('tipologias')
                    .insert({
                        pedido_id: isValidUUID ? pedidoId : null,
                        descripcion: tipologia.descripcion || 'Diseño Grid Personalizado',
                        ancho_total_mm: tipologia.ancho_total_mm,
                        alto_total_mm: tipologia.alto_total_mm,
                        cantidad: tipologia.cantidad || 1
                    })
                    .select()
                    .single();

                if (tipologiaError) throw tipologiaError;

                const dbTipologiaId = newTipologia.id;

                // 2. Save Cruces
                if (cruces.length > 0) {
                    const crucesInserts = cruces.map(c => ({
                        tipologia_id: dbTipologiaId,
                        tipo_eje: c.tipo_eje,
                        distancia_desde_origen_mm: c.distancia_desde_origen_mm,
                        espesor_perfil_mm: c.espesor_perfil_mm
                    }));
                    const { error: crucesError } = await supabase.from('tipologias_cruces').insert(crucesInserts);
                    if (crucesError) throw crucesError;
                }

                // 3. Save Items
                if (items.length > 0) {
                    const itemsInserts = items.map(item => ({
                        tipologia_id: dbTipologiaId,
                        producto_id: item.producto_id,
                        grid_col_start: item.grid_col_start,
                        grid_row_start: item.grid_row_start,
                        grid_col_span: item.grid_col_span,
                        grid_row_span: item.grid_row_span,
                        cruces_horizontales: item.cruces_horizontales || 0,
                        cruces_verticales: item.cruces_verticales || 0,
                        configuracion_hojas: item.configuracion_hojas || null
                    }));
                    const { error: itemsError } = await supabase.from('tipologias_items').insert(itemsInserts);
                    if (itemsError) throw itemsError;
                }

                return { id: dbTipologiaId, error: null };

            } catch (error: any) {
                console.error("Error saving Tipologia:", error);
                const errorMsg = error.message || error.details || JSON.stringify(error);
                return { id: null, error: errorMsg };
            }
        }
    }))
);
