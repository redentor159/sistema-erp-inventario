"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Recycle, Trash2, CheckCircle2, AlertCircle } from "lucide-react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { retazosApi } from "@/lib/api/retazos"
import { RetazoForm } from "./retazo-form"

export function RetazosList() {
    const [filterEstado, setFilterEstado] = useState("TODOS")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)
    const queryClient = useQueryClient()

    const { data: retazos, isLoading } = useQuery({
        queryKey: ["retazos", filterEstado],
        queryFn: () => retazosApi.getRetazos({ estado: filterEstado })
    })

    const consumeMutation = useMutation({
        mutationFn: retazosApi.consumirRetazo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["retazos"] })
            alert("Retazo consumido exitosamente")
        },
        onError: (err) => alert("Error al consumir: " + err.message)
    })

    const handleConsume = (id: string) => {
        if (confirm("¿Confirmar que este retazo ha sido utilizado?")) {
            consumeMutation.mutate(id)
        }
    }

    const totalPages = Math.ceil((retazos?.length || 0) / pageSize)
    const paginatedRetazos = retazos?.slice(page * pageSize, (page + 1) * pageSize)

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 items-center">
                <div className="flex items-center gap-2">
                    <Recycle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-lg">Control de Retazos</h3>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">Todos</SelectItem>
                            <SelectItem value="DISPONIBLE">Disponibles</SelectItem>
                            <SelectItem value="ASIGNADO">Asignados</SelectItem>
                            <SelectItem value="USADO">Usados</SelectItem>
                        </SelectContent>
                    </Select>

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

                    <Button onClick={() => setIsFormOpen(true)}>
                        + Nuevo Retazo
                    </Button>
                </div>
            </div>

            <div className="border rounded-md bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha Crea.</TableHead>
                            <TableHead>Perfil / SKU</TableHead>
                            <TableHead className="text-right">Longitud</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {retazos?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No hay retazos registrados con este filtro.
                                </TableCell>
                            </TableRow>
                        )}
                        {paginatedRetazos?.map((item) => (
                            <TableRow key={item.id_retazo}>
                                <TableCell className="text-xs text-muted-foreground">
                                    {format(new Date(item.fecha_creacion), "dd/MM/yy", { locale: es })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{item.sku_nombre}</span>
                                        <span className="text-xs text-muted-foreground">{item.id_sku_padre}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold">
                                    {item.longitud_mm} mm
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.ubicacion || '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        item.estado === 'DISPONIBLE' ? 'default' :
                                            item.estado === 'USADO' ? 'secondary' : 'outline'
                                    } className={`
                                        ${item.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                        ${item.estado === 'ASIGNADO' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}
                                        ${item.estado === 'USADO' ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through' : ''}
                                    `}>
                                        {item.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.estado !== 'USADO' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs border-green-200 hover:bg-green-50 text-green-700"
                                            onClick={() => handleConsume(item.id_retazo)}
                                            title="Consumir Retazo"
                                        >
                                            Consumir
                                        </Button>
                                    )}
                                    {item.estado === 'USADO' && (
                                        <span className="text-xs text-muted-foreground">
                                            {item.fecha_consumo ? format(new Date(item.fecha_consumo), "dd/MM", { locale: es }) : "Consumido"}
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {retazos && retazos.length > 0 ? (page * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, retazos?.length || 0)} de {retazos?.length || 0}
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

            <RetazoForm open={isFormOpen} onOpenChange={setIsFormOpen} />
        </div>
    )
}
