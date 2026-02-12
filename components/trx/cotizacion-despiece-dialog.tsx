"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
import { formatCurrency } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReporteDesglose } from "@/types/cotizaciones"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Calculator, FileText } from "lucide-react"

interface CotizacionDespieceDialogProps {
    idCotizacion: string
    idLineaCot?: string // Optional: if provided, shows only that item initially
    trigger?: React.ReactNode
}

export function CotizacionDespieceDialog({ idCotizacion, idLineaCot, trigger }: CotizacionDespieceDialogProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("resumen")

    const { data: reporte, isLoading } = useQuery<ReporteDesglose[]>({
        queryKey: ['reporteDesglose', idCotizacion],
        queryFn: () => cotizacionesApi.getReporteDesglose(idCotizacion),
        enabled: open
    })

    // Filter logic
    // If idLineaCot is passed, we might want to default to filtering by it, 
    // but the requirement is to see BOTH item and global.
    // So we can have a selector or just show all and allow filtering.
    // For now, let's show Global by default, and if idLineaCot is passed, maybe highlight or filter?
    // Let's keep it simple: "Global" tab and "Por Ítem" tab? 
    // Or just a table with filters.

    const data = reporte || []

    const costByComponent = data.reduce((acc, item) => {
        const type = item.tipo_componente || 'Otros'
        acc[type] = (acc[type] || 0) + (item.costo_total_item || 0)
        return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(costByComponent).map(([name, value]) => ({ name, value }))
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Despiece Detallado
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Desglose de Ingeniería y Costos</DialogTitle>
                    <DialogDescription>
                        Vista detallada de materiales, cortes y costos calculados.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="detallado" className="w-full">
                    <TabsList>
                        <TabsTrigger value="detallado">Detallado (Tabla)</TabsTrigger>
                        <TabsTrigger value="resumen">Resumen (Gráfico)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detallado" className="space-y-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>SKU / Componente</TableHead>
                                        <TableHead>Etiqueta / Ubicación</TableHead>
                                        <TableHead className="text-right">Medida (mm) / Cant.</TableHead>
                                        <TableHead className="text-right">Costo Unit Ref</TableHead>
                                        <TableHead className="text-right">Costo Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell>
                                        </TableRow>
                                    ) : data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">No hay datos de ingeniería generados.</TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium text-xs">{row.tipo_componente}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">{row.nombre_componente}</span>
                                                        <span className="text-xs text-muted-foreground">{row.sku_real}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>{row.etiqueta_item}</span>
                                                        <span className="text-muted-foreground">{row.ubicacion}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-xs">
                                                    {row.tipo_componente === 'Perfil' ? (
                                                        <>
                                                            {Math.round(row.medida_corte_mm)} mm
                                                            <span className="text-muted-foreground ml-1">x {row.cantidad_insumo_total}</span>
                                                        </>
                                                    ) : (
                                                        <span>{row.cantidad_insumo_total} {row.unidad_medida}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                                    {formatCurrency(row.costo_mercado_unit)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-sm">
                                                    {formatCurrency(row.costo_total_item)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="resumen">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center p-4">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Resumen de Costos</h3>
                                <div className="space-y-2">
                                    {chartData.map((item, index) => (
                                        <div key={item.name} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span>{item.name}</span>
                                            </div>
                                            <span className="font-bold">{formatCurrency(item.value)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-2 bg-slate-100 rounded border-t border-slate-200 mt-4">
                                        <span className="font-bold">Total Costo Directo</span>
                                        <span className="font-bold text-lg text-blue-600">
                                            {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
