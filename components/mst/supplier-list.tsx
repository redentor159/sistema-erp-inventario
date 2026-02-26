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
import { Badge } from "@/components/ui/badge"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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

    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)

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
    ) || []

    const totalPages = Math.ceil(filteredSuppliers.length / pageSize)
    const paginatedSuppliers = filteredSuppliers.slice(page * pageSize, (page + 1) * pageSize)

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
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-auto">
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
                            {paginatedSuppliers?.map((supplier: any) => (
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

                {/* Mobile Cards View (Contact List) */}
                <div className="md:hidden flex flex-col divide-y divide-border">
                    {filteredSuppliers?.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No se encontraron proveedores.
                        </div>
                    )}
                    {paginatedSuppliers?.map((supplier: any) => (
                        <div key={supplier.id_proveedor} className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-primary leading-tight">{supplier.razon_social}</h4>
                                    {supplier.nombre_comercial && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{supplier.nombre_comercial}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <Badge variant="outline" className="text-[10px] font-mono bg-background text-muted-foreground px-1.5 py-0">
                                            RUC: {supplier.ruc}
                                        </Badge>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                                            {supplier.moneda_predeterminada}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)} className="h-8 w-8 text-muted-foreground hover:text-primary bg-muted/20">
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setSupplierToDelete(supplier)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 bg-muted/20">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-1 bg-muted/30 p-2.5 rounded-md border border-border/40">
                                <div className="flex items-start gap-2">
                                    <span className="font-semibold w-16 uppercase text-[9px] tracking-wider mt-0.5 text-foreground/60">Cont. Ventas:</span>
                                    <span className="font-medium text-foreground">{supplier.contacto_vendedor || <span className="italic font-normal opacity-50">Sin asignar</span>}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-semibold w-16 uppercase text-[9px] tracking-wider mt-0.5 text-foreground/60">Teléfono:</span>
                                    <span className="font-medium text-foreground">{supplier.telefono_pedidos || <span className="italic font-normal opacity-50">-</span>}</span>
                                </div>
                                {supplier.email_pedidos && (
                                    <div className="flex items-start gap-2 mt-1 pt-1 border-t border-border/40">
                                        <span className="font-semibold w-16 uppercase text-[9px] tracking-wider mt-0.5 text-foreground/60">Email:</span>
                                        <span className="truncate">{supplier.email_pedidos}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {filteredSuppliers.length > 0 ? (page * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, filteredSuppliers.length)} de {filteredSuppliers.length}
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
