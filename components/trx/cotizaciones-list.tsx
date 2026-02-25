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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CotizacionesList() {
    const router = useRouter()
    const toast = useToastHelper()
    const [data, setData] = useState<CotizacionListItem[]>([])
    const [loading, setLoading] = useState(true)

    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)

    const totalPages = Math.ceil(data.length / pageSize)
    const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize)

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
            router.push(`/cotizaciones/detalle?id=${newCot.id_cotizacion}`)
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
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden md:inline">Mostrar:</span>
                        <Select value={pageSize.toString()} onValueChange={(val) => {
                            setPageSize(Number(val))
                            setPage(0)
                        }}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="500">500</SelectItem>
                                <SelectItem value="1000">1000</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
                    </Button>
                </div>
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
                            {paginatedData.map((row) => (
                                <tr key={row.id_cotizacion} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/cotizaciones/detalle?id=${row.id_cotizacion}`)}>
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
                                                router.push(`/cotizaciones/detalle?id=${row.id_cotizacion}`)
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

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {data.length > 0 ? (page * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, data.length)} de {data.length}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                        >
                            Anterior
                        </Button>
                        <div className="text-sm font-medium">
                            Página {page + 1} de {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
