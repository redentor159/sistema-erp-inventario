"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Download, FileSpreadsheet, History, Package, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
// import { saveAs } from "file-saver" // Dynamic import to avoid SSR issues

export default function ExportPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [loading, setLoading] = useState<string | null>(null)

    const handleExport = async (type: string) => {
        try {
            setLoading(type)
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, date: date?.toISOString() })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
            }

            const blob = await response.blob()
            const filename = `${type}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

            // Dynamic import for client-side only
            const { saveAs } = await import('file-saver')
            saveAs(blob, filename)

        } catch (error: any) {
            console.error("Export Error Detailed:", error)
            alert(`Error al exportar: ${error.message || "Desconocido"}`)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Centro de Exportación</h2>
                <p className="text-muted-foreground">Descarga de reportes detallados para contabilidad y análisis.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 1. VENTAS / COTIZACIONES */}
                <Card className="border-blue-200 bg-blue-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <ShoppingCart className="h-5 w-5" />
                            Reporte de Ventas
                        </CardTitle>
                        <CardDescription>Cotizaciones Aprobadas y Finalizadas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Incluye detalle de ítems, precios unitarios, clientes y fechas de entrega. Ideal para análisis de ingresos.
                        </p>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleExport('sales')}
                            disabled={!!loading}
                        >
                            {loading === 'sales' ? "Generando..." : (
                                <>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* 2. INVENTARIO VALORIZADO */}
                <Card className="border-emerald-200 bg-emerald-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <Package className="h-5 w-5" />
                            Inventario Valorizado
                        </CardTitle>
                        <CardDescription>Snapshot de Stock Actual</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Foto completa del almacén hoy. Cantidades, Costo Unitario (PMP) y Valor Total.
                        </p>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleExport('inventory')}
                            disabled={!!loading}
                        >
                            {loading === 'inventory' ? "Generando..." : (
                                <>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* 3. KARDEX / MOVIMIENTOS */}
                <Card className="border-orange-200 bg-orange-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <History className="h-5 w-5" />
                            Kardex de Movimientos
                        </CardTitle>
                        <CardDescription>Historial de Entradas/Salidas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground mb-2">
                                Auditoría completa de movimientos. Filtra por mes para cierres contables.
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="allHistory"
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                                    checked={!date}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setDate(undefined)
                                        } else {
                                            setDate(new Date())
                                        }
                                    }}
                                />
                                <label htmlFor="allHistory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Exportar todo el historial
                                </label>
                            </div>
                            <Input
                                type="month"
                                className="w-full"
                                disabled={!date}
                                value={date ? format(date, "yyyy-MM") : ""}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [y, m] = e.target.value.split('-').map(Number)
                                        setDate(new Date(y, m - 1, 1))
                                    } else {
                                        // Handle clear if needed, though browser clear button does this
                                        setDate(undefined)
                                    }
                                }}
                            />
                        </div>

                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleExport('movements')}
                            disabled={!!loading}
                        >
                            {loading === 'movements' ? "Generando..." : (
                                <>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
