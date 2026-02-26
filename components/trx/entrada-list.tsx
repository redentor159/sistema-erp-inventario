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

export function EntradaList({ active }: { active: boolean }) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "fecha_registro", direction: "desc" });

  const { data: entradas, isLoading } = useQuery({
    queryKey: ["trxEntradas", search],
    queryFn: () => trxApi.getEntradas({ search }),
    enabled: active,
  });

  const [open, setOpen] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState<any>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  // SORTING LOGIC
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEntradas = React.useMemo(() => {
    if (!entradas) return [];
    const sorted = [...entradas];
    if (sortConfig) {
      sorted.sort((a, b) => {
        // Handle nested properties if needed, e.g. provider name
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "proveedor") {
          valA = a.mst_proveedores?.razon_social || "";
          valB = b.mst_proveedores?.razon_social || "";
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [entradas, sortConfig]);

  const totalPages = Math.ceil((sortedEntradas?.length || 0) / pageSize);
  const paginatedEntradas = sortedEntradas?.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

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
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
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

      <div className="border rounded-md bg-white dark:bg-gray-800 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("fecha_registro")}
                >
                  Fecha{" "}
                  {sortConfig?.key === "fecha_registro" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("tipo_entrada")}
                >
                  Tipo{" "}
                  {sortConfig?.key === "tipo_entrada" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("proveedor")}
                >
                  Proveedor{" "}
                  {sortConfig?.key === "proveedor" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("nro_documento_fisico")}
                >
                  Documento{" "}
                  {sortConfig?.key === "nro_documento_fisico" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntradas?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No se encontraron entradas con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
              {paginatedEntradas?.map((ent: any) => (
                <TableRow
                  key={ent.id_entrada}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEntrada(ent)}
                >
                  <TableCell>
                    {format(new Date(ent.fecha_registro), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{ent.tipo_entrada}</TableCell>
                  <TableCell className="font-medium">
                    {ent.mst_proveedores?.razon_social || "Sin Proveedor"}
                  </TableCell>
                  <TableCell>{ent.nro_documento_fisico || "-"}</TableCell>
                  <TableCell>{ent.moneda}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ent.estado === "INGRESADO"
                          ? "default"
                          : ent.estado === "BORRADOR"
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        ent.estado === "INGRESADO"
                          ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                          : ""
                      }
                    >
                      {ent.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
              className="p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => setSelectedEntrada(ent)}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowDownRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                      {ent.mst_proveedores?.razon_social || "Sin Proveedor"}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-mono bg-white dark:bg-gray-900 text-gray-500 uppercase px-1.5 py-0"
                      >
                        {ent.tipo_entrada}
                      </Badge>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center">
                        Doc: {ent.nro_documento_fisico || "S/D"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    variant={
                      ent.estado === "INGRESADO"
                        ? "default"
                        : ent.estado === "BORRADOR"
                          ? "outline"
                          : "secondary"
                    }
                    className={
                      ent.estado === "INGRESADO"
                        ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 text-[10px] px-2 py-0.5"
                        : "text-[10px] px-2 py-0.5"
                    }
                  >
                    {ent.estado}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-1 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-md border border-slate-100 dark:border-slate-800">
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
