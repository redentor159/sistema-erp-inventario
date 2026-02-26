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

            <div className="border rounded-md bg-white dark:bg-gray-800 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-auto">
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
                </div>

                {/* Mobile Cards View (Activity Feed) */}
                <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    {retazos?.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No hay retazos registrados con este filtro.
                        </div>
                    )}
                    {paginatedRetazos?.map((item) => (
                        <div key={item.id_retazo} className="p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Recycle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">{item.sku_nombre}</h4>
                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.id_sku_padre}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <Badge variant={
                                        item.estado === 'DISPONIBLE' ? 'default' :
                                            item.estado === 'USADO' ? 'secondary' : 'outline'
                                    } className={`text-[10px] px-2 py-0.5
                                        ${item.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                        ${item.estado === 'ASIGNADO' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}
                                        ${item.estado === 'USADO' ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through' : ''}
                                    `}>
                                        {item.estado}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs mt-1 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-md border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Ubicación</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.ubicacion || '-'}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Longitud</span>
                                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{item.longitud_mm} mm</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800 mt-1 pt-3">
                                <span className="text-[10px] text-muted-foreground">
                                    Creado: {format(new Date(item.fecha_creacion), "dd/MM/yy", { locale: es })}
                                </span>

                                {item.estado !== 'USADO' ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-green-200 hover:bg-green-50 text-green-700 bg-green-50/50 px-4"
                                        onClick={() => handleConsume(item.id_retazo)}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Consumir
                                    </Button>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground flex items-center font-medium bg-gray-100 px-2 py-1 rounded">
                                        <CheckCircle2 className="w-3 h-3 mr-1 text-gray-500" />
                                        {item.fecha_consumo ? format(new Date(item.fecha_consumo), "dd/MM", { locale: es }) : "Consumido"}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

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
