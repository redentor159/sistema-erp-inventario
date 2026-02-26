"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cotizacionesApi } from "@/lib/api/cotizaciones";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReporteDesglose } from "@/types/cotizaciones";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Calculator, FileText } from "lucide-react";

interface CotizacionDespieceDialogProps {
  idCotizacion: string;
  idLineaCot?: string; // Optional: if provided, shows only that item initially
  trigger?: React.ReactNode;
}

export function CotizacionDespieceDialog({
  idCotizacion,
  idLineaCot,
  trigger,
}: CotizacionDespieceDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  const { data: reporte, isLoading } = useQuery<ReporteDesglose[]>({
    queryKey: ["reporteDesglose", idCotizacion],
    queryFn: () => cotizacionesApi.getReporteDesglose(idCotizacion),
    enabled: open,
  });

  const { data: cotizacion } = useQuery({
    queryKey: ["cotizacion", idCotizacion],
    queryFn: () => cotizacionesApi.getCotizacionById(idCotizacion),
    enabled: open,
  });

  // Determine mode: Global (all items) or Single Item
  const isGlobal = !idLineaCot;

  const processedData = (reporte || [])
    .filter((item) => {
      // Filter by item if in Single Item mode
      if (!isGlobal && item.id_linea_cot && idLineaCot) {
        return item.id_linea_cot === idLineaCot;
      }
      return true;
    })
    .map((item) => {
      // The view returns 'cantidad_unitaria' (material per window) and 'cantidad_item' (number of windows)
      // If Global: Material Total = Unitaria * ItemQty
      // If Local: Material Total = Unitaria

      // SAFEGUARDS: The view might return nulls if left join fails, handle safely.
      const qtyItem = item.cantidad_item || 1;
      const qtyUnit = item.cantidad_unitaria || 0; // This is material per window
      const costUnit = item.costo_unitario || 0; // This is cost per material unit (or set of material for 1 window)

      let displayQty = 0;
      let displayCost = 0;

      if (isGlobal) {
        // Global: Sum of all windows
        displayQty = qtyUnit * qtyItem;
        displayCost = costUnit * qtyItem;
      } else {
        // Unitary: Just one window
        displayQty = qtyUnit;
        displayCost = costUnit;
      }

      return {
        ...item,
        _displayQty: displayQty,
        _displayCost: displayCost,
        _qtyItem: qtyItem,
      };
    })
    .sort((a, b) => {
      // Sort: Perfil first, then others
      if (a.tipo_componente === "Perfil" && b.tipo_componente !== "Perfil")
        return -1;
      if (a.tipo_componente !== "Perfil" && b.tipo_componente === "Perfil")
        return 1;
      return 0;
    });

  const data = processedData;

  const costByComponent = data.reduce(
    (acc, item) => {
      const type = item.tipo_componente || "Otros";
      acc[type] = (acc[type] || 0) + (item._displayCost || 0);
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(costByComponent).map(([name, value]) => ({
    name,
    value,
  }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Calculate Totals
  const totalCostoDirecto = data.reduce(
    (sum, item) => sum + (item._displayCost || 0),
    0,
  );

  // Markup and Price Logic
  // Normalize margin: database stores 0.35 for 35%.
  // If it happens to be > 1 (legacy 1.35), we normalize it.
  let margin = cotizacion?.markup_aplicado ?? 0.35;
  if (margin > 1) margin = margin - 1;

  // Price = Cost * (1 + Margin)
  const totalPrecioVenta = totalCostoDirecto * (1 + margin);
  const markupPercentage = (margin * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Ver Despiece {isGlobal ? "Global" : "Detallado"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] w-full h-[95vh] flex flex-col p-0 gap-0 sm:max-w-[98vw]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {isGlobal
              ? "Desglose Global de Materiales (Proyecto Completo)"
              : "Desglose Unitario de Ingeniería (Por Ítem)"}
          </DialogTitle>
          <DialogDescription>
            {isGlobal
              ? "Listado consolidado de materiales para todos los ítems del proyecto."
              : "Detalle de materiales requeridos para FABRICAR UNA UNIDAD de este ítem."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          <Tabs
            defaultValue="detallado"
            className="w-full h-full flex flex-col"
          >
            <TabsList className="mb-4 w-min">
              <TabsTrigger value="detallado">Detallado (Tabla)</TabsTrigger>
              <TabsTrigger value="resumen">Resumen (Gráfico)</TabsTrigger>
            </TabsList>

            <TabsContent
              value="detallado"
              className="flex-1 overflow-auto border rounded-md relative flex flex-col"
            >
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>SKU / Componente</TableHead>
                      <TableHead>Etiqueta / Ubicación</TableHead>
                      <TableHead className="text-right">
                        Medida (mm) / Cant.
                      </TableHead>
                      <TableHead className="text-right">
                        {isGlobal ? "Costo Unitario" : "Costo Unit Ref"}
                      </TableHead>
                      <TableHead className="text-right">
                        {isGlobal ? "Costo Total Proyecto" : "Costo Total"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No hay datos de ingeniería generados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-xs">
                            {row.tipo_componente}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">
                                {row.nombre_componente}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {row.sku_real}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span>{row.etiqueta_item}</span>
                              <span className="text-muted-foreground">
                                {row.ubicacion}
                              </span>
                              {isGlobal && (
                                <span className="text-blue-600 font-bold mt-1">
                                  (Cant: {row._qtyItem})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {row.tipo_componente === "Perfil" ? (
                              <>
                                {Math.round(row.medida_corte_mm)} mm
                                <span className="text-muted-foreground ml-1">
                                  x {row._displayQty?.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>
                                {row._displayQty?.toFixed(2)}{" "}
                                {row.unidad_medida}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {formatCurrency(row.costo_mercado_unit)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-sm">
                            {formatCurrency(row._displayCost)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Sticky Footer for Total */}
              <div className="sticky bottom-0 bg-slate-100 border-t p-4 flex flex-col md:flex-row justify-between items-center z-10 gap-4">
                <span className="font-semibold text-sm text-slate-500">
                  {data.length} ítems de ingeniería
                </span>

                <div className="flex items-center gap-8 bg-white p-2 rounded-md border shadow-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">
                      Costo Directo {isGlobal ? "Total" : "Unitario"}
                    </span>
                    <span className="text-lg font-bold text-slate-700">
                      {formatCurrency(totalCostoDirecto)}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-300"></div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">
                      Markup ({markupPercentage}%)
                    </span>
                    <span className="text-sm font-mono text-slate-600">
                      x {(1 + margin).toFixed(2)}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-300"></div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-blue-600 font-bold">
                      Precio Venta {isGlobal ? "Total" : "Unitario"}
                    </span>
                    <span className="text-xl font-bold text-blue-700">
                      {formatCurrency(totalPrecioVenta)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resumen" className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center p-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) =>
                          formatCurrency(Number(value))
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resumen de Costos</h3>
                  <div className="space-y-2">
                    {chartData.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center p-2 bg-slate-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-bold">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-2 bg-slate-100 rounded border-t border-slate-200 mt-4">
                      <span className="font-bold">Total Costo Directo</span>
                      <span className="font-bold text-lg text-blue-600">
                        {formatCurrency(
                          chartData.reduce((sum, item) => sum + item.value, 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
