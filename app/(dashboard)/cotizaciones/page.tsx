import { Suspense } from "react"
import { Metadata } from "next"
import { CotizacionesList } from "@/components/trx/cotizaciones-list"

export const metadata: Metadata = {
    title: "Cotizaciones | ERP Vidriería",
    description: "Gestión de Cotizaciones y Despiece",
}

export default function CotizacionesPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
                    <p className="text-muted-foreground">
                        Gestiona presupuestos y genera despiece automático de materiales.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div>Cargando cotizaciones...</div>}>
                <CotizacionesList />
            </Suspense>
        </div>
    )
}
