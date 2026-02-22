
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

export function SalidaList({ active }: { active: boolean }) {
    const [search, setSearch] = useState("")

    const { data: salidas, isLoading } = useQuery({
        queryKey: ["trxSalidas", { search }],
        queryFn: () => trxApi.getSalidas({ search }),
        enabled: active
    })

    const [open, setOpen] = useState(false)
    const [selectedSalida, setSelectedSalida] = useState<any>(null)

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

            <div className="border rounded-md bg-white dark:bg-gray-800">
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
                        {salidas?.map((sal: any) => (
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
        </div>
    )
}
