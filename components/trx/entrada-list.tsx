
"use client"

import { useQuery } from "@tanstack/react-query"
import { trxApi } from "@/lib/api/trx"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Search, Truck, ArrowDownRight } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { EntradaFormCmp } from "./entrada-form"
import { EntradaDetail } from "./entrada-detail"
import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function EntradaList({ active }: { active: boolean }) {
    const [search, setSearch] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'fecha_registro', direction: 'desc' })

    const { data: entradas, isLoading } = useQuery({
        queryKey: ["trxEntradas", search],
        queryFn: () => trxApi.getEntradas({ search }),
        enabled: active
    })

    const [open, setOpen] = useState(false)
    const [selectedEntrada, setSelectedEntrada] = useState<any>(null)

    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)

    // SORTING LOGIC
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedEntradas = React.useMemo(() => {
        if (!entradas) return []
        const sorted = [...entradas]
        if (sortConfig) {
            sorted.sort((a, b) => {
                // Handle nested properties if needed, e.g. provider name
                let valA = a[sortConfig.key]
                let valB = b[sortConfig.key]

                if (sortConfig.key === 'proveedor') {
                    valA = a.mst_proveedores?.razon_social || ''
                    valB = b.mst_proveedores?.razon_social || ''
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }
        return sorted
    }, [entradas, sortConfig])

    const totalPages = Math.ceil((sortedEntradas?.length || 0) / pageSize)
    const paginatedEntradas = sortedEntradas?.slice(page * pageSize, (page + 1) * pageSize)

    if (isLoading && active) return <div className="p-8 text-center text-muted-foreground">Cargando entradas...</div>

    return (
        <div className="space-y-4">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 items-center">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Registro de Compras (Entradas)</h3>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-[250px] bg-white rounded-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proveedor, documento..."
                            className="pl-8 bg-transparent"
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
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Entrada
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Registrar Entrada de Mercadería</DialogTitle>
                                <DialogDescription>
                                    Ingrese los detalles de la factura de compra o guía de remisión.
                                </DialogDescription>
                            </DialogHeader>
                            <EntradaFormCmp onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <EntradaDetail
                open={!!selectedEntrada}
                headerInfo={selectedEntrada}
                onOpenChange={(open) => !open && setSelectedEntrada(null)}
                id={selectedEntrada?.id_entrada}
            />

            <div className="border rounded-md bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('fecha_registro')}
                            >
                                Fecha {sortConfig?.key === 'fecha_registro' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('tipo_entrada')}
                            >
                                Tipo {sortConfig?.key === 'tipo_entrada' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('proveedor')}
                            >
                                Proveedor {sortConfig?.key === 'proveedor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('nro_documento_fisico')}
                            >
                                Documento {sortConfig?.key === 'nro_documento_fisico' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead>Moneda</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedEntradas?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No se encontraron entradas con los filtros actuales.
                                </TableCell>
                            </TableRow>
                        )}
                        {paginatedEntradas?.map((ent: any) => (
                            <TableRow key={ent.id_entrada} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEntrada(ent)}>
                                <TableCell>{format(new Date(ent.fecha_registro), "dd/MM/yyyy", { locale: es })}</TableCell>
                                <TableCell>{ent.tipo_entrada}</TableCell>
                                <TableCell className="font-medium">{ent.mst_proveedores?.razon_social || "Sin Proveedor"}</TableCell>
                                <TableCell>{ent.nro_documento_fisico || "-"}</TableCell>
                                <TableCell>{ent.moneda}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        ent.estado === 'INGRESADO' ? 'default' :
                                            ent.estado === 'BORRADOR' ? 'outline' : 'secondary'
                                    } className={
                                        ent.estado === 'INGRESADO' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : ''
                                    }>
                                        {ent.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedEntrada(ent)
                                    }}>
                                        Ver Detalle
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {sortedEntradas && sortedEntradas.length > 0 ? (page * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, sortedEntradas?.length || 0)} de {sortedEntradas?.length || 0}
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
        </div>
    )
}
