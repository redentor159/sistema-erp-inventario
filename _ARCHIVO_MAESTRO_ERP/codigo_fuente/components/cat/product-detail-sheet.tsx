
"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function ProductDetailSheet({ product, children }: { product: any, children: React.ReactNode }) {
    if (!product) return <>{children}</>

    const stock = Number(product.stock_actual) || 0
    const inversion = Number(product.inversion_total) || 0
    const pmp = Number(product.costo_promedio) || 0
    const isNegative = stock < 0

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{product.id_sku}</SheetTitle>
                    <SheetDescription>
                        {product.nombre_completo}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* STATUS CARD */}
                    <div className={`p-4 rounded-lg border ${isNegative ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stock Actual</p>
                                <p className={`text-2xl font-bold ${isNegative ? 'text-red-700' : 'text-green-700'}`}>
                                    {stock.toLocaleString('es-PE')} <span className="text-sm font-normal">{product.unidad_medida}</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Valorizado (PEN)</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {inversion.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* DETALLES MAESTROS */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Ficha Técnica</h3>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Familia</p>
                                <p>{product.nombre_familia}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Sistema</p>
                                <p className="font-medium">{product.sistema_nombre || product.id_sistema || '-'}</p>
                            </div>

                            {/* EQUIVALENCIAS TABLE */}
                            {product.id_sistema && (
                                <div className="col-span-2 border rounded-md p-2 bg-muted/20 mt-2">
                                    <p className="text-xs font-semibold mb-2">Equivalencias del Sistema ({product.id_sistema})</p>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Corrales</span>
                                            <span className="font-mono">{product.cod_corrales || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Eduholding</span>
                                            <span className="font-mono">{product.cod_eduholding || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">HPD</span>
                                            <span className="font-mono">{product.cod_hpd || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Limatambo</span>
                                            <span className="font-mono">{product.cod_limatambo || '-'}</span>
                                        </div>
                                    </div>
                                    {product.sistema_uso && (
                                        <div className="mt-2 text-xs italic text-muted-foreground">
                                            Uso: {product.sistema_uso}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <p className="text-muted-foreground">Marca</p>
                                <p>{product.nombre_marca}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Cod. Proveedor</p>
                                <p className="font-mono">{product.cod_proveedor || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Sistema / Serie</p>
                                <p className="font-medium">{product.id_sistema || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Largo Estándar</p>
                                <p>{product.largo_estandar_mm ? `${Number(product.largo_estandar_mm).toLocaleString()} mm` : '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Peso Teórico</p>
                                <p>{product.peso_teorico_kg ? `${Number(product.peso_teorico_kg).toFixed(3)} Kg/m` : '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Costo PMP Unitario</p>
                                <p>{pmp.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</p>
                            </div>
                        </div>
                        {product.imagen_ref && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Referencia Visual</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={product.imagen_ref}
                                    alt="Referencia"
                                    className="rounded-md w-full h-auto object-cover border bg-white"
                                />
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* ACTIONS ?? (Future: Ver Movimientos) */}
                    <div>
                        <h3 className="font-semibold text-sm mb-2">Acciones Rápidas</h3>
                        <p className="text-xs text-muted-foreground">
                            Aquí podrías ver los últimos 5 movimientos o ir directo al Kardex filtrado por este SKU.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
