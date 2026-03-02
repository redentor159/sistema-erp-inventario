"use client";

import React, { useEffect } from "react";
import { useTipologiasStore } from "@/store/tipologiasStore";
import { ControlsPanel } from "./ControlsPanel";
import { CatalogPalette } from "./CatalogPalette";
import { GeneradorSVG } from "./GeneradorSVG";
import { calculateGridMatrix, isAreaFree } from "@/lib/tipologias/matrixEngine";
import type { DragItemPayload, TipologiaItem } from "@/types/tipologias";

import { supabase } from '@/lib/supabase/client';

interface GridPlaygroundProps {
    cotizacionId?: string;
    loadTipologiaId?: string;
}

export function GridPlayground({ cotizacionId, loadTipologiaId }: GridPlaygroundProps) {
    const { tipologia, cruces, items, selectedItemId, setTipologia, loadTipologiaState, addItem, removeItem, selectItem } = useTipologiasStore();

    useEffect(() => {
        const fetchTipologia = async () => {
            if (loadTipologiaId) {
                const { data: tipoData, error: tipoError } = await supabase.from('tipologias').select('*').eq('id', loadTipologiaId).single();
                if (!tipoError && tipoData) {
                    const { data: crucesData } = await supabase.from('tipologias_cruces').select('*').eq('tipologia_id', loadTipologiaId);
                    const { data: itemsDataRaw } = await supabase.from('tipologias_items').select('*').eq('tipologia_id', loadTipologiaId);

                    let itemsData = itemsDataRaw || [];
                    if (itemsData.length > 0) {
                        const productoIds = Array.from(new Set(itemsData.map(i => i.producto_id).filter(Boolean)));
                        if (productoIds.length > 0) {
                            const { data: recetasData } = await supabase.from('mst_recetas_modelos')
                                .select('id_modelo, tipo_dibujo, tipo_apertura')
                                .in('id_modelo', productoIds);

                            itemsData = itemsData.map(item => {
                                const receta = recetasData?.find(r => r.id_modelo === item.producto_id);
                                return {
                                    ...item,
                                    tipo_dibujo: receta?.tipo_dibujo,
                                    tipo_apertura: receta?.tipo_apertura
                                };
                            });
                        }
                    }

                    loadTipologiaState(tipoData, crucesData || [], itemsData);
                }
            } else if (!tipologia) {
                setTipologia({
                    id: crypto.randomUUID(),
                    pedido_id: cotizacionId || "test",
                    descripcion: "Fachada de prueba",
                    ancho_total_mm: 3000,
                    alto_total_mm: 2000,
                    cantidad: 1,
                });
            }
        };

        fetchTipologia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cotizacionId, loadTipologiaId]);

    if (!tipologia) return <div>Inicializando Lienzo Paramétrico...</div>;

    // El componente Playground es el "Controlador" que une el estado con la vista puramente visual
    // En vez de que cada componente llame a calculateGridMatrix constantemente, 
    // lo podemos derivar aquí para inyectarlo en la vista.
    const calculatedCells = calculateGridMatrix(tipologia, cruces);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <style>{`
                body.is-dragging-item #capa-3-4-items-asignados {
                    pointer-events: none;
                }
            `}</style>
            {/* Panel Izquierdo: Controles Numéricos (Inputs) */}
            <div className="w-full lg:w-[400px] shrink-0 border rounded-md p-4 bg-muted/20 flex flex-col gap-6 overflow-y-auto">
                <ControlsPanel />
                <hr className="border-gray-300" />
                <CatalogPalette />
            </div>

            {/* Panel Derecho: Área de Renderizado SVG Dinámico */}
            <div className="flex-1 border rounded-md bg-white overflow-hidden relative min-h-[500px] flex items-center justify-center p-8">
                <GeneradorSVG
                    tipologia={tipologia}
                    cruces={cruces}
                    items={items}
                    calculatedCells={calculatedCells}
                    selectedItemId={selectedItemId}
                    onCellDrop={(colIndex: number, rowIndex: number, payload: DragItemPayload) => {
                        // Antes de agregar, buscamos si la celda de destino ya está siendo ocupada por otro item
                        // Si es así, removemos todo aquel que se superponga para reemplazarlo
                        const itemsToRemove = items.filter(i =>
                            colIndex >= i.grid_col_start && colIndex < i.grid_col_start + i.grid_col_span &&
                            rowIndex >= i.grid_row_start && rowIndex < i.grid_row_start + i.grid_row_span
                        );

                        itemsToRemove.forEach(i => removeItem(i.id));

                        // Extraemos la configuración visual directamente de la receta (payload)
                        // Si por algún motivo la BD no tiene (legacy), intentamos una heurística de fallback
                        let finalTipoDibujo = payload.tipo_dibujo;
                        let finalConfig = payload.config_hojas_default;

                        if (!finalTipoDibujo) {
                            if (payload.tipo_apertura?.includes("Corrediza") || payload.tipo_apertura?.includes("Ventana Corrediza") || payload.tipo_apertura?.includes("Mampara y/o Ventana Corrediza")) {
                                finalTipoDibujo = "Corrediza";
                                finalConfig = "CC";
                            } else if (payload.tipo_apertura?.includes("Batiente")) {
                                finalTipoDibujo = "Batiente";
                                finalConfig = "A";
                            } else if (payload.tipo_apertura?.includes("Proyectante")) {
                                finalTipoDibujo = "Proyectante";
                                finalConfig = "P";
                            } else {
                                finalTipoDibujo = "Fijo";
                                finalConfig = "F";
                            }
                        }

                        addItem({
                            tipologia_id: tipologia.id,
                            producto_id: payload.producto_id,
                            grid_col_start: colIndex,
                            grid_row_start: rowIndex,
                            grid_col_span: 1, // Por ahora span 1x1
                            grid_row_span: 1,
                            tipo_apertura: payload.tipo_apertura,
                            tipo_dibujo: finalTipoDibujo,
                            configuracion_hojas: finalConfig
                        });
                    }}
                    onItemClick={(item: TipologiaItem) => {
                        selectItem(item.id);
                    }}
                    onItemRemove={(item: TipologiaItem) => {
                        removeItem(item.id);
                    }}
                />
            </div>
        </div>
    );
}
