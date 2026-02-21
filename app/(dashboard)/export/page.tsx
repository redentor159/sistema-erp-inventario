"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Download, FileSpreadsheet, History, Package, ShoppingCart, Database, Filter } from "lucide-react"

export default function ExportPage() {
    // Default to last 30 days
    const defaultStart = new Date()
    defaultStart.setMonth(defaultStart.getMonth() - 1)

    const [startDate, setStartDate] = useState<string>(format(defaultStart, 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [useDateFilter, setUseDateFilter] = useState<boolean>(true)
    const [loading, setLoading] = useState<string | null>(null)

    const handleExport = async (type: string) => {
        try {
            setLoading(type)

            const payload = {
                type,
                startDate: useDateFilter ? `${startDate}T00:00:00.000Z` : undefined,
                endDate: useDateFilter ? `${endDate}T23:59:59.999Z` : undefined
            }

            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
            }

            const blob = await response.blob()
            const filename = `Export_${type.toUpperCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`

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
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Generador de Reportes</h2>
                    <p className="text-muted-foreground mt-1">Exportación de datos estructurados multi-hoja, optimizados para Power BI y Excel Avanzado.</p>
                </div>
            </div>

            {/* Global Filters Panel */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-500" />
                        Parámetros Globales de Exportación
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <input
                                type="checkbox"
                                id="useDates"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                checked={useDateFilter}
                                onChange={(e) => setUseDateFilter(e.target.checked)}
                            />
                            <Label htmlFor="useDates" className="font-semibold cursor-pointer">Filtrar por Fecha de Emisión/Movimiento</Label>
                        </div>

                        {useDateFilter && (
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto ml-0 md:ml-4 p-3 bg-slate-50 rounded-md border border-slate-100">
                                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                                    <Label htmlFor="start" className="text-xs text-slate-500 uppercase font-semibold">Desde</Label>
                                    <Input
                                        type="date"
                                        id="start"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full sm:w-[160px] cursor-pointer"
                                    />
                                </div>
                                <span className="text-slate-300 hidden sm:inline">—</span>
                                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                                    <Label htmlFor="end" className="text-xs text-slate-500 uppercase font-semibold">Hasta</Label>
                                    <Input
                                        type="date"
                                        id="end"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full sm:w-[160px] cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                        {!useDateFilter && (
                            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                                ⚠️ <strong>Atención:</strong> Descargar todo el historial ignorando las fechas puede demorar varios minutos o consumir mucha memoria.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. COMERCIAL */}
                <Card className="border-blue-200 hover:border-blue-300 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                            Módulo Comercial Completo
                        </CardTitle>
                        <CardDescription>Cotizaciones, Detalles, Desglose y Producción.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 min-h-[60px]">
                            Extrae un archivo con 4 hojas planas. Contiene toda la cabecera económica calculada, el detalle granular de ítems, y los cálculos de ingeniería generados. Ideal Análisis de Márgenes.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            onClick={() => handleExport('commercial')}
                            disabled={!!loading}
                        >
                            {loading === 'commercial' ? "Extrayendo Datos..." : (
                                <><FileSpreadsheet className="mr-2 h-4 w-4" /> Generar Excel Comercial</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* 2. INVENTARIO */}
                <Card className="border-emerald-200 hover:border-emerald-300 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-800">
                            <Package className="h-6 w-6 text-emerald-600" />
                            Estado de Inventario (Foto Actual)
                        </CardTitle>
                        <CardDescription>Stock, Retazos e Inmovilizados (Zombies)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 min-h-[60px]">
                            Fotografía en tiempo real del almacén. No requiere filtro de fecha (es a "hoy"). Incluye la valorización contable promedio (PMP), prioridades de compra y perfiles muertos.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => handleExport('inventory')}
                            disabled={!!loading}
                        >
                            {loading === 'inventory' ? "Extrayendo Datos..." : (
                                <><FileSpreadsheet className="mr-2 h-4 w-4" /> Generar Excel Inventario</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* 3. KARDEX / MOVIMIENTOS */}
                <Card className="border-orange-200 hover:border-orange-300 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800">
                            <History className="h-6 w-6 text-orange-600" />
                            Kardex de Movimientos Lógicos
                        </CardTitle>
                        <CardDescription>Auditoría de Entradas, Salidas y Ajustes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 min-h-[60px]">
                            Sábana transaccional que documenta paso a paso qué subió y qué bajó en el almacén en el rango de fechas seleccionado. Útil para rastrear mermas o descuadres de stock.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                            onClick={() => handleExport('movements')}
                            disabled={!!loading}
                        >
                            {loading === 'movements' ? "Procesando Transacciones..." : (
                                <><FileSpreadsheet className="mr-2 h-4 w-4" /> Generar Excel Kardex</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* 4. MASTER DATA */}
                <Card className="border-purple-200 hover:border-purple-300 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                            <Database className="h-6 w-6 text-purple-600" />
                            Módulo de Datos Maestros
                        </CardTitle>
                        <CardDescription>Dimensiones de Referencia (Clientes, Prov, Catálogo)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 min-h-[60px]">
                            Exporta el diccionario de datos (Tablas Dimensionales). Ideal para subir a Power BI como tablas Maestras "Catalogos" y cruzar el ID con las tablas de Ventas o Movimientos. No usa filtro de fechas.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            onClick={() => handleExport('master_data')}
                            disabled={!!loading}
                        >
                            {loading === 'master_data' ? "Extrayendo Maestros..." : (
                                <><FileSpreadsheet className="mr-2 h-4 w-4" /> Descargar Tablas Maestras</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    )
}
