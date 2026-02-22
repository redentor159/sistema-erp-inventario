
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
import { ClientFormCmp } from "./client-form"

export function ClientList() {
    const { data: clients, isLoading } = useQuery({
        queryKey: ["mstClientes"],
        queryFn: mstApi.getClientes,
    })

    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<any>(null)

    if (isLoading) return <div>Cargando clientes...</div>

    const filteredClients = clients?.filter(c =>
        c.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
        c.ruc.includes(search)
    )

    const handleEdit = (client: any) => {
        setSelectedClient(client)
        setOpen(true)
    }

    const handleCreate = () => {
        setSelectedClient(null)
        setOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar clientes..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{selectedClient ? "Editar Cliente" : "Registrar Nuevo Cliente"}</DialogTitle>
                            <DialogDescription>
                                {selectedClient ? "Modifique los datos del cliente." : "Ingrese los datos del cliente en el sistema."}
                            </DialogDescription>
                        </DialogHeader>
                        <ClientFormCmp
                            onSuccess={() => setOpen(false)}
                            initialData={selectedClient}
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
                            <TableHead>Nombre / Razón Social</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredClients?.map((client) => (
                            <TableRow key={client.id_cliente} className="group hover:bg-muted/50">
                                <TableCell className="font-medium">{client.id_cliente}</TableCell>
                                <TableCell>{client.ruc}</TableCell>
                                <TableCell>{client.nombre_completo}</TableCell>
                                <TableCell>{client.tipo_cliente}</TableCell>
                                <TableCell>{client.telefono || "-"}</TableCell>
                                <TableCell>{client.direccion_obra_principal || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
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
