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
import { SeriesFormCmp } from "./series-form";

export function SeriesList() {
    const queryClient = useQueryClient();
    const { data: series, isLoading } = useQuery({
        queryKey: ["mstSeriesEquivalencias"],
        queryFn: mstApi.getSeriesEquivalencias,
    });

    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedSerie, setSelectedSerie] = useState<any>(null);
    const [serieToDelete, setSerieToDelete] = useState<any>(null);

    const deleteMutation = useMutation({
        mutationFn: mstApi.deleteSerieEquivalencia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mstSeriesEquivalencias"] });
            alert("Sistema eliminado correctamente");
            setSerieToDelete(null);
        },
        onError: (error: Error) => {
            console.error(error);
            alert(
                "Error al eliminar sistema. Es posible que tenga registros asociados.",
            );
            setSerieToDelete(null);
        },
    });

    if (isLoading) return <div>Cargando sistemas...</div>;

    const filteredSeries =
        series?.filter(
            (s) =>
                s.id_sistema.toLowerCase().includes(search.toLowerCase()) ||
                s.nombre_comercial.toLowerCase().includes(search.toLowerCase()),
        ) || [];

    const handleEdit = (serie: any) => {
        setSelectedSerie(serie);
        setOpen(true);
    };

    const handleCreate = () => {
        setSelectedSerie(null);
        setOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por ID o Nombre..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate} className="shadow-sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Sistema
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {selectedSerie
                                    ? "Editar Sistema / Serie"
                                    : "Registrar Nuevo Sistema / Serie"}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedSerie
                                    ? "Modifique los detalles del sistema y equivalencias."
                                    : "Registre un nuevo sistema en el catálogo maestro."}
                            </DialogDescription>
                        </DialogHeader>
                        <SeriesFormCmp
                            onSuccess={() => setOpen(false)}
                            initialData={selectedSerie}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-card shadow-sm overflow-hidden pointer-events-auto">
                <div className="overflow-auto hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold">ID Sistema</TableHead>
                                <TableHead className="font-semibold">Nombre Comercial</TableHead>
                                <TableHead className="font-semibold text-xs whitespace-nowrap">Cod Corrales</TableHead>
                                <TableHead className="font-semibold text-xs whitespace-nowrap">Cod Eduholding</TableHead>
                                <TableHead className="font-semibold text-xs whitespace-nowrap">Cod Limatambo</TableHead>
                                <TableHead className="font-semibold text-xs whitespace-nowrap">Cod HPD</TableHead>
                                <TableHead className="font-semibold">Uso Principal</TableHead>
                                <TableHead className="text-right font-semibold w-[100px]">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSeries?.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center h-24 text-muted-foreground"
                                    >
                                        No se encontraron sistemas.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredSeries?.map((serie: any) => (
                                <TableRow
                                    key={serie.id_sistema}
                                    className="group hover:bg-muted/30"
                                >
                                    <TableCell className="font-medium">
                                        {serie.id_sistema}
                                    </TableCell>
                                    <TableCell>
                                        {serie.nombre_comercial}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {serie.cod_corrales || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {serie.cod_eduholding || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {serie.cod_limatambo || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {serie.cod_hpd || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {serie.uso_principal || <span className="text-muted-foreground italic">-</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(serie)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSerieToDelete(serie)}
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

                {/* Mobile View */}
                <div className="md:hidden flex flex-col divide-y divide-border">
                    {filteredSeries?.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No se encontraron sistemas.
                        </div>
                    )}
                    {filteredSeries?.map((serie: any) => (
                        <div
                            key={serie.id_sistema}
                            className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-primary leading-tight">
                                        {serie.nombre_comercial}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                        ID: {serie.id_sistema}
                                    </p>
                                    {serie.uso_principal && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Uso: {serie.uso_principal}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(serie)}
                                        className="h-8 w-8 text-muted-foreground hover:text-primary bg-muted/20"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSerieToDelete(serie)}
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 bg-muted/20"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md border border-border/40">
                                <div><span className="font-semibold block text-[10px] uppercase">Corrales</span>{serie.cod_corrales || '-'}</div>
                                <div><span className="font-semibold block text-[10px] uppercase">Eduholding</span>{serie.cod_eduholding || '-'}</div>
                                <div><span className="font-semibold block text-[10px] uppercase">Limatambo</span>{serie.cod_limatambo || '-'}</div>
                                <div><span className="font-semibold block text-[10px] uppercase">HPD</span>{serie.cod_hpd || '-'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AlertDialog
                open={!!serieToDelete}
                onOpenChange={() => setSerieToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente
                            el sistema
                            <strong> {serieToDelete?.nombre_comercial} </strong> y todos sus
                            datos asociados. No podrá eliminarlo si hay plantillas asociadas a este sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deleteMutation.mutate(serieToDelete.id_sistema)
                            }
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleteMutation.isPending
                                ? "Eliminando..."
                                : "Sí, eliminar sistema"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
