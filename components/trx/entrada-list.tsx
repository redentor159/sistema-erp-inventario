"use client";

import { useQuery } from "@tanstack/react-query";
import { trxApi } from "@/lib/api/trx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Truck, ArrowDownRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EntradaFormCmp } from "./entrada-form";
import { EntradaDetail } from "./entrada-detail";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTableSort } from "@/hooks/useTableSort";

export function EntradaList({ active }: { active: boolean }) {
  const [search, setSearch] = useState("");
  const { data: entradas, isLoading } = useQuery({
    queryKey: ["trxEntradas", search],
    queryFn: () => trxApi.getEntradas({ search }),
    enabled: active,
  });

  const [open, setOpen] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState<any>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const { sortedData: sortedEntradas, handleSort, sortConfig } = useTableSort(entradas || [], { key: "fecha_registro", direction: "desc" });

  const totalPages = Math.ceil((sortedEntradas?.length || 0) / pageSize);
  const paginatedEntradas = sortedEntradas?.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  const getTipoBadgeClass = (tipo: string) => {
    const t = tipo?.toUpperCase() || "";
    if (t.includes("COMPRA")) return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
    if (t.includes("AJUSTE")) return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
    if (t.includes("VENTA")) return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
    if (t.includes("PRODUCCION")) return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";
    if (t.includes("BAJA") || t.includes("MERMA") || t.includes("CONSUMO")) return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
    return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20";
  };

  if (isLoading && active)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando entradas...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Header / Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 items-center">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">
            Registro de Compras (Entradas)
          </h3>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-[250px] bg-white rounded-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedor, documento..."
              className="pl-8 bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
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

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Entrada de Mercadería</DialogTitle>
                <DialogDescription>
                  Ingrese los detalles de la factura de compra o guía de
                  remisión.
                </DialogDescription>
              </DialogHeader>
              <EntradaFormCmp onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <EntradaDetail
        open={!!selectedEntrada}
        headerInfo={selectedEntrada}
        onOpenChange={(open) => !open && setSelectedEntrada(null)}
        id={selectedEntrada?.id_entrada}
      />

      <div className="bg-white rounded-md shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100/80">
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("fecha_registro")}
                >
                  Fecha {sortConfig?.key === "fecha_registro" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("tipo_entrada")}
                >
                  Tipo {sortConfig?.key === "tipo_entrada" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("mst_proveedores.razon_social")}
                >
                  Proveedor {sortConfig?.key === "mst_proveedores.razon_social" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("nro_documento_fisico")}
                >
                  Documento {sortConfig?.key === "nro_documento_fisico" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("moneda")}
                >
                  Moneda {sortConfig?.key === "moneda" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("estado")}
                >
                  Estado {sortConfig?.key === "estado" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntradas?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-sm text-muted-foreground py-2 px-3"
                  >
                    No se encontraron entradas con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
              {paginatedEntradas?.map((ent: any) => (
                <TableRow
                  key={ent.id_entrada}
                  className="border-b border-slate-100/80 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEntrada(ent)}
                >
                  <TableCell className="py-2 px-3 text-sm text-slate-700">
                    {format(new Date(ent.fecha_registro), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getTipoBadgeClass(ent.tipo_entrada)}`}>
                      {ent.tipo_entrada.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm font-medium text-slate-900">
                    {ent.mst_proveedores?.razon_social || "Sin Proveedor"}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm text-slate-700">{ent.nro_documento_fisico || "-"}</TableCell>
                  <TableCell className="py-2 px-3 text-sm text-slate-700">{ent.moneda}</TableCell>
                  <TableCell className="py-2 px-3 text-sm">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md w-fit ${
                        ent.estado === "INGRESADO"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                          : ent.estado === "BORRADOR"
                            ? "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20"
                            : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                      }`}
                    >
                      {ent.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2 px-3 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntrada(ent);
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View (Activity Feed) */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {sortedEntradas?.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No se encontraron entradas con los filtros actuales.
            </div>
          )}
          {paginatedEntradas?.map((ent: any) => (
            <div
              key={ent.id_entrada}
              className="p-4 flex flex-col gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => setSelectedEntrada(ent)}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowDownRight className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {ent.mst_proveedores?.razon_social || "Sin Proveedor"}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getTipoBadgeClass(ent.tipo_entrada)}`}>
                        {ent.tipo_entrada.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center">
                        Doc: {ent.nro_documento_fisico || "S/D"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold ${
                      ent.estado === "INGRESADO"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : ent.estado === "BORRADOR"
                          ? "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20"
                          : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                    }`}
                  >
                    {ent.estado}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-1 bg-slate-50 px-3 py-2 rounded-md border border-slate-100/80">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    Fecha Registro
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {format(new Date(ent.fecha_registro), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    Moneda Repos.
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {ent.moneda}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando{" "}
            {sortedEntradas && sortedEntradas.length > 0
              ? page * pageSize + 1
              : 0}{" "}
            a {Math.min((page + 1) * pageSize, sortedEntradas?.length || 0)} de{" "}
            {sortedEntradas?.length || 0}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
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
              disabled={page >= totalPages - 1 || isLoading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
