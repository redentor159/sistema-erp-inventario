"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Bone, Gem } from "lucide-react";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

export function SheetAnalytics() {
  const [abcDays, setAbcDays] = useState<number | null>(90); // Default 90 days
  const [abcType, setAbcType] = useState<"CONSUMPTION" | "INVENTORY">(
    "CONSUMPTION",
  );

  // 1. Query for CONSUMPTION (Dynamic Days)
  const { data: abcConsumption, isLoading: loadingConsumption } = useQuery({
    queryKey: ["dashABC", abcDays],
    queryFn: () => dashboardApi.getDynamicABC(abcDays),
    enabled: abcType === "CONSUMPTION",
  });

  // 2. Query for INVENTORY VALUE (Snapshot)
  const { data: abcInventory, isLoading: loadingInventory } = useQuery({
    queryKey: ["dashABCInventory"],
    queryFn: dashboardApi.getABCInventoryValuation,
    enabled: abcType === "INVENTORY",
  });

  const { data: stockRisk, isLoading: loadingRisk } = useQuery({
    queryKey: ["dashStockRisk"],
    queryFn: dashboardApi.getStockCritico,
  });

  const { data: zombies, isLoading: loadingZombies } = useQuery({
    queryKey: ["dashZombies"],
    queryFn: dashboardApi.getZombies,
  });

  const { data: retazos } = useQuery({
    queryKey: ["dashRetazos"],
    queryFn: dashboardApi.getRetazos,
  });

  // Also fetch ALL stock for general table if needed, or just use the critical one for the "Monitor"
  // Let's fetch all eventually for a full view, but for now focus on the "Monitor de Quiebres" request.

  if (loadingRisk) {
    return (
      <div className="p-10 text-center animate-pulse">
        Analizando inventarios...
      </div>
    );
  }

  // Determine which dataset to use
  const rawData = abcType === "CONSUMPTION" ? abcConsumption : abcInventory;
  const loadingABC =
    abcType === "CONSUMPTION" ? loadingConsumption : loadingInventory;

  // Process ABC Data for Chart
  const chartData = rawData?.map((item: any) => ({
    name: item.nombre_completo.substring(0, 15) + "...",
    full_name: item.nombre_completo,
    valor: Number(
      abcType === "CONSUMPTION" ? item.valor_salida : item.metric_value,
    ), // Field name differs
    acumulado: Number(item.pct_acumulado) * 100,
    class: item.clasificacion_abc,
  }));

  return (
    <div className="space-y-6 p-1">
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
        <div>
          <h3 className="text-lg font-medium">
            Analítica de Inventarios (ABC & Quiebres)
          </h3>
          <p className="text-sm text-muted-foreground">
            Tesis: Detección temprana de faltantes y concentración de valor.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar Datos
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {/* Stockout Monitor (The "Red List") */}
        <Card className="flex flex-col border-red-200 dark:border-red-900/50">
          <CardHeader className="bg-red-50 dark:bg-red-900/10 pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Monitor de Quiebres
                  <SimpleTooltip
                    text="Lista en tiempo real de materiales que necesitan reposición urgente (Stock <= Mínimo)."
                    className="text-red-600"
                  />
                </CardTitle>
                <CardDescription>
                  SKUs con Stock Agotado o Debajo del Mínimo
                </CardDescription>
              </div>
              <Badge variant="destructive" className="px-3 py-1 text-base">
                {stockRisk?.length ?? 0} Críticos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[350px] overflow-auto">
              <Table>
                <TableHeader className="bg-white dark:bg-gray-950 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>SKU / Material</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Reponer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockRisk?.map((item) => (
                    <TableRow key={item.id_sku}>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {item.nombre_completo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.unidad_medida}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {item.stock_actual}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs font-mono text-blue-600 font-bold">
                          ROP: {item.punto_pedido}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {stockRisk?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-green-600"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            ✓
                          </div>
                          Excelente. No hay quiebres de stock críticos.
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Zombie Stock Table */}
        <Card className="flex flex-col border-orange-200 bg-orange-50/20 dark:bg-orange-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                <Bone className="h-5 w-5" />
                Inventario Zombie
                <SimpleTooltip
                  text="Productos con Stock > 0 que NO han tenido salidas en los últimos 90 días. Capital estancado que deberías liquidar."
                  className="text-orange-600"
                />
              </CardTitle>
              <CardDescription>Top 10 Estancados por Valor</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[350px]">
            <div className="space-y-4">
              {zombies?.map((item: any) => (
                <div
                  key={item.id_sku}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.nombre_completo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.id_sku} • {item.stock_actual} {item.unidad_medida}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-orange-600 block">
                      S/ {item.valor_estancado?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Inmóvil &gt; 90 días
                    </span>
                  </div>
                </div>
              ))}
              {(!zombies || zombies.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Bone className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  ¡Genial! No tienes inventario zombie.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* ABC Analysis Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col h-[450px]">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    Análisis de Pareto (ABC)
                    <SimpleTooltip text="Clasificación según valor. A: 80% del valor, B: 15%, C: 5%." />
                  </CardTitle>
                  <CardDescription>
                    {abcType === "CONSUMPTION"
                      ? "Valor de Consumo (Movimiento)"
                      : "Valor de Inventario Actual (Estancado)"}
                  </CardDescription>
                </div>

                {/* TYPE TOGGLE */}
                <div className="flex bg-muted rounded-lg p-1 gap-1">
                  <Button
                    variant={abcType === "CONSUMPTION" ? "default" : "ghost"} // Darker when active
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() => setAbcType("CONSUMPTION")}
                  >
                    Consumo
                  </Button>
                  <Button
                    variant={abcType === "INVENTORY" ? "default" : "ghost"} // Darker when active
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() => setAbcType("INVENTORY")}
                  >
                    Valor Actual
                  </Button>
                </div>
              </div>

              {/* TIMEFRAME SELECTOR (Only for CONSUMPTION) */}
              {abcType === "CONSUMPTION" && (
                <div className="flex justify-end">
                  <div className="flex bg-muted rounded-lg p-1 gap-1">
                    <Button
                      variant={abcDays === 90 ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-6 text-[10px] px-2 ${abcDays === 90 ? "bg-gray-300 dark:bg-gray-700 font-bold" : ""}`}
                      onClick={() => setAbcDays(90)}
                    >
                      90d
                    </Button>
                    <Button
                      variant={abcDays === 180 ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-6 text-[10px] px-2 ${abcDays === 180 ? "bg-gray-300 dark:bg-gray-700 font-bold" : ""}`}
                      onClick={() => setAbcDays(180)}
                    >
                      180d
                    </Button>
                    <Button
                      variant={abcDays === 365 ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-6 text-[10px] px-2 ${abcDays === 365 ? "bg-gray-300 dark:bg-gray-700 font-bold" : ""}`}
                      onClick={() => setAbcDays(365)}
                    >
                      1a
                    </Button>
                    <Button
                      variant={abcDays === null ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-6 text-[10px] px-2 ${abcDays === null ? "bg-gray-300 dark:bg-gray-700 font-bold" : ""}`}
                      onClick={() => setAbcDays(null)}
                    >
                      Total
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 w-full min-h-0">
            {loadingABC ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Calculando Clasificación ABC...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis
                    dataKey="name"
                    scale="band"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    fontSize={10}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-900 border p-2 rounded shadow text-xs">
                            <p className="font-bold">{data.full_name}</p>
                            <p>Valor: S/ {data.valor.toLocaleString()}</p>
                            <p>Clase: {data.class}</p>
                            <p>Acumulado: {data.acumulado.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="valor"
                    name={
                      abcType === "CONSUMPTION"
                        ? "Consumo (S/)"
                        : "Valor Stock (S/)"
                    }
                    barSize={20}
                    fill="#4f46e5"
                  >
                    {chartData?.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.class === "A"
                            ? "#2563eb"
                            : entry.class === "B"
                              ? "#60a5fa"
                              : "#94a3b8"
                        }
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="acumulado"
                    name="% Acumulado"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Offcut Treasure Card - Fixed Height/Grid */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/10 h-[450px]">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-400 gap-2">
              <Gem className="h-5 w-5" />
              Tesoro Oculto (Retazos)
              <SimpleTooltip
                text="Valor económico estimado de los retazos disponibles."
                className="text-emerald-600"
              />
            </CardTitle>
            <CardDescription>Material recuperable en planta</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full pb-10 text-center space-y-4">
            <div className="p-4 bg-emerald-100 rounded-full dark:bg-emerald-900/50">
              <Gem className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">
                S/{" "}
                {retazos?.valor_recuperable_pen?.toLocaleString("es-PE", {
                  maximumFractionDigits: 0,
                }) ?? 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Valor Estimado Recuperable
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 w-full max-w-xs mt-4">
              <div>
                <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                  {retazos?.cantidad_retazos ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Piezas Útiles</p>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                  {retazos?.total_metros_lineales?.toFixed(1) ?? 0} m
                </div>
                <p className="text-xs text-muted-foreground">Metros Lineales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
