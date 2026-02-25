
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { catApi } from "@/lib/api/cat"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Search, ImageIcon } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { PlantillaForm } from "./plantilla-form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function PlantillaList() {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const { data: plantillas, isLoading } = useQuery({
        queryKey: ["catPlantillas"],
        queryFn: catApi.getPlantillas
    })

    const [search, setSearch] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingPlantilla, setEditingPlantilla] = useState<any>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteDTOpen, setDeleteDTOpen] = useState(false)

    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)

    const deleteMutation = useMutation({
        mutationFn: catApi.deletePlantilla,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catPlantillas"] })
            toast({ title: "Plantilla eliminada correctamente", variant: "default" })
            setDeletingId(null)
            setDeleteDTOpen(false)
        },
        onError: (error) => {
            toast({ title: "Error al eliminar plantilla: " + error.message, variant: "destructive" })
            setDeletingId(null)
            setDeleteDTOpen(false)
        }
    })

    const confirmDelete = (id: string) => {
        setDeletingId(id)
        setDeleteDTOpen(true)
    }

    const filteredPlantillas = plantillas?.filter((p: any) =>
        p.nombre_generico.toLowerCase().includes(search.toLowerCase()) ||
        p.mst_familias?.nombre_familia.toLowerCase().includes(search.toLowerCase())
    ) || []

    const totalPages = Math.ceil(filteredPlantillas.length / pageSize)
    const paginatedPlantillas = filteredPlantillas.slice(page * pageSize, (page + 1) * pageSize)

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
                    <span className="text-sm text-muted-foreground hidden md:inline">Mostrar:</span>
                    <Select value={pageSize.toString()} onValueChange={(val) => {
                        setPageSize(Number(val))
                        setPage(0)
                    }}>
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

            <div className="border rounded-md bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Nombre Genérico</TableHead>
                            <TableHead>Familia</TableHead>
                            <TableHead>Sistema</TableHead>
                            <TableHead className="text-right">Largo Estándar</TableHead>
                            <TableHead className="text-right">Peso Teórico</TableHead>
                            <TableHead className="text-center">Ref.</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
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
                                <TableCell colSpan={8} className="text-center h-24">
                                    No se encontraron plantillas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedPlantillas.map((plantilla: any) => (
                                <TableRow key={plantilla.id_plantilla}>
                                    <TableCell className="font-mono text-xs font-medium">{plantilla.id_plantilla}</TableCell>
                                    <TableCell className="font-medium">{plantilla.nombre_generico}</TableCell>
                                    <TableCell>{plantilla.mst_familias?.nombre_familia}</TableCell>
                                    <TableCell>{plantilla.mst_series_equivalencias?.nombre_comercial || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        {plantilla.largo_estandar_mm ? `${Number(plantilla.largo_estandar_mm).toLocaleString()} mm` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {plantilla.peso_teorico_kg ? `${Number(plantilla.peso_teorico_kg).toFixed(3)} Kg/m` : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {plantilla.imagen_ref ? (
                                            <a href={plantilla.imagen_ref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-blue-500" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingPlantilla(plantilla)}
                                            >
                                                <Pencil className="h-4 w-4 text-gray-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => confirmDelete(plantilla.id_plantilla)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {filteredPlantillas.length > 0 ? (page * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, filteredPlantillas.length)} de {filteredPlantillas.length}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
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
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || isLoading}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingPlantilla} onOpenChange={(open) => !open && setEditingPlantilla(null)}>
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
                            Esta acción no se puede deshacer. Eliminará la plantilla permanentemente.
                            Asegúrese de que no haya productos vinculados a esta plantilla antes de eliminarla.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDTOpen(false)}>Cancelar</Button>
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
    )
}
