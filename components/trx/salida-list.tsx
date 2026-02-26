
"use client"

import { useQuery } from "@tanstack/react-query"
import { trxApi } from "@/lib/api/trx" // Note: Need to add getSalidas to api
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
import { Plus, Search, LogOut } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SalidaFormCmp } from "./salida-form"
import { SalidaDetail } from "./salida-detail"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function SalidaList({ active }: { active: boolean }) {
    const [search, setSearch] = useState("")

    const { data: salidas, isLoading } = useQuery({
        queryKey: ["trxSalidas", { search }],
        queryFn: () => trxApi.getSalidas({ search }),
        enabled: active
    })

    const [open, setOpen] = useState(false)
    const [selectedSalida, setSelectedSalida] = useState<any>(null)

    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(100)

    const totalPages = Math.ceil((salidas?.length || 0) / pageSize)
    const paginatedSalidas = salidas?.slice(page * pageSize, (page + 1) * pageSize)

    return (
        <div className="space-y-4">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 items-center">
                <div className="flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-lg">Registro de Salidas (Ventas/Consumos)</h3>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-[250px] bg-white rounded-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar destinatario, tipo..."
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
                            <Button variant="destructive">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Salida
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Registrar Salida de Material</DialogTitle>
                                <DialogDescription>
                                    Ventas, Bajas de Producción o Ajustes negativos.
                                </DialogDescription>
                            </DialogHeader>
                            <SalidaFormCmp onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <SalidaDetail
                open={!!selectedSalida}
                headerInfo={selectedSalida}
                onOpenChange={(open) => !open && setSelectedSalida(null)}
                id={selectedSalida?.id_salida}
            />

            <div className="border rounded-md bg-white dark:bg-gray-800 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Destinatario</TableHead>
                                <TableHead>Comentario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salidas?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No hay salidas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginatedSalidas?.map((sal: any) => (
                                <TableRow key={sal.id_salida} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSalida(sal)}>
                                    <TableCell>{format(new Date(sal.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{sal.tipo_salida}</Badge>
                                    </TableCell>
                                    <TableCell>{sal.mst_clientes?.nombre_completo || sal.id_destinatario || "-"}</TableCell>
                                    <TableCell>{sal.comentario}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            sal.estado === 'CONFIRMADO' ? 'default' : // Greenish usually if customized or we use explicit class
                                                sal.estado === 'BORRADOR' ? 'outline' : 'secondary'
                                        } className={
                                            sal.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : ''
                                        }>
                                            {sal.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedSalida(sal)
                                        }}>
                                            Ver Detalle
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards View (Activity Feed) */}
                <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    {salidas?.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No hay salidas registradas.
                        </div>
                    )}
                    {paginatedSalidas?.map((sal: any) => (
                        <div key={sal.id_salida} className="p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => setSelectedSalida(sal)}>
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <LogOut className="h-4 w-4 text-red-600 dark:text-red-400 ml-[-2px]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">{sal.mst_clientes?.nombre_completo || sal.id_destinatario || "Destino No Especificado"}</h4>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] font-mono bg-white dark:bg-gray-900 text-gray-500 uppercase px-1.5 py-0">
                                                {sal.tipo_salida}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <Badge variant={
                                        sal.estado === 'CONFIRMADO' ? 'default' :
                                            sal.estado === 'BORRADOR' ? 'outline' : 'secondary'
                                    } className={
                                        sal.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 text-[10px] px-2 py-0.5' : 'text-[10px] px-2 py-0.5'
                                    }>
                                        {sal.estado}
                                    </Badge>
                                </div>
                            </div>

                            {sal.comentario && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {sal.comentario}
                                </p>
                            )}

                            <div className="flex justify-between items-center text-xs mt-1 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-md border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Fecha Salida</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{format(new Date(sal.fecha), "dd/MM/yyyy", { locale: es })}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {salidas && salidas.length > 0 ? (page * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, salidas?.length || 0)} de {salidas?.length || 0}
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
