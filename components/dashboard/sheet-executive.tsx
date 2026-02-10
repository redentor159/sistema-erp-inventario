"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { DollarSign, Percent, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function SheetExecutive() {
    const { data: valuation, isLoading: loadingVal } = useQuery({
        queryKey: ["dashValuation"],
        queryFn: dashboardApi.getValuation
    })

    const { data: otifData, isLoading: loadingOtif } = useQuery({
        queryKey: ["dashOtif"],
        queryFn: dashboardApi.getOTIF
    })

    const [currency, setCurrency] = useState<"PEN" | "USD">("PEN")

    if (loadingVal || loadingOtif) {
        return <div className="p-10 text-center animate-pulse">Cargando indicadores estratégicos...</div>
    }

    // Prepare Valuation Data
    const valorTotal = currency === "PEN"
        ? valuation?.valor_inventario_pen ?? 0
        : valuation?.valor_inventario_usd ?? 0

    const currencySymbol = currency === "PEN" ? "S/" : "$"

    // Process OTIF for last month
    const currentOtif = otifData?.[0]
    const otifPct = currentOtif?.pct_otif ?? 0

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-medium">Resumen Ejecutivo de Valorización</h3>
                    <p className="text-sm text-muted-foreground">Estado financiero del inventario y nivel de servicio.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="currency-mode" className="font-bold">PEN</Label>
                    <Switch
                        id="currency-mode"
                        checked={currency === "USD"}
                        onCheckedChange={(checked) => setCurrency(checked ? "USD" : "PEN")}
                    />
                    <Label htmlFor="currency-mode" className="font-bold">USD</Label>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {currencySymbol} {valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valorado a PMP ({currency})
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nivel de Servicio (OTIF)</CardTitle>
                        <CheckCircle2 className={`h-4 w-4 ${otifPct >= 95 ? "text-green-500" : "text-yellow-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{otifPct}%</div>
                        <p className="text-xs text-muted-foreground">
                            Pedidos a tiempo este mes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Materiales Críticos</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{valuation?.skus_criticos ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            SKUs en Stockout Inminente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items (SKUs)</CardTitle>
                        <Factory className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valuation?.total_skus ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Productos registrados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* OTIF History Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Histórico de Cumplimiento (OTIF)</CardTitle>
                        <CardDescription>Evolución del nivel de servicio últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={otifData ? [...otifData].reverse() : []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="mes"
                                        tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short' })}
                                        fontSize={12}
                                    />
                                    <YAxis
                                        tickFormatter={(value: number) => `${value}%`}
                                        domain={[0, 100]}
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, "OTIF"]}
                                        labelFormatter={((label: string) => new Date(label).toLocaleDateString()) as any}
                                    />
                                    <Bar dataKey="pct_otif" radius={[4, 4, 0, 0]}>
                                        {otifData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.pct_otif >= 90 ? "#22c55e" : "#eab308"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for Margen Contribucion (Requires more trx data) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Margen de Contribución</CardTitle>
                        <CardDescription>Ventas vs Costos Directos (Mes Actual)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px]">
                        <div className="text-center text-muted-foreground">
                            <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Datos insuficientes para Margen.</p>
                            <p className="text-xs">Registre salidas de venta para visualizar.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function Factory(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M17 18h1" />
            <path d="M12 18h1" />
            <path d="M7 18h1" />
        </svg>
    )
}
