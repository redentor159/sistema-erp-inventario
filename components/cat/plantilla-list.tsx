"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catApi } from "@/lib/api/cat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, ImageIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlantillaForm } from "./plantilla-form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableSort } from "@/hooks/useTableSort";

export function PlantillaList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: plantillas, isLoading } = useQuery({
    queryKey: ["catPlantillas"],
    queryFn: catApi.getPlantillas,
  });

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDTOpen, setDeleteDTOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const deleteMutation = useMutation({
    mutationFn: catApi.deletePlantilla,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catPlantillas"] });
      toast({ title: "Plantilla eliminada correctamente", variant: "default" });
      setDeletingId(null);
      setDeleteDTOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar plantilla: " + error.message,
        variant: "destructive",
      });
      setDeletingId(null);
      setDeleteDTOpen(false);
    },
  });

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDTOpen(true);
  };

  const filteredPlantillas =
    plantillas?.filter(
      (p: any) =>
        p.id_plantilla.toLowerCase().includes(search.toLowerCase()) ||
        p.nombre_generico.toLowerCase().includes(search.toLowerCase()) ||
        p.mst_familias?.nombre_familia
          ?.toLowerCase()
          .includes(search.toLowerCase()),
    ) || [];

  const { sortedData: sortedPlantillas, handleSort, sortConfig } = useTableSort(filteredPlantillas);

  const totalPages = Math.ceil(sortedPlantillas.length / pageSize);
  const paginatedPlantillas = sortedPlantillas.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantilla..."
            className="pl-8"
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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
              <DialogDescription>
                Define un nuevo "recetario" base para productos manufacturados.
              </DialogDescription>
            </DialogHeader>
            <PlantillaForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100/80">
              <TableRow>
                <TableHead 
                  className="w-[80px] cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("id_plantilla")}
                >
                  ID {sortConfig?.key === "id_plantilla" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("nombre_generico")}
                >
                  Nombre Genérico {sortConfig?.key === "nombre_generico" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("mst_familias.nombre_familia")}
                >
                  Familia {sortConfig?.key === "mst_familias.nombre_familia" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("mst_series_equivalencias.nombre_comercial")}
                >
                  Sistema {sortConfig?.key === "mst_series_equivalencias.nombre_comercial" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("largo_estandar_mm")}
                >
                  Largo Estándar {sortConfig?.key === "largo_estandar_mm" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm font-semibold text-slate-700"
                  onClick={() => handleSort("peso_teorico_kg")}
                >
                  Peso Teórico {sortConfig?.key === "peso_teorico_kg" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-center py-2 px-3 text-sm font-semibold text-slate-700">Ref.</TableHead>
                <TableHead className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Cargando plantillas...
                  </TableCell>
                </TableRow>
              ) : filteredPlantillas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 py-2 px-3 text-sm text-slate-500">
                    No se encontraron plantillas.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlantillas.map((plantilla: any) => (
                  <TableRow key={plantilla.id_plantilla} className="hover:bg-slate-50 transition-colors border-b border-slate-100/80">
                    <TableCell className="py-2 px-3 font-mono text-xs font-medium text-slate-700">
                      {plantilla.id_plantilla}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm font-medium text-slate-900">
                      {plantilla.nombre_generico}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm text-slate-700">
                      {plantilla.mst_familias?.nombre_familia}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm text-slate-700">
                      {plantilla.mst_series_equivalencias?.nombre_comercial ||
                        "-"}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm text-right text-slate-700">
                      {plantilla.largo_estandar_mm
                        ? `${Number(plantilla.largo_estandar_mm).toLocaleString()} mm`
                        : "-"}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm text-right text-slate-700">
                      {plantilla.peso_teorico_kg
                        ? `${Number(plantilla.peso_teorico_kg).toFixed(3)} Kg/m`
                        : "-"}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm text-center text-slate-700">
                      {plantilla.imagen_ref ? (
                        <a
                          href={plantilla.imagen_ref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center"
                        >
                          <ImageIcon className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPlantilla(plantilla)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(plantilla.id_plantilla)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 hover:bg-red-50" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View (Plantilla List) */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Cargando plantillas...
            </div>
          ) : filteredPlantillas.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No se encontraron plantillas.
            </div>
          ) : (
            paginatedPlantillas.map((plantilla: any) => (
              <div
                key={plantilla.id_plantilla}
                className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                        {plantilla.nombre_generico}
                      </h4>
                      {plantilla.imagen_ref && (
                        <a
                          href={plantilla.imagen_ref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      ID: {plantilla.id_plantilla}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20 px-1.5 py-0.5 rounded-sm font-medium">
                        Fam: {plantilla.mst_familias?.nombre_familia || "-"}
                      </span>
                      <span className="text-[10px] bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20 px-1.5 py-0.5 rounded-sm font-medium">
                        Sis:{" "}
                        {plantilla.mst_series_equivalencias?.nombre_comercial ||
                          "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPlantilla(plantilla)}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(plantilla.id_plantilla)}
                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-slate-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs mt-1 bg-slate-50 px-3 py-2 rounded-md border border-slate-100/80">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Largo Est.
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {plantilla.largo_estandar_mm
                        ? `${Number(plantilla.largo_estandar_mm).toLocaleString()} mm`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Peso Teórico
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {plantilla.peso_teorico_kg
                        ? `${Number(plantilla.peso_teorico_kg).toFixed(3)} Kg/m`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredPlantillas.length > 0 ? page * pageSize + 1 : 0}{" "}
            a {Math.min((page + 1) * pageSize, filteredPlantillas.length)} de{" "}
            {filteredPlantillas.length}
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

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPlantilla}
        onOpenChange={(open) => !open && setEditingPlantilla(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
            <DialogDescription>
              Modificar los datos de la plantilla existente.
            </DialogDescription>
          </DialogHeader>
          {editingPlantilla && (
            <PlantillaForm
              initialData={editingPlantilla}
              onSuccess={() => setEditingPlantilla(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDTOpen} onOpenChange={setDeleteDTOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Está seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Eliminará la plantilla
              permanentemente. Asegúrese de que no haya productos vinculados a
              esta plantilla antes de eliminarla.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDTOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
