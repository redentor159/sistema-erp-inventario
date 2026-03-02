"use client";

import React, { useEffect, useState } from "react";
import type { DragItemPayload } from "@/types/tipologias";
import { GripVertical } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function CatalogPalette() {
    const [catalogItems, setCatalogItems] = useState<DragItemPayload[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            const { data, error } = await supabase
                .from('mst_recetas_modelos')
                .select('id_modelo, nombre_comercial, tipo_apertura, tipo_dibujo, config_hojas_default')
                .eq('activo', true)
                .order('nombre_comercial');

            if (data) {
                const mapped: DragItemPayload[] = data.map(item => ({
                    producto_id: item.id_modelo,
                    nombre_producto: item.nombre_comercial,
                    tipo_apertura: item.tipo_apertura || "Desconocido",
                    tipo_dibujo: item.tipo_dibujo || "Fijo",
                    config_hojas_default: item.config_hojas_default || undefined
                }));
                setCatalogItems(mapped);
            }
            setLoading(false);
        };
        fetchModels();
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: DragItemPayload) => {
        // Almacenamos la info del item en DataTransfer en formato JSON
        e.dataTransfer.setData("application/json", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";

        // Agregar clase para desactivar pointer-events en SVGs
        document.body.classList.add("is-dragging-item");
    };

    const handleDragEnd = () => {
        document.body.classList.remove("is-dragging-item");
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Catálogo de Sistemas</h3>
            <p className="text-xs text-muted-foreground">
                Arrastra un modelo hacia una celda del grid para asignarlo.
            </p>

            <div className="grid grid-cols-1 gap-2">
                {loading ? (
                    <p className="text-sm text-center py-4 text-muted-foreground">Cargando catálogo...</p>
                ) : catalogItems.length === 0 ? (
                    <p className="text-sm text-center py-4 text-muted-foreground">No hay modelos activos.</p>
                ) : (
                    catalogItems.map((item) => (
                        <div
                            key={item.producto_id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-3 border rounded-md p-3 bg-white hover:bg-muted cursor-grab active:cursor-grabbing shadow-sm transition-all"
                        >
                            <GripVertical className="h-5 w-5 text-gray-400 shrink-0" />
                            <div className="flex flex-col overflow-hidden text-left">
                                <span className="text-sm font-medium truncate">{item.nombre_producto}</span>
                                <span className="text-xs text-slate-500 font-mono mt-1">{item.tipo_apertura}</span>
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    );
}
