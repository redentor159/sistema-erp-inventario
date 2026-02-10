
"use client"

import { useQuery } from "@tanstack/react-query"
import { trxApi } from "@/lib/api/trx"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, Package } from "lucide-react"

export function StockList({ active }: { active: boolean }) {
    const { data: stock, isLoading } = useQuery({
        queryKey: ["vwStockRealtime"],
        queryFn: trxApi.getStockRealtime,
        enabled: active
    })

    if (!active) return null

    return (
        <div className="border rounded-md bg-white dark:bg-gray-800">
            {isLoading ? <div className="p-8 text-center">Calculando PMP y Stock en tiempo real...</div> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SKU</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Familia / Marca</TableHead>
                            <TableHead className="text-right">Stock Actual</TableHead>
                            <TableHead className="text-right">PMP (Unit)</TableHead>
                            <TableHead className="text-right">Inversión Total</TableHead>
                            <TableHead className="w-[100px]">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stock?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No hay data de stock disponible.
                                </TableCell>
                            </TableRow>
                        )}
                        {stock?.map((item: any) => {
                            const isNegative = item.stock_actual < 0
                            const isPositive = item.stock_actual > 0
                            const pmp = Number(item.costo_promedio)
                            const inversion = Number(item.inversion_total)

                            // Reglas de color (AppSheet Réplica)
                            // Rojo si < 0
                            // Verde si > 0
                            const rowClass = isNegative ? "bg-red-50 dark:bg-red-900/10" : ""
                            const stockClass = isNegative ? "text-red-600 font-bold" : (isPositive ? "text-green-600 font-bold" : "text-gray-500")

                            return (
                                <TableRow key={item.id_sku} className={rowClass}>
                                    <TableCell className="font-mono text-xs font-medium">
                                        {item.id_sku}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.nombre_completo}</span>
                                            <span className="text-xs text-muted-foreground">{item.unidad_medida}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span>{item.nombre_familia}</span>
                                            <span className="text-muted-foreground">{item.nombre_marca}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right text-lg ${stockClass}`}>
                                        {Number(item.stock_actual).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs">
                                        {pmp.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {inversion.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                    </TableCell>
                                    <TableCell>
                                        {isNegative && (
                                            <Badge variant="destructive" className="gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Quiebre
                                            </Badge>
                                        )}
                                        {isPositive && (
                                            <Badge variant="outline" className="gap-1 text-green-600 border-green-600 bg-green-50">
                                                <CheckCircle2 className="h-3 w-3" />
                                                OK
                                            </Badge>
                                        )}
                                        {!isPositive && !isNegative && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Package className="h-3 w-3" />
                                                Cero
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
