"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cotizacionesApi } from "@/lib/api/cotizaciones";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CotizacionListItem } from "@/types/cotizaciones";
import { useToastHelper } from "@/lib/hooks/useToastHelper";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableSort } from "@/hooks/useTableSort";

export function CotizacionesList() {
  const router = useRouter();
  const toast = useToastHelper();
  const [data, setData] = useState<CotizacionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const proyecto = (row.nombre_proyecto || "").toLowerCase();
    const cliente = (row.mst_clientes?.nombre_completo || "").toLowerCase();
    return proyecto.includes(lowerQuery) || cliente.includes(lowerQuery);
  });

  const { sortedData: sortedCotizaciones, handleSort, sortConfig } = useTableSort(filteredData);

  const totalPages = Math.ceil(sortedCotizaciones.length / pageSize);
  const paginatedData = sortedCotizaciones.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await cotizacionesApi.getCotizaciones();
      setData(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      // Create empty draft
      console.log("Creating new cotizacion...");
      const newCot = await cotizacionesApi.createCotizacion({
        // Defaults
        id_cliente: undefined,
        nombre_proyecto: "Nuevo Proyecto",
      });

      console.log("Create result:", newCot);

      if (!newCot) {
        toast.error(
          "Error crítico",
          "La API no devolvió ningún dato. Intenta nuevamente.",
        );
        return;
      }

      if (!newCot.id_cotizacion) {
        console.error("CRITICAL: id_cotizacion is missing in", newCot);
        toast.error(
          "Error de creación",
          "Se creó la cotización pero no se recibió el ID. Contacta soporte.",
        );
        return;
      }

      console.log("Redirecting to:", newCot.id_cotizacion);
      router.push(`/cotizaciones/detalle?id=${newCot.id_cotizacion}`);
    } catch (e: any) {
      console.error("Error creating cotizacion:", e);
      toast.error(
        "Error al crear",
        e.message || "No se pudo crear la cotización",
      );
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation(); // Prevent row click
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta cotización? Esta acción no se puede deshacer.",
      )
    )
      return;

    try {
      await cotizacionesApi.deleteCotizacion(id);
      toast.success("Cotización eliminada");
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error("Error al eliminar", error.message);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <CardTitle>Listado Reciente</CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyecto o cliente..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden lg:inline">
                Mostrar:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="bg-white hidden md:block rounded-md shadow-sm ring-1 ring-slate-900/5 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100/80">
              <tr className="text-left">
                <th 
                  className="py-2 px-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("nombre_proyecto")}
                >
                  Proyecto {sortConfig?.key === "nombre_proyecto" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-2 px-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("mst_clientes.nombre_completo")}
                >
                  Cliente {sortConfig?.key === "mst_clientes.nombre_completo" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-2 px-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("fecha_emision")}
                >
                  Fecha {sortConfig?.key === "fecha_emision" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-2 px-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("estado")}
                >
                  Estado {sortConfig?.key === "estado" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-2 px-3 text-sm font-semibold text-right text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("_vc_precio_final_cliente")}
                >
                  Total {sortConfig?.key === "_vc_precio_final_cliente" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-700 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-2 px-3 text-center text-sm text-slate-500 h-24"
                  >
                    No hay cotizaciones registradas.
                  </td>
                </tr>
              )}
              {paginatedData.map((row) => (
                <tr
                  key={row.id_cotizacion}
                  className="border-b border-slate-100/80 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(`/cotizaciones/detalle?id=${row.id_cotizacion}`)
                  }
                >
                  <td className="py-2 px-3 text-sm font-medium text-slate-900">
                    {row.nombre_proyecto || "Sin nombre"}
                  </td>
                  <td className="py-2 px-3 text-sm text-slate-600">
                    {row.mst_clientes?.nombre_completo || "---"}
                  </td>
                  <td className="py-2 px-3 text-sm text-slate-700">
                    {new Date(row.fecha_emision).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md w-fit ${
                        row.estado === "Borrador"
                          ? "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20"
                          : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                      }`}
                    >
                      {row.estado}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm text-right font-bold text-slate-900">
                    {formatCurrency(row._vc_precio_final_cliente || 0)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/cotizaciones/detalle?id=${row.id_cotizacion}`,
                          );
                        }}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDelete(e, row.id_cotizacion)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3">
          {paginatedData.map((row) => (
            <div
              key={row.id_cotizacion}
              className="bg-white rounded-lg p-4 flex flex-col gap-3 shadow-sm ring-1 ring-slate-900/5 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() =>
                router.push(`/cotizaciones/detalle?id=${row.id_cotizacion}`)
              }
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {row.nombre_proyecto || "Sin nombre"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {row.mst_clientes?.nombre_completo || "Cliente No Asignado"}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold flex-shrink-0 ${
                    row.estado === "Borrador"
                      ? "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20"
                      : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                  }`}
                >
                  {row.estado}
                </span>
              </div>

              <div className="flex justify-between items-end border-t border-slate-100/80 pt-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Fecha Emisión
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {new Date(row.fecha_emision).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Total
                  </span>
                  <span className="text-lg font-bold text-slate-900 leading-none">
                    {formatCurrency(row._vc_precio_final_cliente || 0)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/cotizaciones/detalle?id=${row.id_cotizacion}`,
                    );
                  }}
                >
                  Ver Detalles
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100"
                  onClick={(e) => handleDelete(e, row.id_cotizacion)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="p-8 text-center text-muted-foreground border rounded-lg bg-gray-50 text-sm">
              No hay cotizaciones registradas.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.length > 0 ? page * pageSize + 1 : 0} a{" "}
            {Math.min((page + 1) * pageSize, data.length)} de {data.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
