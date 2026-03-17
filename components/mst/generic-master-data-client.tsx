"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableSort } from "@/hooks/useTableSort";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface GenericMasterDataClientProps {
  tableName: string;
  idColumn: string;
  nameColumn: string;
  extraColumn?: string;
  labels: {
    title: string;
    id: string;
    name: string;
    extra?: string;
  };
  isAdmin: boolean;
}

export function GenericMasterDataClient({
  tableName,
  idColumn,
  nameColumn,
  extraColumn,
  labels,
  isAdmin,
}: GenericMasterDataClientProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Data Fetching
  const { data, isLoading } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order(nameColumn);
      if (error) throw error;
      return data as any[];
    },
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const isEditing = !!selectedItem;
      if (isEditing) {
        const { error } = await supabase
          .from(tableName)
          .update(payload)
          .eq(idColumn, selectedItem[idColumn]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Éxito",
        description: `Registro ${selectedItem ? "actualizado" : "creado"} correctamente.`,
      });
      setIsFormOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el registro.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tableName).delete().eq(idColumn, id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Eliminado",
        description: "El registro ha sido eliminado correctamente.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      // Intercept 23503: Foreign Key Violation
      if (error.code === "23503") {
        toast({
          variant: "destructive",
          title: "Acción denegada",
          description:
            "Este registro está siendo utilizado por otros productos o transacciones y no puede ser eliminado.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo eliminar el registro.",
        });
      }
      setIsDeleteDialogOpen(false);
    },
  });

  // Filter & Sort
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item[nameColumn]?.toLowerCase().includes(search.toLowerCase()) ||
      item[idColumn]?.toString().toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, idColumn, nameColumn]);

  const { sortedData, handleSort, sortConfig } = useTableSort(filteredData);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleOpenForm = (item?: any) => {
    setSelectedItem(item || null);
    setFormData(item || {});
    setIsFormOpen(true);
  };

  const handleConfirmDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-md ring-1 ring-slate-900/5 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Buscar por ${labels.name}...`}
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
          <span className="text-sm text-muted-foreground hidden md:inline">Mostrar:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v));
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
          {isAdmin && (
            <Button onClick={() => handleOpenForm()} className="shadow-sm ml-2">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm ring-1 ring-slate-900/5 overflow-hidden pointer-events-auto">
        <div className="hidden md:block overflow-x-auto">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-slate-50 border-b border-slate-100/80">
              <TableRow>
                <TableHead
                  className="font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                  onClick={() => handleSort(idColumn)}
                >
                  {labels.id} {sortConfig?.key === idColumn && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                  onClick={() => handleSort(nameColumn)}
                >
                  {labels.name} {sortConfig?.key === nameColumn && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                {extraColumn && (
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3 text-sm text-slate-700"
                    onClick={() => handleSort(extraColumn)}
                  >
                    {labels.extra} {sortConfig?.key === extraColumn && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {isAdmin && <TableHead className="text-right font-semibold w-[100px] py-2 px-3 text-sm text-slate-700">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={extraColumn ? 4 : 3} className="text-center h-24 text-sm text-muted-foreground py-2 px-3">
                    No se encontraron registros.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow
                    key={item[idColumn]}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100/80"
                  >
                    <TableCell className="font-medium py-2 px-3 text-sm">
                      <div className="flex flex-col">
                        <span>{item[idColumn]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-sm">
                      <span className="font-medium text-slate-900">
                        {item[nameColumn]}
                      </span>
                    </TableCell>
                    {extraColumn && (
                      <TableCell className="py-2 px-3 text-sm">
                        <span className="text-sm">
                          {item[extraColumn] || <span className="text-muted-foreground italic text-xs">-</span>}
                        </span>
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell className="text-right py-2 px-3 text-sm">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(item)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConfirmDelete(item)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredData.length > 0 ? page * pageSize + 1 : 0} a{" "}
            {Math.min((page + 1) * pageSize, filteredData.length)} de{" "}
            {filteredData.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page + 1} de {Math.max(1, totalPages)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* CRUD Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Editar ${labels.title}` : `Nuevo ${labels.title}`}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del registro maestro. Haga clic en guardar al finalizar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="id">{labels.id}</Label>
                <Input
                  id="id"
                  required
                  disabled={!!selectedItem}
                  value={formData[idColumn] || ""}
                  onChange={(e) => setFormData({ ...formData, [idColumn]: e.target.value })}
                  placeholder={`Ej. ${tableName.split("_")[1].toUpperCase()}_01`}
                  className="border-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{labels.name}</Label>
                <Input
                  id="name"
                  required
                  value={formData[nameColumn] || ""}
                  onChange={(e) => setFormData({ ...formData, [nameColumn]: e.target.value })}
                  placeholder={`Nombre de ${labels.title.toLowerCase()}`}
                  className="border-slate-200"
                />
              </div>
              {extraColumn && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="extra">{labels.extra}</Label>
                  <Input
                    id="extra"
                    value={formData[extraColumn] || ""}
                    onChange={(e) => setFormData({ ...formData, [extraColumn]: e.target.value })}
                    placeholder={labels.extra}
                    className="border-slate-200"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="border-slate-200"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro <strong>{selectedItem?.[nameColumn]}</strong> de forma
              permanente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(selectedItem[idColumn])}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar registro"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
