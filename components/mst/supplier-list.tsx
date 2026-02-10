
"use client"

import { useQuery } from "@tanstack/react-query"
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
import { Plus, Search } from "lucide-react"
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
import { SupplierFormCmp } from "./supplier-form"

export function SupplierList() {
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["mstProveedores"],
        queryFn: mstApi.getProveedores,
    })

    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

    if (isLoading) return <div>Cargando proveedores...</div>

    const filteredSuppliers = suppliers?.filter(s =>
        s.razon_social.toLowerCase().includes(search.toLowerCase()) ||
        s.ruc.includes(search)
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
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar proveedores..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{selectedSupplier ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}</DialogTitle>
                            <DialogDescription>
                                {selectedSupplier ? "Modifique los datos del proveedor." : "Registre un nuevo proveedor en el sistema."}
                            </DialogDescription>
                        </DialogHeader>
                        <SupplierFormCmp
                            onSuccess={() => setOpen(false)}
                            initialData={selectedSupplier}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>RUC</TableHead>
                            <TableHead>Razón Social</TableHead>
                            <TableHead>Moneda</TableHead>
                            <TableHead>Días Crédito</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No se encontraron proveedores.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredSuppliers?.map((supplier) => (
                            <TableRow key={supplier.id_proveedor} className="group hover:bg-muted/50">
                                <TableCell className="font-medium">{supplier.id_proveedor}</TableCell>
                                <TableCell>{supplier.ruc}</TableCell>
                                <TableCell>{supplier.razon_social}</TableCell>
                                <TableCell>{supplier.moneda_predeterminada}</TableCell>
                                <TableCell>{supplier.dias_credito}</TableCell>
                                <TableCell>{supplier.email_pedidos || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                                        Editar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
