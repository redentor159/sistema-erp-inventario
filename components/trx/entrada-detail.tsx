"use client"

import { useQuery } from "@tanstack/react-query"
import { trxApi } from "@/lib/api/trx"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface EntradaDetailProps {
    id: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    headerInfo: any
}

export function EntradaDetail({ id, open, onOpenChange, headerInfo }: EntradaDetailProps) {
    const { data: detalles, isLoading } = useQuery({
        queryKey: ["trxEntradaDetalle", id],
        queryFn: () => trxApi.getEntradaDetalles(id!),
        enabled: !!id && open
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalle de Entrada (Compra)</DialogTitle>
                    <DialogDescription>
                        ID: {headerInfo?.id_entrada?.slice(0, 8)}... | Doc: {headerInfo?.nro_documento_fisico}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
                    <div>
                        <span className="font-semibold text-muted-foreground">Fecha Registro:</span>
                        <div className="font-medium">{headerInfo?.fecha_registro ? format(new Date(headerInfo.fecha_registro), 'dd/MM/yyyy HH:mm') : '-'}</div>
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground">Proveedor:</span>
                        <div className="font-medium">{headerInfo?.mst_proveedores?.razon_social || '-'}</div>
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground">Moneda:</span>
                        <div className="font-medium">{headerInfo?.moneda} (TC: {headerInfo?.tipo_cambio})</div>
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground">Estado:</span>
                        <div className="font-medium">{headerInfo?.estado}</div>
                    </div>
                    <div className="col-span-4">
                        <span className="font-semibold text-muted-foreground">Comentarios:</span>
                        <div>{headerInfo?.comentarios || '-'}</div>
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cod. Prov</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Costo Unit.</TableHead>
                                <TableHead className="text-right">Total Linea</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : detalles?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        No hay items registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                detalles?.map((item: any) => (
                                    <TableRow key={item.id_linea_entrada}>
                                        <TableCell>
                                            <div className="font-medium">{item.cat_productos_variantes?.nombre_completo}</div>
                                            <div className="text-xs text-muted-foreground">{item.cat_productos_variantes?.unidad_medida}</div>
                                        </TableCell>
                                        <TableCell>{item.cat_productos_variantes?.cod_proveedor || '-'}</TableCell>
                                        <TableCell className="text-right">{Number(item.cantidad).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{item.costo_unitario?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-medium">{item.total_linea?.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog >
    )
}
