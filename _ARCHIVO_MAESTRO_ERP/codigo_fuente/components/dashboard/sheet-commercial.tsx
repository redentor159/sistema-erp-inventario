"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { DollarSign, Award, Clock, TrendingUp } from "lucide-react"
import { SimpleTooltip } from "@/components/ui/simple-tooltip"

export function SheetCommercial() {
    const { data: conversion } = useQuery({ queryKey: ["dashConv"], queryFn: dashboardApi.getConversion })
    const { data: ticket } = useQuery({ queryKey: ["dashTicket"], queryFn: dashboardApi.getTicket })
    const { data: topProds } = useQuery({ queryKey: ["dashTop"], queryFn: dashboardApi.getTopProducts })
    const { data: margin } = useQuery({ queryKey: ["dashMargen"], queryFn: dashboardApi.getMargin })
    const { data: cycle } = useQuery({ queryKey: ["dashCycle"], queryFn: dashboardApi.getSalesCycle })

    // Pie Chart Data for Funnel
    const funnelData = [
        { name: 'Ganadas', value: conversion?.ganadas || 0, fill: '#22c55e' },
        { name: 'Perdidas', value: conversion?.perdidas || 0, fill: '#ef4444' },
        { name: 'Pendientes', value: conversion?.pendientes || 0, fill: '#eab308' },
    ].filter(x => x.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-medium">Inteligencia Comercial & Financiera</h3>
                    <p className="text-sm text-muted-foreground">Métricas reales de ventas, márgenes y eficiencia de cierre.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            Tasa de Conversión
                            <SimpleTooltip text="% de Cotizaciones que terminan en venta real (Aprobada/Finalizada). Fórmula: (Ganadas / Total) * 100." />
                        </CardTitle>
                        <Award className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversion?.tasa_conversion_pct ?? 0}%</div>
                        <p className="text-xs text-muted-foreground">De cotizaciones aprobadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            Ticket Promedio
                            <SimpleTooltip text="Valor promedio de cada venta cerrada. Ayuda a entender el tamaño típico de tus proyectos." />
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">S/ {ticket?.ticket_promedio_pen?.toLocaleString('es-PE', { maximumFractionDigits: 0 }) ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Por venta cerrada</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            Margen Promedio
                            <SimpleTooltip text="Utilidad Bruta Real. Se calcula restando al Precio de Venta todos los Costos Directos (Materiales + Mano de Obra)." />
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {margin?.[0]?.margen_promedio_pct ?? 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Utilidad Real (Ventas - Costos)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            Ciclo de Venta
                            <SimpleTooltip text="Días promedio que pasan desde que emites la cotización hasta que el cliente la aprueba." />
                        </CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cycle?.dias_promedio_cierre ?? 0} días</div>
                        <p className="text-xs text-muted-foreground">Tiempo promedio de cierre</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Product Mix Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            Top Sistemas Vendidos
                            <SimpleTooltip text="Gráfico de Barras que muestra el volumen de ventas (en S/) acumulado por cada Modelo/Sistema (ej: V-CORREDIZA-20). Te ayuda a identificar tus 'Vacas Lecheras'." />
                        </CardTitle>
                        <CardDescription>Volumen de ventas por Modelo/Sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProds || []} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="id_modelo"
                                        type="category"
                                        width={100}
                                        fontSize={11}
                                        tickFormatter={(val) => val.substring(0, 15)}
                                    />
                                    <Tooltip
                                        formatter={(val: number | undefined) => `S/ ${(val || 0).toLocaleString()}`}
                                        labelStyle={{ color: 'black' }}
                                    />
                                    <Bar dataKey="volumen_ventas_pen" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Conversion Funnel Pie */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            Estado de Cotizaciones
                            <SimpleTooltip text="Gráfico de Pastel (Embudo) que muestra la proporción de obras Ganadas vs Perdidas. Ideal para visualizar la eficiencia global de ventas." />
                        </CardTitle>
                        <CardDescription>Distribución de Obras</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={funnelData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
