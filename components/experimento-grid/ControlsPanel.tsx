"use client";

import React, { useState } from "react";
import { useTipologiasStore } from "@/store/tipologiasStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Debounce hook simple para evitar re-renders excesivos del SVG al tipear
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function ControlsPanel() {
    const { tipologia, cruces, items, selectedItemId, updateDimensiones, addCruce, removeCruce, updateItemCrucesInternos, updateItemSpan, updateItemConfiguracion, saveTipologia } = useTipologiasStore();
    const [isSaving, setIsSaving] = useState(false);

    const selectedItem = items.find(i => i.id === selectedItemId);

    // Estados locales para los inputs controlados
    const [localWidth, setLocalWidth] = useState(tipologia?.ancho_total_mm.toString() || "3000");
    const [localHeight, setLocalHeight] = useState(tipologia?.alto_total_mm.toString() || "2000");
    const [newCruceX, setNewCruceX] = useState("");
    const [newCruceY, setNewCruceY] = useState("");

    // Usamos el hook de debounce para despachar al Store Global
    const debouncedWidth = useDebounce(localWidth, 300);
    const debouncedHeight = useDebounce(localHeight, 300);

    // Efecto para sincronizar el estado local debounced -> Store Global
    React.useEffect(() => {
        const w = parseInt(debouncedWidth) || 0;
        const h = parseInt(debouncedHeight) || 0;
        if (w > 0 && h > 0) {
            updateDimensiones(w, h);
        }
    }, [debouncedWidth, debouncedHeight, updateDimensiones]);


    // Effecto para resincronizar si tipologia cambia desde afuera (e.g. Unidirectional binding rollback)
    React.useEffect(() => {
        if (tipologia) {
            setLocalWidth(tipologia.ancho_total_mm.toString());
            setLocalHeight(tipologia.alto_total_mm.toString());
        }
    }, [tipologia?.ancho_total_mm, tipologia?.alto_total_mm]);

    if (!tipologia) return null;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Dimensiones Maestras</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="width">Ancho Total (W) mm</Label>
                        <Input
                            id="width"
                            type="number"
                            value={localWidth}
                            onChange={(e) => setLocalWidth(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Alto Total (H) mm</Label>
                        <Input
                            id="height"
                            type="number"
                            value={localHeight}
                            onChange={(e) => setLocalHeight(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Divisiones Físicas (Cruces)</h3>

                {/* Agregar Cruce Vertical (X) */}
                <div className="flex gap-2 items-end">
                    <div className="space-y-2 flex-1">
                        <Label>Nuevo Parante (X mm)</Label>
                        <Input
                            type="number"
                            placeholder="Ej: 1500"
                            value={newCruceX}
                            onChange={(e) => setNewCruceX(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newCruceX) {
                                    addCruce('X', parseInt(newCruceX));
                                    setNewCruceX("");
                                }
                            }}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        disabled={!newCruceX}
                        onClick={() => {
                            addCruce('X', parseInt(newCruceX));
                            setNewCruceX("");
                        }}
                    >
                        + Parante
                    </Button>
                </div>

                {/* Agregar Cruce Horizontal (Y) */}
                <div className="flex gap-2 items-end">
                    <div className="space-y-2 flex-1">
                        <Label>Nuevo Travesaño (Y mm)</Label>
                        <Input
                            type="number"
                            placeholder="Ej: 1000"
                            value={newCruceY}
                            onChange={(e) => setNewCruceY(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newCruceY) {
                                    addCruce('Y', parseInt(newCruceY));
                                    setNewCruceY("");
                                }
                            }}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        disabled={!newCruceY}
                        onClick={() => {
                            addCruce('Y', parseInt(newCruceY));
                            setNewCruceY("");
                        }}
                    >
                        + Travesaño
                    </Button>
                </div>

                {/* Lista de Cruces Actuales */}
                {cruces.length > 0 && (
                    <div className="mt-4 border rounded p-2 bg-white">
                        <Label className="text-xs text-muted-foreground mb-2 block">Cruces Existentes:</Label>
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {[...cruces].sort((a, b) => a.distancia_desde_origen_mm - b.distancia_desde_origen_mm).map(cruce => (
                                <li key={cruce.id} className="flex items-center justify-between text-sm p-1 rounded hover:bg-muted">
                                    <span>
                                        {cruce.tipo_eje === 'X' ? 'Parante en' : 'Travesaño en'}: <span className="font-mono">{cruce.distancia_desde_origen_mm}mm</span>
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => removeCruce(cruce.id)}>X</Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>
            {/* PROPIEDADES DEL ITEM SELECCIONADO */}
            {selectedItem && (
                <div className="space-y-4 mt-6 p-4 border rounded-md bg-blue-50/50 border-blue-200">
                    <h3 className="font-semibold text-lg border-b border-blue-200 pb-2 text-blue-900">
                        Propiedades del Ítem
                    </h3>
                    <p className="text-xs text-blue-700 font-mono mb-2">{selectedItem.producto_id}</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cruces Vert. (Int)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={selectedItem.cruces_verticales || 0}
                                onChange={(e) => updateItemCrucesInternos(selectedItem.id, selectedItem.cruces_horizontales || 0, parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cruces Horiz. (Int)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={selectedItem.cruces_horizontales || 0}
                                onChange={(e) => updateItemCrucesInternos(selectedItem.id, parseInt(e.target.value) || 0, selectedItem.cruces_verticales || 0)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                            <Label>Column Span</Label>
                            <Input
                                type="number"
                                min={1}
                                value={selectedItem.grid_col_span}
                                onChange={(e) => updateItemSpan(selectedItem.id, parseInt(e.target.value) || 1, selectedItem.grid_row_span)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Row Span</Label>
                            <Input
                                type="number"
                                min={1}
                                value={selectedItem.grid_row_span}
                                onChange={(e) => updateItemSpan(selectedItem.id, selectedItem.grid_col_span, parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    {(() => {
                        const isCorrediza = selectedItem.tipo_dibujo === 'Corrediza' || (!selectedItem.tipo_dibujo && (selectedItem.tipo_apertura?.toLowerCase().includes("corrediza") || selectedItem.producto_id?.includes("S")));
                        const isProyectante = selectedItem.tipo_dibujo === 'Proyectante' || selectedItem.tipo_dibujo === 'Batiente' || (!selectedItem.tipo_dibujo && (selectedItem.tipo_apertura?.toLowerCase().includes("proyectante") || selectedItem.producto_id?.includes("3831") || selectedItem.producto_id?.includes("42")));

                        if (isCorrediza) return (
                            <div className="grid grid-cols-1 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label>Configuración Hojas (Corrediza)</Label>
                                    <Select
                                        value={selectedItem.configuracion_hojas || "CC"}
                                        onValueChange={(val) => updateItemConfiguracion(selectedItem.id, val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Configuración..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CC">CC</SelectItem>
                                            <SelectItem value="FC">FC</SelectItem>
                                            <SelectItem value="CF">CF</SelectItem>
                                            <SelectItem value="FCC">FCC</SelectItem>
                                            <SelectItem value="CCF">CCF</SelectItem>
                                            <SelectItem value="FCF">FCF</SelectItem>
                                            <SelectItem value="CFFC">CFFC</SelectItem>
                                            <SelectItem value="FCCF">FCCF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );

                        if (isProyectante) return (
                            <div className="grid grid-cols-1 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label>Orientación (Proy/Batiente)</Label>
                                    <Select
                                        value={selectedItem.configuracion_hojas || "P_SUP"}
                                        onValueChange={(val) => updateItemConfiguracion(selectedItem.id, val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Orientación..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="P_SUP">Superior (Normal)</SelectItem>
                                            <SelectItem value="P_INF">Inferior (Invertido)</SelectItem>
                                            <SelectItem value="B_IZQ">Izda. (Batiente)</SelectItem>
                                            <SelectItem value="B_DER">Dcha. (Batiente)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );

                        return null;
                    })()}
                </div>
            )}

            {/* GUARDAR A BD */}
            <div className="pt-6 border-t mt-6 flex flex-col gap-2">
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    disabled={isSaving || items.length === 0}
                    onClick={async () => {
                        setIsSaving(true);
                        const result = await saveTipologia();
                        setIsSaving(false);
                        if (result?.id) {
                            if (tipologia?.pedido_id && tipologia.pedido_id !== 'test') {
                                try {
                                    // Make sure it appears as a line item on the quote
                                    const { cotizacionesApi } = await import('@/lib/api/cotizaciones');
                                    await cotizacionesApi.addLineItem(tipologia.pedido_id, {
                                        id_modelo: "SERVICIO",
                                        etiqueta_item: `Diseño Custom: ${tipologia?.descripcion || 'Tipología'}`,
                                        cantidad: 1,
                                        ancho_mm: tipologia?.ancho_total_mm || 0,
                                        alto_mm: tipologia?.alto_total_mm || 0,
                                        color_perfiles: "GEN",
                                        tipo_vidrio: null,
                                        opciones_seleccionadas: {}
                                    });
                                    alert(`¡Diseño de Tipología guardado y agregado a su Cotización exitosamente!\nID: ${result.id}`);
                                } catch (e: any) {
                                    console.error("Error linking tipologia to quote:", e);
                                    alert(`La tipología se guardó (ID: ${result.id}), pero no pudimos vincularla automáticamente a la pestaña Detalles. Causa: ${e.message}`);
                                }
                            } else {
                                alert(`Tipología guardada en modo de pruebas con ID: ${result.id}`);
                            }
                        } else {
                            alert(`Error al guardar tipología:\n${result?.error || JSON.stringify(result)}`);
                        }
                    }}
                >
                    {isSaving ? "Guardando..." : "Guardar Diseño"}
                </Button>
                <p className="text-xs text-center text-slate-500">
                    Al guardar este diseño, se anexará automáticamente un ítem general a esta cotización.
                </p>
            </div>
        </div>
    );
}
