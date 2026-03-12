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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200/60 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={`Buscar por ${labels.name}...`}
            className="pl-9 h-10 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Mostrar:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[80px] h-10 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <Button onClick={() => handleOpenForm()} className="h-10 px-4">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100/80">
                <TableHead
                  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort(idColumn)}
                >
                  <div className="flex items-center gap-1">
                    {labels.id}
                    {sortConfig?.key === idColumn && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </div>
                </TableHead>
                <TableHead
                  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort(nameColumn)}
                >
                  <div className="flex items-center gap-1">
                    {labels.name}
                    {sortConfig?.key === nameColumn && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </div>
                </TableHead>
                {extraColumn && (
                  <TableHead
                    className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort(extraColumn)}
                  >
                    <div className="flex items-center gap-1">
                      {labels.extra}
                      {sortConfig?.key === extraColumn && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </div>
                  </TableHead>
                )}
                {isAdmin && <TableHead className="py-3 px-4 text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={extraColumn ? 4 : 3} className="h-32 text-center text-slate-400">
                    No se encontraron registros.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow
                    key={item[idColumn]}
                    className="hover:bg-slate-50/50 border-b border-slate-100/80 transition-colors"
                  >
                    <TableCell className="py-3 px-4 text-sm font-mono text-slate-500">
                      {item[idColumn]}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm font-medium text-slate-900">
                      {item[nameColumn]}
                    </TableCell>
                    {extraColumn && (
                      <TableCell className="py-3 px-4 text-sm text-slate-600">
                        {item[extraColumn] || <span className="text-slate-300 italic">-</span>}
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(item)}
                            className="h-8 w-8 text-slate-400 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConfirmDelete(item)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
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
        <div className="bg-slate-50/30 px-4 py-3 flex items-center justify-between border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Mostrando <span className="font-medium">{paginatedData.length}</span> de{" "}
            <span className="font-medium">{filteredData.length}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="h-8 text-xs font-medium border-slate-200"
            >
              Anterior
            </Button>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600">
              {page + 1} / {Math.max(1, totalPages)}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="h-8 text-xs font-medium border-slate-200"
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
