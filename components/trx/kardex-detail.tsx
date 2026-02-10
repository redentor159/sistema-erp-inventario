
"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface KardexDetailProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: any
}

// Helper to render key-value pairs
const DetailRow = ({ label, value, className = "" }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={`grid grid-cols-3 gap-4 py-2 border-b last:border-0 ${className}`}>
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
        <span className="col-span-2 text-sm break-words">{value || <span className="text-muted-foreground italic">N/A</span>}</span>
    </div>
)

export function KardexDetail({ open, onOpenChange, data }: KardexDetailProps) {
    if (!data) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <span>Detalle de Movimiento</span>
                        <Badge variant="outline">{data.tipo_movimiento}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        ID: {data.id_movimiento}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-0">
                    <div className="space-y-6">
                        {/* Section 1: General Info */}
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Información General</h4>
                            <div className="bg-muted/30 rounded-lg p-3 border">
                                <DetailRow label="Fecha y Hora" value={data.fecha_hora ? format(new Date(data.fecha_hora), "dd/MM/yyyy HH:mm:ss", { locale: es }) : null} />
                                <DetailRow label="Tipo Movimiento" value={data.tipo_movimiento} />
                                <DetailRow label="Nro. Documento" value={data.nro_documento} />
                                <DetailRow label="Referencia Doc." value={data.referencia_doc} />
                            </div>
                        </div>

                        {/* Section 2: Product & Quantity */}
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Detalle de Producto</h4>
                            <div className="bg-muted/30 rounded-lg p-3 border">
                                <DetailRow label="SKU" value={<span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{data.id_sku}</span>} />
                                <DetailRow label="Producto" value={data.producto_nombre} />
                                <DetailRow label="Familia / Marca" value={`${data.nombre_familia || '-'} / ${data.nombre_marca || '-'}`} />
                                <DetailRow label="Cantidad" value={
                                    <span className={`font-bold ${data.cantidad < 0 ? "text-red-500" : "text-green-600"}`}>
                                        {Number(data.cantidad).toFixed(4)} {data.unidad_medida}
                                    </span>
                                } />
                                <DetailRow label="Costo Unitario" value={data.costo_unit_doc ? `S/ ${Number(data.costo_unit_doc).toFixed(4)}` : '-'} />
                                <DetailRow label="Total PEN" value={data.costo_total_pen ? `S/ ${Number(data.costo_total_pen).toFixed(2)}` : '-'} />
                            </div>
                        </div>

                        {/* Section 3: Entity & Logistics */}
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Entidad y Logística</h4>
                            <div className="bg-muted/30 rounded-lg p-3 border">
                                <DetailRow label="Entidad" value={data.entidad_nombre} />
                                <DetailRow label="Almacén" value={data.id_almacen} />
                                <DetailRow label="Usuario Registro" value={data.usuario_reg} />
                                <DetailRow label="Comentarios" value={data.comentarios} />
                            </div>
                        </div>

                        {/* Section 4: System Data (Extreme Detail) */}
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Datos de Sistema (Raw)</h4>
                            <div className="bg-slate-950 text-slate-50 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
