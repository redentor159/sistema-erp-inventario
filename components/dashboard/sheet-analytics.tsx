"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export function SheetAnalytics() {
    const { data: abcData, isLoading: loadingABC } = useQuery({
        queryKey: ["dashABC"],
        queryFn: dashboardApi.getABCAnalysis
    })

    const { data: stockRisk, isLoading: loadingRisk } = useQuery({
        queryKey: ["dashStockRisk"],
        queryFn: () => dashboardApi.getStockRealtime({ estado: 'CRITICO' }) // Only fetching critical for monitor
    })

    // Also fetch ALL stock for general table if needed, or just use the critical one for the "Monitor"
    // Let's fetch all eventually for a full view, but for now focus on the "Monitor de Quiebres" request.

    if (loadingABC || loadingRisk) {
        return <div className="p-10 text-center animate-pulse">Analizando inventarios...</div>
    }

    // Process ABC Data for Chart
    // We want to show Bars for Value and Line for Cumulative %
    const chartData = abcData?.slice(0, 20).map(item => ({
        name: item.nombre_completo.substring(0, 15) + "...",
        valor: Number(item.valor_salida),
        acumulado: Number(item.pct_acumulado) * 100, // Convert to %
        class: item.clasificacion_abc
    }))

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-medium">Analítica de Inventarios (ABC & Quiebres)</h3>
                    <p className="text-sm text-muted-foreground">Tesis: Detección temprana de faltantes y concentración de valor.</p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar Datos
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
                {/* Stockout Monitor (The "Red List") */}
                <Card className="flex flex-col border-red-200 dark:border-red-900/50">
                    <CardHeader className="bg-red-50 dark:bg-red-900/10 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Monitor de Quiebres
                                </CardTitle>
                                <CardDescription>SKUs con Stock Agotado o Debajo del Mínimo</CardDescription>
                            </div>
                            <Badge variant="destructive" className="px-3 py-1 text-base">
                                {stockRisk?.length ?? 0} Críticos
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="bg-white dark:bg-gray-950 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead>SKU / Material</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-center">DOH (Días)</TableHead>
                                    <TableHead className="text-right">Reponer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockRisk?.map((item) => (
                                    <TableRow key={item.id_sku}>
                                        <TableCell>
                                            <div className="font-medium text-sm">{item.nombre_completo}</div>
                                            <div className="text-xs text-muted-foreground">{item.unidad_medida}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">
                                            {item.stock_actual}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.dias_inventario === 999
                                                ? <span className="text-gray-400 text-xs">-</span>
                                                : <Badge variant={item.dias_inventario < 3 ? "destructive" : "outline"} className="text-xs">
                                                    {item.dias_inventario.toFixed(1)}d
                                                </Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs font-mono block">
                                                Min: {item.stock_minimo}
                                            </span>
                                            <span className="text-xs font-mono text-blue-600 font-bold">
                                                ROP: {item.punto_pedido}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {stockRisk?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-green-600">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">✓</div>
                                                Excelente. No hay quiebres de stock críticos.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* ABC Analysis Chart */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Análisis de Pareto (ABC)</CardTitle>
                        <CardDescription>Top 20 Materiales por Valor de Consumo (90 días)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="name"
                                    scale="band"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={70}
                                    fontSize={10}
                                />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={11} />
                                <YAxis yAxisId="right" orientation="right" stroke="#ff7300" domain={[0, 100]} fontSize={11} unit="%" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="valor" barSize={20} fill="#413ea0" name="Valor Consumo">
                                    {chartData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.class === 'A' ? "#2563eb" : entry.class === 'B' ? "#60a5fa" : "#94a3b8"} />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke="#ff7300" strokeWidth={2} dot={false} name="% Acumulado" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
