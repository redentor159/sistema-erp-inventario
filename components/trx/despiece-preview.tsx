"use client"

import { useQuery } from "@tanstack/react-query"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
import { formatCurrency } from "@/lib/utils"
import { TrxDesgloseMateriales } from "@/types/materiales"

export function DespiecePreview({ idLinea }: { idLinea: string }) {
    const { data: materiales, isLoading } = useQuery<TrxDesgloseMateriales[]>({
        queryKey: ['despiece', idLinea],
        queryFn: () => cotizacionesApi.getDesgloseMateriales(idLinea),
        staleTime: 5 * 60 * 1000, // 5 min cache
    })


    if (isLoading) return <span className="text-muted-foreground italic text-xs">Cargando ingeniería...</span>
    if (!materiales || materiales.length === 0) return <span className="text-muted-foreground italic text-xs">Sin despiece generado. Click en calculadora.</span>

    const perfiles = materiales.filter(m => m.tipo_componente === 'Perfil')
    const otros = materiales.filter(m => m.tipo_componente !== 'Perfil')

    // Calculate total cost for display
    const totalCosto = materiales.reduce((sum, m) => sum + (Number(m.costo_total_item) || 0), 0)

    return (
        <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-md border border-slate-100">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-xs text-slate-700">Desglose de Materiales (Ingeniería)</h4>
                <span className="text-xs font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                    Costo Total: {formatCurrency(totalCosto)}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                    <span className="font-semibold text-slate-600 block mb-1">Perfiles de Aluminio:</span>
                    <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                        {perfiles.map(m => (
                            <li key={m.id_desglose} className="flex justify-between gap-2">
                                <span>
                                    {m.nombre_componente}
                                    <span className="text-slate-500 ml-1">
                                        ({Math.round(m.medida_corte_mm ?? 0)}mm)
                                    </span>
                                </span>
                                <div className="flex gap-2 text-right">
                                    <span className="font-mono text-xs text-slate-400">{m.sku_real}</span>
                                    <span className="font-medium min-w-[60px]">{formatCurrency(m.costo_total_item)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <span className="font-semibold text-slate-600 block mb-1">Vidrios, Accesorios y Servicios:</span>
                    <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                        {otros.map(m => (
                            <li key={m.id_desglose} className="flex justify-between gap-2">
                                <span>{m.nombre_componente} {(m.tipo_componente === 'Servicio' || m.tipo_componente === 'Vidrio') && typeof m.cantidad_calculada === 'number' ? `(${m.cantidad_calculada.toFixed(2)} m²)` : ''}</span>
                                <span className="font-medium">{formatCurrency(m.costo_total_item)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
