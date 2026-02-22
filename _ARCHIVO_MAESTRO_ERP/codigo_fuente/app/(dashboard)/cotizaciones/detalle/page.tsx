"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CotizacionDetail } from "@/components/trx/cotizacion-detail"

function CotizacionDetailInner() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    if (!id) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No se especificó una cotización. Vuelve a la lista de cotizaciones.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <CotizacionDetail id={id} />
        </div>
    )
}

export default function CotizacionDetallePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64">Cargando...</div>}>
            <CotizacionDetailInner />
        </Suspense>
    )
}
