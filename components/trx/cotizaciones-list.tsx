"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cotizacionesApi } from "@/lib/api/cotizaciones"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CotizacionListItem } from "@/types/cotizaciones"
import { useToastHelper } from "@/lib/hooks/useToastHelper"

export function CotizacionesList() {
    const router = useRouter()
    const toast = useToastHelper()
    const [data, setData] = useState<CotizacionListItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const res = await cotizacionesApi.getCotizaciones()
            setData(res || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate() {
        try {
            // Create empty draft
            console.log("Creating new cotizacion...")
            const newCot = await cotizacionesApi.createCotizacion({
                // Defaults
                id_cliente: undefined,
                nombre_proyecto: "Nuevo Proyecto"
            })

            console.log("Create result:", newCot)

            if (!newCot) {
                toast.error("Error crítico", "La API no devolvió ningún dato. Intenta nuevamente.")
                return
            }

            if (!newCot.id_cotizacion) {
                console.error("CRITICAL: id_cotizacion is missing in", newCot)
                toast.error("Error de creación", "Se creó la cotización pero no se recibió el ID. Contacta soporte.")
                return
            }

            console.log("Redirecting to:", newCot.id_cotizacion)
            router.push(`/cotizaciones/${newCot.id_cotizacion}`)
        } catch (e: any) {
            console.error("Error creating cotizacion:", e)
            toast.error("Error al crear", e.message || "No se pudo crear la cotización")
        }
    }

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation() // Prevent row click
        if (!confirm("¿Estás seguro de que quieres eliminar esta cotización? Esta acción no se puede deshacer.")) return

        try {
            await cotizacionesApi.deleteCotizacion(id)
            toast.success("Cotización eliminada")
            loadData()
        } catch (error: any) {
            console.error(error)
            toast.error("Error al eliminar", error.message)
        }
    }

    if (loading) return <div>Cargando...</div>

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Listado Reciente</CardTitle>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b text-left">
                                <th className="p-3 font-medium">Proyecto</th>
                                <th className="p-3 font-medium">Cliente</th>
                                <th className="p-3 font-medium">Fecha</th>
                                <th className="p-3 font-medium">Estado</th>
                                <th className="p-3 font-medium text-right">Total</th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.id_cotizacion} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/cotizaciones/${row.id_cotizacion}`)}>
                                    <td className="p-3 font-medium">{row.nombre_proyecto || "Sin nombre"}</td>
                                    <td className="p-3 text-muted-foreground">{row.mst_clientes?.nombre_completo || "---"}</td>
                                    <td className="p-3">{new Date(row.fecha_emision).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <Badge variant={row.estado === 'Borrador' ? 'secondary' : 'default'}>
                                            {row.estado}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right font-bold text-green-600">
                                        {formatCurrency(row._vc_precio_final_cliente || 0)}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/cotizaciones/${row.id_cotizacion}`)
                                            }}>Ver</Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => handleDelete(e, row.id_cotizacion)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No hay cotizaciones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
