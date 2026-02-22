"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mstApi } from "@/lib/api/mst"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SupplierFormCmp } from "./supplier-form"

export function SupplierList() {
    const queryClient = useQueryClient()
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["mstProveedores"],
        queryFn: mstApi.getProveedores,
    })

    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
    const [supplierToDelete, setSupplierToDelete] = useState<any>(null)

    const deleteMutation = useMutation({
        mutationFn: mstApi.deleteProveedor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mstProveedores"] })
            alert("Proveedor eliminado correctamente")
            setSupplierToDelete(null)
        },
        onError: (error: Error) => {
            console.error(error)
            alert("Error al eliminar proveedor. Es posible que tenga registros asociados.")
            setSupplierToDelete(null)
        }
    })

    if (isLoading) return <div>Cargando proveedores...</div>

    const filteredSuppliers = suppliers?.filter(s =>
        s.razon_social.toLowerCase().includes(search.toLowerCase()) ||
        s.ruc.includes(search) ||
        (s.nombre_comercial && s.nombre_comercial.toLowerCase().includes(search.toLowerCase()))
    )

    const handleEdit = (supplier: any) => {
        setSelectedSupplier(supplier)
        setOpen(true)
    }

    const handleCreate = () => {
        setSelectedSupplier(null)
        setOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por RUC o Razón Social..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate} className="shadow-sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {selectedSupplier ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedSupplier ? "Modifique los datos comerciales y de contacto del proveedor." : "Registre un nuevo proveedor en el sistema llenando el siguiente formulario."}
                            </DialogDescription>
                        </DialogHeader>
                        <SupplierFormCmp
                            onSuccess={() => setOpen(false)}
                            initialData={selectedSupplier}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-card shadow-sm overflow-hidden pointer-events-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold">RUC</TableHead>
                            <TableHead className="font-semibold">Razón / Nombre Com.</TableHead>
                            <TableHead className="font-semibold">Contacto</TableHead>
                            <TableHead className="font-semibold">Teléfono</TableHead>
                            <TableHead className="font-semibold text-center">Condiciones</TableHead>
                            <TableHead className="text-right font-semibold w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No se encontraron proveedores.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredSuppliers?.map((supplier) => (
                            <TableRow key={supplier.id_proveedor} className="group hover:bg-muted/30">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{supplier.ruc}</span>
                                        <span className="text-[10px] text-muted-foreground">{supplier.id_proveedor}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-primary">{supplier.razon_social}</span>
                                        {supplier.nombre_comercial && (
                                            <span className="text-xs text-muted-foreground">{supplier.nombre_comercial}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{supplier.contacto_vendedor || <span className="text-muted-foreground italic text-xs">Sin asignar</span>}</span>
                                        {supplier.email_pedidos && (
                                            <span className="text-xs text-muted-foreground">{supplier.email_pedidos}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {supplier.telefono_pedidos || <span className="text-muted-foreground italic text-xs">-</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground w-fit">{supplier.moneda_predeterminada}</span>
                                        <span className="text-[10px] text-muted-foreground mt-1">Crédito: {supplier.dias_credito}d</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setSupplierToDelete(supplier)} className="h-8 w-8 text-muted-foreground hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Diálogo de Confirmación para Eliminar */}
            <AlertDialog open={!!supplierToDelete} onOpenChange={() => setSupplierToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al proveedor
                            <strong> {supplierToDelete?.razon_social} </strong> y todos sus datos asociados del servidor.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(supplierToDelete.id_proveedor)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar proveedor"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
