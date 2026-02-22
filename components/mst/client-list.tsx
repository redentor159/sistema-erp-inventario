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
import { Plus, Search, Edit } from "lucide-react"
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
                                {selectedClient ? "Modifique los datos comerciales y de contacto del cliente." : "Ingrese los datos del cliente llenando el siguiente formulario."}
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
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold">RUC</TableHead>
                            <TableHead className="font-semibold">Nombre / Razón Social</TableHead>
                            <TableHead className="font-semibold text-center w-[120px]">Tipo</TableHead>
                            <TableHead className="font-semibold">Contacto</TableHead>
                            <TableHead className="font-semibold">Dirección</TableHead>
                            <TableHead className="text-right font-semibold w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredClients?.map((client) => (
                            <TableRow key={client.id_cliente} className="group hover:bg-muted/30">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{client.ruc}</span>
                                        <span className="text-[10px] text-muted-foreground">{client.id_cliente}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-primary">{client.nombre_completo}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${client.tipo_cliente === 'EMPRESA'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {client.tipo_cliente}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{client.telefono || <span className="text-muted-foreground italic text-xs">Sin teléfono</span>}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm truncate max-w-[200px] block" title={client.direccion_obra_principal || ""}>
                                        {client.direccion_obra_principal || <span className="text-muted-foreground italic text-xs">-</span>}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <Edit className="h-4 w-4" />
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
