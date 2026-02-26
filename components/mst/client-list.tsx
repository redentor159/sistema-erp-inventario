"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mstApi } from "@/lib/api/mst";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ClientFormCmp } from "./client-form";

export function ClientList() {
  const queryClient = useQueryClient();
  const { data: clients, isLoading } = useQuery({
    queryKey: ["mstClientes"],
    queryFn: mstApi.getClientes,
  });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  const deleteMutation = useMutation({
    mutationFn: mstApi.deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mstClientes"] });
      alert("Cliente eliminado correctamente");
      setClientToDelete(null);
    },
    onError: (error: Error) => {
      console.error(error);
      alert(
        "Error al eliminar cliente. Es posible que tenga cotizaciones o registros asociados.",
      );
      setClientToDelete(null);
    },
  });

  if (isLoading) return <div>Cargando clientes...</div>;

  const filteredClients =
    clients?.filter(
      (c) =>
        c.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
        c.ruc.includes(search),
    ) || [];

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por RUC o Nombre..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
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
            <Button onClick={handleCreate} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedClient ? "Editar Cliente" : "Registrar Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {selectedClient
                  ? "Modifique los datos comerciales y de contacto del cliente."
                  : "Ingrese los datos del cliente llenando el siguiente formulario."}
              </DialogDescription>
            </DialogHeader>
            <ClientFormCmp
              onSuccess={() => setOpen(false)}
              initialData={selectedClient}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card shadow-sm overflow-hidden pointer-events-auto">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">RUC</TableHead>
                <TableHead className="font-semibold">
                  Nombre / Razón Social
                </TableHead>
                <TableHead className="font-semibold text-center w-[120px]">
                  Tipo
                </TableHead>
                <TableHead className="font-semibold">Contacto</TableHead>
                <TableHead className="font-semibold">Dirección</TableHead>
                <TableHead className="text-right font-semibold w-[100px]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
              {paginatedClients?.map((client: any) => (
                <TableRow
                  key={client.id_cliente}
                  className="group hover:bg-muted/30"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{client.ruc}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {client.id_cliente}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-primary">
                      {client.nombre_completo}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                          client.tipo_cliente === "EMPRESA"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {client.tipo_cliente}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {client.telefono || (
                          <span className="text-muted-foreground italic text-xs">
                            Sin teléfono
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm truncate max-w-[200px] block"
                      title={client.direccion_obra_principal || ""}
                    >
                      {client.direccion_obra_principal || (
                        <span className="text-muted-foreground italic text-xs">
                          -
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setClientToDelete(client)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View (Contact List) */}
        <div className="md:hidden flex flex-col divide-y divide-border">
          {filteredClients?.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No se encontraron clientes.
            </div>
          )}
          {paginatedClients?.map((client: any) => (
            <div
              key={client.id_cliente}
              className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-primary leading-tight">
                    {client.nombre_completo}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono bg-background text-muted-foreground px-1.5 py-0"
                    >
                      RUC: {client.ruc}
                    </Badge>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${client.tipo_cliente === "EMPRESA" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}
                    >
                      {client.tipo_cliente}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(client)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary bg-muted/20"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setClientToDelete(client)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 bg-muted/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-1 bg-muted/30 p-2.5 rounded-md border border-border/40">
                <div className="flex items-start gap-2">
                  <span className="font-semibold w-14 uppercase text-[9px] tracking-wider mt-0.5 text-foreground/60">
                    Teléfono:
                  </span>
                  <span className="font-medium text-foreground">
                    {client.telefono || (
                      <span className="italic font-normal opacity-50">
                        Sin teléfono
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold w-14 uppercase text-[9px] tracking-wider mt-0.5 text-foreground/60">
                    Dirección:
                  </span>
                  <span className="leading-snug">
                    {client.direccion_obra_principal || (
                      <span className="italic font-normal opacity-50">-</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredClients.length > 0 ? page * pageSize + 1 : 0} a{" "}
            {Math.min((page + 1) * pageSize, filteredClients.length)} de{" "}
            {filteredClients.length}
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

      {/* Diálogo de Confirmación para Eliminar */}
      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={() => setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al cliente{" "}
              <strong>{clientToDelete?.nombre_completo}</strong>{" "}
              sistemáticamente. Si el cliente tiene cotizaciones activas, esta
              acción será rechazada por seguridad de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(clientToDelete.id_cliente)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending
                ? "Eliminando..."
                : "Sí, eliminar cliente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
