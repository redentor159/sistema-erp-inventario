"use client"

import React, { useState } from "react"
import { KardexDetail } from "./kardex-detail"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Filter } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"


export function KardexList({ active }: { active: boolean }) {
    // FILTERS STATE
    const [search, setSearch] = useState("")
    const [tipo, setTipo] = useState("TODOS")
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'fecha_hora', direction: 'desc' })
    const [selectedMovimiento, setSelectedMovimiento] = useState<any>(null)

    // PAGINATION STATE
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)

    // Debounce search could be added here, for now passing directly
    const filters = {
        search,
        tipo: tipo === "TODOS" ? undefined : tipo,
        limit: pageSize,
        offset: page * pageSize
    }

    // QUERY
    const { data: result, isLoading } = useQuery({
        queryKey: ["trxMovimientos", filters], // Add filters to key
        queryFn: () => trxApi.getMovimientos(filters), // Pass filters to API
        enabled: active
    })

    const movimientos = result?.data || []
    const totalCount = result?.count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    const clearFilters = () => {
        setSearch("")
        setTipo("TODOS")
        setPage(0)
    }

    // Reset page when filters change
    React.useEffect(() => {
        setPage(0)
    }, [search, tipo, pageSize])

    // SORTING LOGIC
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedMovimientos = React.useMemo(() => {
        if (!movimientos) return []
        const sorted = [...movimientos]
        if (sortConfig) {
            sorted.sort((a: any, b: any) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1
                }
                return 0
            })
        }
        return sorted
    }, [movimientos, sortConfig])

    return (
        <div className="space-y-4">
            {/* DETAIL MODAL */}
            <KardexDetail
                open={!!selectedMovimiento}
                onOpenChange={(open) => !open && setSelectedMovimiento(null)}
                data={selectedMovimiento}
            />

            {/* FILTER BAR - COMPACT */}
            <div className="flex flex-col md:flex-row gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 items-center justify-between">
                <div className="flex flex-1 gap-2 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por producto..."
                            className="pl-8 bg-white dark:bg-black h-9 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="w-[150px]">
                        <Select value={tipo} onValueChange={setTipo}>
                            <SelectTrigger className="bg-white dark:bg-black h-9 text-sm">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODOS">Todos</SelectItem>
                                <SelectItem value="COMPRA">Compras</SelectItem>
                                <SelectItem value="VENTA">Ventas</SelectItem>
                                <SelectItem value="PRODUCCION">Producción</SelectItem>
                                <SelectItem value="AJUSTE">Ajustes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(search || tipo !== "TODOS") && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9">
                            <X className="mr-2 h-3 w-3" />
                            Limpiar
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Filas por pág:</span>
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                        <SelectTrigger className="h-8 w-[70px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="500">500</SelectItem>
                            <SelectItem value="1000">1000</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* TABLE */}
            <div className="border rounded-md bg-white dark:bg-gray-800 flex flex-col">
                <div className="overflow-auto max-h-[600px]">
                    {isLoading ? <div className="p-12 text-center text-muted-foreground">Cargando movimientos...</div> : (
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow className="h-8">
                                    <TableHead
                                        className="w-[120px] cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('fecha_hora')}
                                    >
                                        Fecha {sortConfig?.key === 'fecha_hora' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead
                                        className="w-[100px] cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('tipo_movimiento')}
                                    >
                                        Tipo {sortConfig?.key === 'tipo_movimiento' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="w-[80px]">SKU</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('producto_nombre')}>
                                        Producto {sortConfig?.key === 'producto_nombre' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead
                                        className="text-right w-[100px] cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('cantidad')}
                                    >
                                        Cant. {sortConfig?.key === 'cantidad' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="w-[50px]">Und</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedMovimientos?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                            No se encontraron movimientos con los filtros actuales.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {sortedMovimientos?.map((mov: any) => (
                                    <TableRow
                                        key={mov.id_movimiento}
                                        className="hover:bg-muted/50 cursor-pointer h-8 border-b"
                                        onClick={() => setSelectedMovimiento(mov)}
                                    >
                                        <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground py-1">
                                            {format(new Date(mov.fecha_hora), "dd/MM/yy HH:mm", { locale: es })}
                                        </TableCell>
                                        <TableCell className="py-1">
                                            <Badge variant={
                                                mov.cantidad > 0 ? "default" :
                                                    mov.tipo_movimiento === 'VENTA' ? "destructive" : "secondary"
                                            } className="text-xs px-2 py-0.5 h-5">
                                                {mov.tipo_movimiento}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono py-1">{mov.id_sku}</TableCell>
                                        <TableCell className="max-w-[300px] py-1" title={mov.producto_nombre}>
                                            <div className="truncate text-sm font-medium leading-tight">{mov.producto_nombre}</div>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold text-sm py-1 ${mov.cantidad < 0 ? "text-red-500" : "text-green-600"}`}>
                                            {Number(mov.cantidad).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-1">{mov.unidad_medida}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* PAGINTAION FOOTER */}
                <div className="border-t p-2 bg-gray-50 flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                        Mostrando {sortedMovimientos.length} de {totalCount} registros
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            disabled={page === 0 || isLoading}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Anterior
                        </Button>
                        <span>Página {page + 1} de {totalPages || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            disabled={page >= totalPages - 1 || isLoading}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
