"use client";

import { useQuery } from "@tanstack/react-query";
import { trxApi } from "@/lib/api/trx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { useTableSort } from "@/hooks/useTableSort";

export function StockList({ active }: { active: boolean }) {
  const { data: stock, isLoading } = useQuery({
    queryKey: ["vwStockRealtime"],
    queryFn: trxApi.getStockRealtime,
    enabled: active,
  });

  const { sortedData: sortedStock, handleSort, sortConfig } = useTableSort(stock || []);

  if (!active) return null;

  return (
    <div className="border rounded-md bg-white dark:bg-gray-800">
      {isLoading ? (
        <div className="p-8 text-center">
          Calculando PMP y Stock en tiempo real...
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100/80">
            <TableRow>
              <TableHead 
                className="w-[100px] font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                onClick={() => handleSort("id_sku")}
              >
                SKU {sortConfig?.key === "id_sku" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                onClick={() => handleSort("nombre_completo")}
              >
                Producto {sortConfig?.key === "nombre_completo" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                onClick={() => handleSort("nombre_familia")}
              >
                Familia / Marca {sortConfig?.key === "nombre_familia" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="text-right font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                onClick={() => handleSort("stock_actual")}
              >
                Stock Actual {sortConfig?.key === "stock_actual" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="text-right font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                onClick={() => handleSort("costo_promedio")}
              >
                PMP (Unit) {sortConfig?.key === "costo_promedio" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="text-right font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                onClick={() => handleSort("inversion_total")}
              >
                Inversión Total {sortConfig?.key === "inversion_total" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[100px] font-semibold py-2 px-3 text-sm text-slate-700">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStock?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-sm text-muted-foreground py-2 px-3"
                >
                  No hay data de stock disponible.
                </TableCell>
              </TableRow>
            )}
            {sortedStock?.map((item: any) => {
              const isNegative = item.stock_actual < 0;
              const isPositive = item.stock_actual > 0;
              const pmp = Number(item.costo_promedio);
              const inversion = Number(item.inversion_total);

              // Reglas de color (AppSheet Réplica)
              // Rojo si < 0
              // Verde si > 0
              const rowClass = isNegative ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-slate-50 transition-colors";
              const stockClass = isNegative
                ? "text-red-600 font-bold"
                : isPositive
                  ? "text-green-600 font-bold"
                  : "text-slate-500";

              return (
                <TableRow key={item.id_sku} className={`border-b border-slate-100/80 ${rowClass}`}>
                  <TableCell className="font-mono text-xs font-medium py-2 px-3 text-slate-900">
                    {item.id_sku}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">
                        {item.nombre_completo}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.unidad_medida}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col text-xs text-slate-700">
                      <span>{item.nombre_familia}</span>
                      <span className="text-slate-500">
                        {item.nombre_marca}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right text-sm py-2 px-3 ${stockClass}`}>
                    {Number(item.stock_actual).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs py-2 px-3 text-slate-700">
                    {pmp.toLocaleString("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm py-2 px-3 text-slate-900">
                    {inversion.toLocaleString("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    })}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    {isNegative && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Quiebre
                      </Badge>
                    )}
                    {isPositive && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-green-600 border-green-600 bg-green-50"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        OK
                      </Badge>
                    )}
                    {!isPositive && !isNegative && (
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        Cero
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
